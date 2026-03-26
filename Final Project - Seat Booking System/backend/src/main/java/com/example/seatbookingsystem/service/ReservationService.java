package com.example.seatbookingsystem.service;

import com.example.seatbookingsystem.dto.BookingRequest;
import com.example.seatbookingsystem.entity.*;
import com.example.seatbookingsystem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository     reservationRepository;
    private final UserRepository            userRepository;
    private final ShowSlotRepository        showSlotRepository;
    private final SeatSlotRepository        seatSlotRepository;
    private final SeatRepository            seatRepository;
    private final ReservedSeatRepository    reservedSeatRepository;
    private final NotificationRepository    notificationRepository;
    private final EmailService              emailService;
    private final LoyaltyService            loyaltyService;

    @Transactional
    public Reservation bookSeats(BookingRequest req) {
        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found: " + req.getUserId()));
        ShowSlot slot = showSlotRepository.findById(req.getSlotId())
                .orElseThrow(() -> new RuntimeException("Slot not found: " + req.getSlotId()));

        if (!"AVAILABLE".equals(slot.getSlotStatus()) && !"HOUSEFULL".equals(slot.getSlotStatus()))
            throw new RuntimeException("Slot is not available. Status: " + slot.getSlotStatus());
        if (slot.getSeatsLeft() < req.getSeatIds().size())
            throw new RuntimeException("Not enough seats. Only " + slot.getSeatsLeft() + " left.");

        List<SeatSlot> seatSlotsToBook = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (Long seatId : req.getSeatIds()) {
            SeatSlot ss = seatSlotRepository
                    .findBySlot_SlotIdAndSeat_SeatId(slot.getSlotId(), seatId)
                    .orElseThrow(() -> new RuntimeException("Seat " + seatId + " not found in this slot"));

            // ── Allow booking if seat is AVAILABLE or LOCKED by this same user ──
            boolean isAvailable = "AVAILABLE".equals(ss.getAvailability());
            boolean isLockedByThisUser = "LOCKED".equals(ss.getAvailability())
                    && req.getUserId().equals(ss.getLockedByUserId());

            if (!isAvailable && !isLockedByThisUser) {
                throw new RuntimeException("Seat is not available: " + seatId +
                        " (status: " + ss.getAvailability() + ")");
            }

            ss.setAvailability("BOOKED");
            ss.setLockedAt(null);
            ss.setLockedByUserId(null);
            seatSlotsToBook.add(ss);
            subtotal = subtotal.add(ss.getPrice());
        }
        seatSlotRepository.saveAll(seatSlotsToBook);

        // ── Discount: loyalty only ────────────────────────────────────────────
        BigDecimal discount = BigDecimal.ZERO;

        double loyaltyPct = loyaltyService.getActiveLoyaltyDiscount(user.getUserId());
        if (loyaltyPct > 0) {
            discount = subtotal.multiply(BigDecimal.valueOf(loyaltyPct))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        if (req.getDiscount() != null && req.getDiscount().compareTo(discount) > 0) {
            discount = req.getDiscount();
        }

        BigDecimal finalAmount = subtotal.subtract(discount).max(BigDecimal.ZERO);
        String refCode = "REF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Reservation saved = reservationRepository.save(Reservation.builder()
                .user(user).slot(slot).refCode(refCode)
                .reservedDate(LocalDateTime.now())
                .amount(finalAmount)
                .discount(discount)
                .status("CONFIRMED").build());

        for (SeatSlot ss : seatSlotsToBook) {
            reservedSeatRepository.save(ReservedSeat.builder()
                    .reservation(saved)
                    .seat(ss.getSeat())
                    .price(ss.getPrice())
                    .status("BOOKED").build());
        }

        // Update slot seats left
        slot.setSeatsLeft(slot.getSeatsLeft() - req.getSeatIds().size());
        if (slot.getSeatsLeft() == 0) slot.setSlotStatus("HOUSEFULL");
        showSlotRepository.save(slot);

        if (loyaltyPct > 0) loyaltyService.markLoyaltyUsed(user.getUserId());

        String seatDetails = seatSlotsToBook.stream()
                .map(ss -> ss.getSeat().getRowLetter() + ss.getSeat().getSeatNo())
                .reduce("", (a, b) -> a.isEmpty() ? b : a + ", " + b);

        notificationRepository.save(Notification.builder()
                .user(user).reservation(saved)
                .message("Booking confirmed for " + slot.getEvent().getName() +
                        " on " + slot.getShowDate() + ". Ref: " + refCode)
                .sentTime(LocalDateTime.now())
                .notifyType("BOOKING").deliveryState("SENT").build());

        emailService.sendBookingConfirmation(user.getMail(), user.getName(),
                slot.getEvent().getName(), slot.getShowDate().toString(),
                slot.getStartTime().toString(), slot.getLocation().getLocName(),
                refCode, seatDetails, finalAmount.doubleValue());

        loyaltyService.checkAndGrantLoyalty(user);

        return saved;
    }

    public List<Reservation> getAllReservations()                { return reservationRepository.findAll(); }
    public List<Reservation> getReservationsByUser(Long id)      { return reservationRepository.findByUser_UserId(id); }
    public List<Reservation> getReservationsBySlot(Long id)      { return reservationRepository.findBySlot_SlotId(id); }
    public List<Reservation> getReservationsByOrganiser(Long id) { return reservationRepository.findByOrganiserId(id); }

    public Reservation getReservationById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found: " + id));
    }

    public Reservation getReservationByRefCode(String ref) {
        return reservationRepository.findByRefCode(ref)
                .orElseThrow(() -> new RuntimeException("Reservation not found for ref: " + ref));
    }

    public void deleteReservation(Long id) {
        if (!reservationRepository.existsById(id))
            throw new RuntimeException("Reservation not found: " + id);
        reservationRepository.deleteById(id);
    }
}