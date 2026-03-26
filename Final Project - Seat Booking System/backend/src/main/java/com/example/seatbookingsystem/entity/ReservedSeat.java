package com.example.seatbookingsystem.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "reserved_seats")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ReservedSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long resSeatId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnoreProperties({"reservedSeats","transaction","cancellation","notifications","slot","user","hibernateLazyInitializer"})
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnoreProperties({"seatSlots","reservedSeats","location","hibernateLazyInitializer"})
    private Seat seat;

    private BigDecimal price;
    private String status;
}