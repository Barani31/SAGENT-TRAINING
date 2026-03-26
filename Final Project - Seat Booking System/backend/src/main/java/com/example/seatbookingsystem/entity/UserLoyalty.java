package com.example.seatbookingsystem.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_loyalty")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserLoyalty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long loyaltyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnoreProperties({"reservations","organizedEvents","notifications","cancellations","password","hibernateLazyInitializer"})
    private User user;

    private double discountPercent; // 0.20 = 20%
    private int grantedMonth;       // 1-12
    private int grantedYear;
    private boolean used;
    private LocalDateTime grantedAt;
}