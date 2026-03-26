package com.example.seatbookingsystem.service;

import com.example.seatbookingsystem.entity.*;
import com.example.seatbookingsystem.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LoyaltyService {

    private final ReservationRepository reservationRepository;
    private final UserLoyaltyRepository userLoyaltyRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    private static final int LOYALTY_THRESHOLD = 5;
    private static final double LOYALTY_DISCOUNT_PCT = 0.20;

    /**
     * Called after every confirmed booking.
     * Counts bookings this month — if >= 5 and no active offer exists, grant 20% off.
     */
    public void checkAndGrantLoyalty(User user) {
        LocalDate now = LocalDate.now();
        LocalDateTime monthStart = now.withDayOfMonth(1).atStartOfDay();
        LocalDateTime monthEnd   = now.withDayOfMonth(now.lengthOfMonth()).atTime(23, 59, 59);

        List<Reservation> monthlyBookings = reservationRepository
                .findByUser_UserIdAndReservedDateBetween(user.getUserId(), monthStart, monthEnd);

        long confirmedCount = monthlyBookings.stream()
                .filter(r -> "CONFIRMED".equals(r.getStatus()))
                .count();

        log.info("User {} has {} confirmed bookings this month", user.getName(), confirmedCount);

        if (confirmedCount >= LOYALTY_THRESHOLD) {
            // check if offer already granted this month
            boolean alreadyGranted = userLoyaltyRepository
                    .existsByUser_UserIdAndGrantedMonthAndUsed(
                            user.getUserId(), now.getMonthValue(), false);

            if (!alreadyGranted) {
                // Grant offer
                userLoyaltyRepository.save(UserLoyalty.builder()
                        .user(user)
                        .discountPercent(LOYALTY_DISCOUNT_PCT)
                        .grantedMonth(now.getMonthValue())
                        .grantedYear(now.getYear())
                        .used(false)
                        .grantedAt(LocalDateTime.now())
                        .build());

                // In-app notification
                notificationRepository.save(Notification.builder()
                        .user(user)
                        .message("🎉 Congrats! You've made " + confirmedCount +
                                " bookings this month. You've unlocked 20% off your next booking!")
                        .sentTime(LocalDateTime.now())
                        .notifyType("REMINDER")
                        .deliveryState("SENT")
                        .build());

                // Email notification
                emailService.sendLoyaltyOfferEmail(
                        user.getMail(), user.getName(), (int) confirmedCount);

                log.info("Loyalty offer granted to user {}", user.getName());
            }
        }
    }

    /**
     * Check if user has an active (unused) loyalty offer.
     * Returns the discount percent (0.20) or 0 if none.
     */
    public double getActiveLoyaltyDiscount(Long userId) {
        return userLoyaltyRepository
                .findByUser_UserIdAndUsed(userId, false)
                .map(UserLoyalty::getDiscountPercent)
                .orElse(0.0);
    }

    /**
     * Mark the loyalty offer as used after payment.
     */
    public void markLoyaltyUsed(Long userId) {
        userLoyaltyRepository.findByUser_UserIdAndUsed(userId, false)
                .ifPresent(offer -> {
                    offer.setUsed(true);
                    userLoyaltyRepository.save(offer);
                    log.info("Loyalty offer marked used for user {}", userId);
                });
    }
}