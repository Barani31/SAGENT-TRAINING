package com.example.seatbookingsystem.service;

import com.example.seatbookingsystem.dto.ShowSlotRequest;
import com.example.seatbookingsystem.entity.*;
import com.example.seatbookingsystem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShowSlotService {

    private final ShowSlotRepository     showSlotRepository;
    private final EventRepository        eventRepository;
    private final LocationRepository     locationRepository;
    private final SeatRepository         seatRepository;
    private final SeatSlotRepository     seatSlotRepository;
    private final ReservationRepository  reservationRepository;
    private final ReservedSeatRepository reservedSeatRepository;
    private final CancellationRepository cancellationRepository;
    private final TransactionRepository  transactionRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService           emailService;

    public ShowSlot createSlot(ShowSlotRequest req) {
        Event    event    = eventRepository.findById(req.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found: " + req.getEventId()));
        Location location = locationRepository.findById(req.getLocationId())
                .orElseThrow(() -> new RuntimeException("Location not found: " + req.getLocationId()));

        ShowSlot slot = showSlotRepository.save(ShowSlot.builder()
                .event(event).location(location)
                .showDate(req.getShowDate()).startTime(req.getStartTime()).endTime(req.getEndTime())
                .seatsLeft(req.getSeatsLeft() != null ? req.getSeatsLeft() : location.getTotalSeats())
                .slotStatus("AVAILABLE").build());

        for (Seat seat : seatRepository.findByLocation_LocationId(location.getLocationId())) {
            seatSlotRepository.save(SeatSlot.builder()
                    .slot(slot).seat(seat)
                    .price(seat.getBasePrice())
                    .availability("AVAILABLE").build());
        }
        return slot;
    }

    public List<ShowSlot> getAllSlots()               { return showSlotRepository.findAll(); }
    public List<ShowSlot> getSlotsByEvent(Long id)    { return showSlotRepository.findByEvent_EventId(id); }
    public List<ShowSlot> getSlotsByDate(LocalDate d) { return showSlotRepository.findByShowDate(d); }
    public List<ShowSlot> getAvailableSlots()         { return showSlotRepository.findBySlotStatus("AVAILABLE"); }
    public List<SeatSlot> getAllSeatsForSlot(Long slotId) {
        return seatSlotRepository.findBySlot_SlotId(slotId);
    }

    public ShowSlot getSlotById(Long id) {
        return showSlotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Slot not found: " + id));
    }

    @Transactional
    public ShowSlot updateSlot(Long id, ShowSlotRequest req) {
        ShowSlot slot      = getSlotById(id);
        String   oldStatus = slot.getSlotStatus();

        if (req.getShowDate() != null)   slot.setShowDate(req.getShowDate());
        if (req.getStartTime() != null)  slot.setStartTime(req.getStartTime());
        if (req.getEndTime() != null)    slot.setEndTime(req.getEndTime());
        if (req.getSeatsLeft() != null)  slot.setSeatsLeft(req.getSeatsLeft());
        if (req.getSlotStatus() != null) slot.setSlotStatus(req.getSlotStatus());

        ShowSlot saved = showSlotRepository.save(slot);

        // ── Trigger refund only when slot is newly set to CANCELLED ──────────
        boolean wasAlreadyCancelled = "CANCELLED".equalsIgnoreCase(oldStatus);
        boolean nowCancelled        = "CANCELLED".equalsIgnoreCase(req.getSlotStatus());

        if (nowCancelled && !wasAlreadyCancelled) {
            autoRefundSlotReservations(saved);
        }

        return saved;
    }

    // ── Refund all bookings for a specific slot ───────────────────────────────
    void autoRefundSlotReservations(ShowSlot slot) {
        List<Reservation> reservations = reservationRepository.findBySlot_SlotId(slot.getSlotId());
        String eventName = slot.getEvent().getName();
        String showDate  = slot.getShowDate()  != null ? slot.getShowDate().toString() : "";
        String showTime  = slot.getStartTime() != null ? slot.getStartTime().toString().substring(0, 5) : "";
        String displayName = eventName + " (" + showDate + " " + showTime + ")";

        for (Reservation reservation : reservations) {
            if ("CANCELLED".equals(reservation.getStatus())) continue;

            User user = reservation.getUser();

            // a. Free reserved seats
            List<ReservedSeat> reservedSeats = reservedSeatRepository
                    .findByReservation_ReservationId(reservation.getReservationId());
            for (ReservedSeat rs : reservedSeats) {
                rs.setStatus("CANCELLED");
                reservedSeatRepository.save(rs);
                seatSlotRepository
                        .findBySlot_SlotIdAndSeat_SeatId(slot.getSlotId(), rs.getSeat().getSeatId())
                        .ifPresent(ss -> { ss.setAvailability("AVAILABLE"); seatSlotRepository.save(ss); });
            }

            // b. Cancel reservation
            reservation.setStatus("CANCELLED");
            reservationRepository.save(reservation);

            // c. 100% refund — organiser cancelled, not user's fault
            BigDecimal refundAmount = reservation.getAmount() != null ? reservation.getAmount() : BigDecimal.ZERO;

            // d. Mark transaction REFUNDED immediately
            transactionRepository.findByReservation_ReservationId(reservation.getReservationId())
                    .ifPresent(txn -> { txn.setStatus("REFUNDED"); transactionRepository.save(txn); });

            // e. Cancellation record — PROCESSED (auto-approved, no admin needed)
            cancellationRepository.save(Cancellation.builder()
                    .reservation(reservation).user(user)
                    .reason("Show slot cancelled by organiser: " + displayName)
                    .date(LocalDateTime.now())
                    .refundAmount(refundAmount)
                    .refundStatus("PROCESSED")
                    .build());

            // f. In-app notification — clear wording, no admin approval needed
            notificationRepository.save(Notification.builder()
                    .user(user).reservation(reservation)
                    .message("🚫 Show Cancelled: " + displayName + ". "
                            + "Your booking " + reservation.getRefCode() + " has been cancelled. "
                            + "A full refund of ₹" + refundAmount
                            + " has been automatically processed — no admin approval needed. "
                            + "Amount will be credited within 5–7 business days.")
                    .sentTime(LocalDateTime.now())
                    .notifyType("CANCELLATION").deliveryState("SENT")
                    .build());

            // g. Email — uses new organiser-cancellation template (no "admin approval" text)
            try {
                emailService.sendOrganizerCancellationEmail(
                        user.getMail(), user.getName(),
                        displayName,
                        reservation.getRefCode(),
                        refundAmount.doubleValue());
            } catch (Exception ex) {
                System.err.println("Email failed for " + reservation.getRefCode() + ": " + ex.getMessage());
            }
        }
    }

    @Transactional
    public void deleteSlot(Long id) {
        ShowSlot slot = getSlotById(id);
        // Refund all bookings before deleting
        if (!"CANCELLED".equalsIgnoreCase(slot.getSlotStatus())) {
            slot.setSlotStatus("CANCELLED");
            showSlotRepository.save(slot);
            autoRefundSlotReservations(slot);
        }
        showSlotRepository.deleteById(id);
    }

    public List<SeatSlot> getAvailableSeatsForSlot(Long slotId) {
        return seatSlotRepository.findBySlot_SlotIdAndAvailability(slotId, "AVAILABLE");
    }

    public void syncNewSeatsToSlot(Long slotId) {
        ShowSlot   slot     = getSlotById(slotId);
        List<Seat> allSeats = seatRepository.findByLocation_LocationId(slot.getLocation().getLocationId());
        for (Seat seat : allSeats) {
            boolean exists = seatSlotRepository
                    .findBySlot_SlotIdAndSeat_SeatId(slotId, seat.getSeatId()).isPresent();
            if (!exists) {
                seatSlotRepository.save(SeatSlot.builder()
                        .slot(slot).seat(seat).price(seat.getBasePrice()).availability("AVAILABLE").build());
            }
        }
    }
}