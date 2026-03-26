package com.example.seatbookingsystem.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cancellations")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Cancellation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cancellationId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnoreProperties({"cancellation","transaction","reservedSeats","notifications","hibernateLazyInitializer"})
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnoreProperties({"reservations","organizedEvents","notifications","cancellations","password","hibernateLazyInitializer"})
    private User user;

    private String reason;
    private LocalDateTime date;
    private BigDecimal refundAmount;
    private String refundStatus; // PENDING, PROCESSED, REJECTED
}