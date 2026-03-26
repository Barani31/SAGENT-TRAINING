package com.example.seatbookingsystem.repository;

import com.example.seatbookingsystem.entity.SeatSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SeatSlotRepository extends JpaRepository<SeatSlot, Long> {
    List<SeatSlot> findBySlot_SlotId(Long slotId);
    List<SeatSlot> findBySlot_SlotIdAndAvailability(Long slotId, String availability);
    Optional<SeatSlot> findBySlot_SlotIdAndSeat_SeatId(Long slotId, Long seatId);

    // Hold timer — find all LOCKED seats whose lock has expired
    @Query("SELECT ss FROM SeatSlot ss WHERE ss.availability = 'LOCKED' AND ss.lockedAt < :expiry")
    List<SeatSlot> findExpiredLocks(@Param("expiry") LocalDateTime expiry);

    // Find seats locked by a specific user for a specific slot
    List<SeatSlot> findBySlot_SlotIdAndLockedByUserId(Long slotId, Long userId);


}