package com.example.seatbookingsystem.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "seat_slots")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SeatSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long seatSlotId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnoreProperties({"seatSlots","reservations","hibernateLazyInitializer"})
    private ShowSlot slot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnoreProperties({"seatSlots","reservedSeats","hibernateLazyInitializer"})
    private Seat seat;

    private BigDecimal price;
    private String availability; // AVAILABLE, BOOKED, LOCKED

    // ── Seat Hold Timer (2 min) ───────────────────────────────────────────────
    private LocalDateTime lockedAt;
    private Long          lockedByUserId;
}