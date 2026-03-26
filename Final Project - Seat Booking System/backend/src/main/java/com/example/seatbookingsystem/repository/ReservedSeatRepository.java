package com.example.seatbookingsystem.repository;

import com.example.seatbookingsystem.entity.ReservedSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReservedSeatRepository extends JpaRepository<ReservedSeat, Long> {
    List<ReservedSeat> findByReservation_ReservationId(Long reservationId);
    List<ReservedSeat> findBySeat_SeatId(Long seatId);
}