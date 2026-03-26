package com.example.seatbookingsystem.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "events")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long eventId;

    // only serialize safe fields from organiser — not its collections
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organiser_user_id", nullable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    @JsonIgnoreProperties({"reservations","organizedEvents","notifications","cancellations","password","hibernateLazyInitializer"})
    private User organiser;

    @NotBlank
    private String name;

    private String type;         // MOVIE, CONCERT, EVENT
    private String genre;
    private String summary;
    private String duration;
    private String language;
    private String categoryName;
    private String status;       // ACTIVE, CANCELLED, COMPLETED

    @JsonIgnore
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private List<ShowSlot> showSlots;
}