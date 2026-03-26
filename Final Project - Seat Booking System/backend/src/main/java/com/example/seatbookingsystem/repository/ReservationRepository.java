package com.example.seatbookingsystem.repository;

import com.example.seatbookingsystem.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUser_UserId(Long userId);
    List<Reservation> findBySlot_SlotId(Long slotId);
    Optional<Reservation> findByRefCode(String refCode);

    // For loyalty check — bookings this month
    List<Reservation> findByUser_UserIdAndReservedDateBetween(
            Long userId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT r FROM Reservation r WHERE r.slot.event.organiser.userId = :organiserId")
    List<Reservation> findByOrganiserId(@Param("organiserId") Long organiserId);
}