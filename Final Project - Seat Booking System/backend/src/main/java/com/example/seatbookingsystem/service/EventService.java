package com.example.seatbookingsystem.service;

import com.example.seatbookingsystem.dto.EventRequest;
import com.example.seatbookingsystem.entity.*;
import com.example.seatbookingsystem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository        eventRepository;
    private final UserRepository         userRepository;
    private final ShowSlotRepository     showSlotRepository;
    private final ReservationRepository  reservationRepository;
    private final CancellationRepository cancellationRepository;
    private final TransactionRepository  transactionRepository;
    private final SeatSlotRepository     seatSlotRepository;
    private final ReservedSeatRepository reservedSeatRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService           emailService;

    public Event createEvent(EventRequest req) {
        User organiser = userRepository.findById(req.getOrganiserId())
                .orElseThrow(() -> new RuntimeException("Organiser not found: " + req.getOrganiserId()));
        if (!"ADMIN".equalsIgnoreCase(organiser.getRole()))
            throw new RuntimeException("Only admins can create events");
        return eventRepository.save(Event.builder()
                .organiser(organiser).name(req.getName()).type(req.getType())
                .genre(req.getGenre()).summary(req.getSummary()).duration(req.getDuration())
                .language(req.getLanguage()).categoryName(req.getCategoryName())
                .status(req.getStatus() != null ? req.getStatus() : "ACTIVE")
                .build());
    }

    public List<Event> getAllEvents()                { return eventRepository.findAll(); }
    public List<Event> getEventsByType(String type)  { return eventRepository.findByType(type.toUpperCase()); }
    public List<Event> getEventsByOrganiser(Long id) { return eventRepository.findByOrganiser_UserId(id); }
    public List<Event> searchEvents(String name)     { return eventRepository.findByNameContainingIgnoreCase(name); }

    public List<Event> getAllEventsSorted(String sortBy) {
        Sort sort = switch (sortBy.toLowerCase()) {
            case "name"  -> Sort.by(Sort.Direction.ASC, "name");
            case "type"  -> Sort.by(Sort.Direction.ASC, "type");
            case "genre" -> Sort.by(Sort.Direction.ASC, "genre");
            default      -> Sort.by(Sort.Direction.ASC, "eventId");
        };
        return eventRepository.findAll(sort);
    }

    public List<Event> filterEvents(String type, String genre, String language, String status, String name) {
        return eventRepository.filterEvents(type, genre, language, status, name);
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found: " + id));
    }

    @Transactional
    public Event updateEvent(Long id, EventRequest req) {
        Event  e         = getEventById(id);
        String oldStatus = e.getStatus();

        if (req.getName() != null)         e.setName(req.getName());
        if (req.getType() != null)         e.setType(req.getType());
        if (req.getGenre() != null)        e.setGenre(req.getGenre());
        if (req.getSummary() != null)      e.setSummary(req.getSummary());
        if (req.getDuration() != null)     e.setDuration(req.getDuration());
        if (req.getLanguage() != null)     e.setLanguage(req.getLanguage());
        if (req.getCategoryName() != null) e.setCategoryName(req.getCategoryName());
        if (req.getStatus() != null)       e.setStatus(req.getStatus());

        Event saved = eventRepository.save(e);

        if (req.getStatus() != null) {
            String newStatus = req.getStatus().toUpperCase();
            List<ShowSlot> slots = showSlotRepository.findByEvent_EventId(id);

            if ("CANCELLED".equals(newStatus) && !"CANCELLED".equalsIgnoreCase(oldStatus)) {
                // Lock all slots + auto-refund all bookings
                slots.forEach(s -> s.setSlotStatus("CANCELLED"));
                showSlotRepository.saveAll(slots);
                autoRefundAllReservations(saved, slots);

            } else if ("COMPLETED".equals(newStatus) && !"COMPLETED".equalsIgnoreCase(oldStatus)) {
                // Lock all slots, no refund
                slots.forEach(s -> s.setSlotStatus("CANCELLED"));
                showSlotRepository.saveAll(slots);

            } else if ("ACTIVE".equals(newStatus) && !"ACTIVE".equalsIgnoreCase(oldStatus)) {
                // Restore all slots + reset ALL seats to AVAILABLE (clean slate)
                slots.forEach(s -> s.setSlotStatus("AVAILABLE"));
                showSlotRepository.saveAll(slots);

                for (ShowSlot slot : slots) {
                    List<SeatSlot> seatSlots = seatSlotRepository.findBySlot_SlotId(slot.getSlotId());
                    seatSlots.forEach(ss -> ss.setAvailability("AVAILABLE"));
                    seatSlotRepository.saveAll(seatSlots);
                    if (!seatSlots.isEmpty()) {
                        slot.setSeatsLeft(seatSlots.size());
                        showSlotRepository.save(slot);
                    }
                }

                // Notify users that event is back
                notifyEventReactivated(saved, slots);
            }
        }

        return saved;
    }

    // ── Refund all reservations across all slots of a cancelled event ─────────
    private void autoRefundAllReservations(Event event, List<ShowSlot> slots) {
        for (ShowSlot slot : slots) {
            List<Reservation> reservations = reservationRepository.findBySlot_SlotId(slot.getSlotId());
            String showDate    = slot.getShowDate()  != null ? slot.getShowDate().toString() : "";
            String showTime    = slot.getStartTime() != null ? slot.getStartTime().toString().substring(0, 5) : "";
            String displayName = event.getName() + " (" + showDate + " " + showTime + ")";

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

                // c. 100% refund
                BigDecimal refundAmount = reservation.getAmount() != null ? reservation.getAmount() : BigDecimal.ZERO;

                // d. Mark transaction REFUNDED immediately
                transactionRepository.findByReservation_ReservationId(reservation.getReservationId())
                        .ifPresent(txn -> { txn.setStatus("REFUNDED"); transactionRepository.save(txn); });

                // e. Cancellation record — PROCESSED (auto-approved)
                cancellationRepository.save(Cancellation.builder()
                        .reservation(reservation).user(user)
                        .reason("Event cancelled by organiser: " + event.getName())
                        .date(LocalDateTime.now())
                        .refundAmount(refundAmount)
                        .refundStatus("PROCESSED")
                        .build());

                // f. In-app notification — no "admin approval" wording
                notificationRepository.save(Notification.builder()
                        .user(user).reservation(reservation)
                        .message("🚫 " + event.getName() + " (on " + showDate + " at " + showTime + ") "
                                + "has been cancelled by the organiser. "
                                + "Your booking " + reservation.getRefCode() + " is cancelled. "
                                + "A full refund of ₹" + refundAmount
                                + " has been automatically processed — no admin approval needed. "
                                + "Amount will be credited within 5–7 business days.")
                        .sentTime(LocalDateTime.now())
                        .notifyType("CANCELLATION").deliveryState("SENT")
                        .build());

                // g. Email — uses organiser-cancellation template
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
    }

    // ── Notify users when event is reactivated ────────────────────────────────
    private void notifyEventReactivated(Event event, List<ShowSlot> slots) {
        slots.stream()
                .flatMap(slot -> reservationRepository.findBySlot_SlotId(slot.getSlotId()).stream())
                .map(Reservation::getUser)
                .distinct()
                .forEach(user -> {
                    try {
                        notificationRepository.save(Notification.builder()
                                .user(user)
                                .message("✅ " + event.getName() + " is back! "
                                        + "The event has been reactivated. New bookings are now open.")
                                .sentTime(LocalDateTime.now())
                                .notifyType("INFO").deliveryState("SENT")
                                .build());
                    } catch (Exception ignored) {}
                });
    }

    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) throw new RuntimeException("Event not found: " + id);
        eventRepository.deleteById(id);
    }
}