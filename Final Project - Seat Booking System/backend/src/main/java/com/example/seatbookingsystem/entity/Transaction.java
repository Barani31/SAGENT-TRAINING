package com.example.seatbookingsystem.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transactionId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnoreProperties({"transaction","reservedSeats","cancellation","notifications","hibernateLazyInitializer"})
    private Reservation reservation;

    private String paymentMethod;
    private LocalDateTime date;
    private BigDecimal amount;
    private BigDecimal discountAmount;
    private String status;        // SUCCESS, FAILED, REFUNDED, PENDING
    private String transactionRef;
}