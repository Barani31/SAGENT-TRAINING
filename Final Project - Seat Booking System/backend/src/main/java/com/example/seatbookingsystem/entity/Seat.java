package com.example.seatbookingsystem.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "seats")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long seatId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnoreProperties({"seats","showSlots","hibernateLazyInitializer"})
    private Location location;

    private String seatNo;
    private String rowLetter;
    private String seatType;      // REGULAR, PREMIUM, VIP
    private BigDecimal basePrice;

    // ── Family Pack ───────────────────────────────────────────────────────────
    // true = part of a family pack (must book the whole group together)
    private Boolean isFamily;

    // Groups seats — e.g. "FAM-A-1" means seats A1,A2,A3,A4 form one pack
    private String familyGroupId;

    // Bundle price for the ENTIRE group (e.g. 4 seats for ₹700 instead of ₹800)
    private BigDecimal familyPrice;

    @JsonIgnore
    @OneToMany(mappedBy = "seat", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private List<SeatSlot> seatSlots;

    @JsonIgnore
    @OneToMany(mappedBy = "seat", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private List<ReservedSeat> reservedSeats;
}