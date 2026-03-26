package com.example.seatbookingsystem.repository;

import com.example.seatbookingsystem.entity.Cancellation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CancellationRepository extends JpaRepository<Cancellation, Long> {
    Optional<Cancellation> findByReservation_ReservationId(Long reservationId);
    List<Cancellation> findByUser_UserId(Long userId);
    List<Cancellation> findByRefundStatus(String status);
}