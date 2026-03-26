package com.example.seatbookingsystem.service;

import com.example.seatbookingsystem.dto.CancellationRequest;
import com.example.seatbookingsystem.entity.*;
import com.example.seatbookingsystem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CancellationService {

    private final CancellationRepository    cancellationRepository;
    private final ReservationRepository     reservationRepository;
    private final TransactionRepository     transactionRepository;
    private final SeatSlotRepository        seatSlotRepository;
    private final ReservedSeatRepository    reservedSeatRepository;
    private final NotificationRepository    notificationRepository;
    private final ShowSlotRepository        showSlotRepository;
    private final EmailService              emailService;

    // ── User-initiated cancellation (80% refund) ──────────────────────────────
    @Transactional
    public Cancellation cancelReservation(CancellationRequest req) {
        Reservation reservation = reservationRepository.findById(req.getReservationId())
                .orElseThrow(() -> new RuntimeException("Reservation not found: " + req.getReservationId()));

        if ("CANCELLED".equals(reservation.getStatus()))
            throw new RuntimeException("Reservation already cancelled");

        User user = reservation.getUser();

        // Restore seat availability
        List<ReservedSeat> reservedSeats = reservedSeatRepository
                .findByReservation_ReservationId(reservation.getReservationId());

        for (ReservedSeat rs : reservedSeats) {
            rs.setStatus("CANCELLED");
            reservedSeatRepository.save(rs);
            seatSlotRepository
                    .findBySlot_SlotIdAndSeat_SeatId(
                            reservation.getSlot().getSlotId(), rs.getSeat().getSeatId())
                    .ifPresent(ss -> { ss.setAvailability("AVAILABLE"); seatSlotRepository.save(ss); });
        }

        // Restore seats left on slot
        ShowSlot slot = reservation.getSlot();
        slot.setSeatsLeft(slot.getSeatsLeft() + reservedSeats.size());
        if (!"CANCELLED".equals(slot.getSlotStatus())) slot.setSlotStatus("AVAILABLE");
        showSlotRepository.save(slot);

        // Mark reservation cancelled
        reservation.setStatus("CANCELLED");
        reservationRepository.save(reservation);

        // Update transaction to PENDING (wait for admin refund decision)
        transactionRepository.findByReservation_ReservationId(reservation.getReservationId())
                .ifPresent(txn -> { txn.setStatus("PENDING"); transactionRepository.save(txn); });

        // 80% refund calculation
        BigDecimal refund = reservation.getAmount()
                .multiply(BigDecimal.valueOf(0.8))
                .setScale(2, java.math.RoundingMode.HALF_UP);

        Cancellation saved = cancellationRepository.save(Cancellation.builder()
                .reservation(reservation).user(user)
                .reason(req.getReason())
                .date(LocalDateTime.now())
                .refundAmount(refund)
                .refundStatus("PENDING")
                .build());

        // In-app notification
        notificationRepository.save(Notification.builder()
                .user(user).reservation(reservation)
                .message("🎟️ Your booking " + reservation.getRefCode() + " for "
                        + slot.getEvent().getName() + " has been cancelled. "
                        + "An 80% refund of ₹" + refund
                        + " is pending admin approval and will be credited within 5–7 business days once approved.")
                .sentTime(LocalDateTime.now())
                .notifyType("CANCELLATION").deliveryState("SENT")
                .build());

        // Email
        emailService.sendCancellationConfirmation(user.getMail(), user.getName(),
                slot.getEvent().getName(), reservation.getRefCode(), refund.doubleValue());

        return saved;
    }

    // ── Admin updates refund status ───────────────────────────────────────────
    @Transactional
    public Cancellation updateRefundStatus(Long cancellationId, String status) {
        Cancellation cancellation = cancellationRepository.findById(cancellationId)
                .orElseThrow(() -> new RuntimeException("Cancellation not found: " + cancellationId));

        cancellation.setRefundStatus(status);
        Cancellation saved = cancellationRepository.save(cancellation);

        User        user     = cancellation.getUser();
        Reservation res      = cancellation.getReservation();
        String      refCode  = res.getRefCode();
        double      refundAmt = cancellation.getRefundAmount().doubleValue();
        String      eventName = res.getSlot().getEvent().getName();

        // Update transaction status
        transactionRepository.findByReservation_ReservationId(res.getReservationId())
                .ifPresent(txn -> {
                    txn.setStatus("PROCESSED".equals(status) ? "REFUNDED" : "REJECTED");
                    transactionRepository.save(txn);
                });

        if ("PROCESSED".equals(status)) {
            notificationRepository.save(Notification.builder()
                    .user(user).reservation(res)
                    .message("✅ Refund Approved! Your refund of ₹" + refundAmt
                            + " for booking " + refCode + " (" + eventName + ") "
                            + "has been approved. It will be credited to your account within 5–7 business days.")
                    .sentTime(LocalDateTime.now())
                    .notifyType("CANCELLATION").deliveryState("SENT")
                    .build());

            emailService.sendRefundStatusEmail(user.getMail(), user.getName(),
                    eventName, refCode, refundAmt, true);

        } else if ("REJECTED".equals(status)) {
            notificationRepository.save(Notification.builder()
                    .user(user).reservation(res)
                    .message("❌ Refund Rejected. Your refund request for booking " + refCode
                            + " (" + eventName + ") has been rejected. "
                            + "Please contact support for assistance.")
                    .sentTime(LocalDateTime.now())
                    .notifyType("CANCELLATION").deliveryState("SENT")
                    .build());

            emailService.sendRefundStatusEmail(user.getMail(), user.getName(),
                    eventName, refCode, refundAmt, false);
        }

        return saved;
    }

    public List<Cancellation> getAllCancellations()            { return cancellationRepository.findAll(); }
    public List<Cancellation> getCancellationsByUser(Long id)  { return cancellationRepository.findByUser_UserId(id); }

    public Cancellation getCancellationById(Long id) {
        return cancellationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cancellation not found: " + id));
    }

    public void deleteCancellation(Long id) {
        if (!cancellationRepository.existsById(id))
            throw new RuntimeException("Cancellation not found: " + id);
        cancellationRepository.deleteById(id);
    }

    // ── Scheduler: runs every 6 hours, credits refunds after 2 days ───────────
    @Scheduled(fixedDelay = 21600000) // every 6 hours
    @Transactional
    public void processApprovedRefunds() {
        List<Cancellation> approved = cancellationRepository.findByRefundStatus("PROCESSED");

        // Credit after 2 days (organiser-cancelled = faster refund)
        LocalDateTime twoDaysAgo = LocalDateTime.now().minusDays(2);

        for (Cancellation c : approved) {
            if (c.getDate() == null || !c.getDate().isBefore(twoDaysAgo)) continue;
            if ("CREDITED".equals(c.getRefundStatus())) continue;

            c.setRefundStatus("CREDITED");
            cancellationRepository.save(c);

            User        user     = c.getUser();
            Reservation res      = c.getReservation();
            double      amt      = c.getRefundAmount().doubleValue();
            String      eventName = res.getSlot().getEvent().getName();

            // Update transaction to CREDITED
            transactionRepository.findByReservation_ReservationId(res.getReservationId())
                    .ifPresent(txn -> { txn.setStatus("CREDITED"); transactionRepository.save(txn); });

            // In-app notification — credited
            notificationRepository.save(Notification.builder()
                    .user(user).reservation(res)
                    .message("💰 Refund Credited! ₹" + amt
                            + " for your booking " + res.getRefCode()
                            + " (" + eventName + ") "
                            + "has been successfully credited to your account.")
                    .sentTime(LocalDateTime.now())
                    .notifyType("CANCELLATION").deliveryState("SENT")
                    .build());

            // Email — credited
            try {
                emailService.sendRefundCreditedEmail(
                        user.getMail(), user.getName(),
                        eventName, res.getRefCode(), amt);
            } catch (Exception ex) {
                System.err.println("Credit email failed for " + res.getRefCode() + ": " + ex.getMessage());
            }
        }
    }
}