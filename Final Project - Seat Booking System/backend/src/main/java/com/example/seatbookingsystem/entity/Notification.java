package com.example.seatbookingsystem.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnoreProperties({"reservations","organizedEvents","notifications","cancellations","password","hibernateLazyInitializer"})
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id")
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnoreProperties({"notifications","reservedSeats","cancellation","transaction","hibernateLazyInitializer"})
    private Reservation reservation;

    private String message;
    private LocalDateTime sentTime;
    private String notifyType;    // BOOKING, CANCELLATION, REMINDER, PAYMENT, REVIEW
    private String deliveryState; // SENT, PENDING, FAILED

    @Builder.Default
    @Column(nullable = false)
    private boolean isRead = false; // ← NEW: false = unread, true = read
}