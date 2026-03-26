package com.example.seatbookingsystem.repository;

import com.example.seatbookingsystem.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByEvent_EventId(Long eventId);
    List<Review> findByUser_UserId(Long userId);
    Optional<Review> findByReservation_ReservationId(Long reservationId);
    boolean existsByReservation_ReservationId(Long reservationId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.event.eventId = :eventId")
    Double getAverageRatingByEvent(@Param("eventId") Long eventId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.event.eventId = :eventId")
    Long getReviewCountByEvent(@Param("eventId") Long eventId);
}