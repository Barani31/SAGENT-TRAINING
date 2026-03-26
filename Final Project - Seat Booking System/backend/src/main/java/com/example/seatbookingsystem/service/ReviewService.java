package com.example.seatbookingsystem.service;

import com.example.seatbookingsystem.dto.ReviewRequest;
import com.example.seatbookingsystem.entity.*;
import com.example.seatbookingsystem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository       reviewRepository;
    private final EventRepository        eventRepository;
    private final UserRepository         userRepository;
    private final ReservationRepository  reservationRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService           emailService;

    public Review submitReview(ReviewRequest req) {
        if (req.getRating() < 1 || req.getRating() > 5)
            throw new RuntimeException("Rating must be between 1 and 5");

        if (reviewRepository.existsByReservation_ReservationId(req.getReservationId()))
            throw new RuntimeException("You have already reviewed this booking");

        Event event = eventRepository.findById(req.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found: " + req.getEventId()));

        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found: " + req.getUserId()));

        Reservation reservation = reservationRepository.findById(req.getReservationId())
                .orElseThrow(() -> new RuntimeException("Reservation not found: " + req.getReservationId()));

        if (!"CONFIRMED".equals(reservation.getStatus()))
            throw new RuntimeException("Only confirmed bookings can be reviewed");

        Review saved = reviewRepository.save(Review.builder()
                .event(event)
                .user(user)
                .reservation(reservation)
                .rating(req.getRating())
                .comment(req.getComment())
                .reviewedAt(LocalDateTime.now())
                .build());

        // ── Thank you in-app notification ─────────────────────────────────────
        String stars = "⭐".repeat(req.getRating());
        notificationRepository.save(Notification.builder()
                .user(user)
                .reservation(reservation)
                .message(stars + " Thank you for reviewing " + event.getName() +
                        "! Your " + req.getRating() + "-star review has been published. " +
                        "We appreciate your time! 🙏")
                .sentTime(LocalDateTime.now())
                .notifyType("REVIEW")
                .deliveryState("SENT")
                .build());

        // ── Thank you email ───────────────────────────────────────────────────
        emailService.sendReviewThankYouEmail(
                user.getMail(),
                user.getName(),
                event.getName(),
                req.getRating());

        return saved;
    }

    public List<Review> getReviewsByEvent(Long eventId) {
        return reviewRepository.findByEvent_EventId(eventId);
    }

    public List<Review> getReviewsByUser(Long userId) {
        return reviewRepository.findByUser_UserId(userId);
    }

    public boolean hasReviewed(Long reservationId) {
        return reviewRepository.existsByReservation_ReservationId(reservationId);
    }

    public Map<String, Object> getEventRatingSummary(Long eventId) {
        Double avg   = reviewRepository.getAverageRatingByEvent(eventId);
        Long   count = reviewRepository.getReviewCountByEvent(eventId);
        return Map.of(
                "averageRating", avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0,
                "totalReviews",  count != null ? count : 0L
        );
    }

    public void deleteReview(Long id) {
        if (!reviewRepository.existsById(id))
            throw new RuntimeException("Review not found: " + id);
        reviewRepository.deleteById(id);
    }
}