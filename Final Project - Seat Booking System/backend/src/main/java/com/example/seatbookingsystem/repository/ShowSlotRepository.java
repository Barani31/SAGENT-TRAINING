package com.example.seatbookingsystem.repository;

import com.example.seatbookingsystem.entity.ShowSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ShowSlotRepository extends JpaRepository<ShowSlot, Long> {
    List<ShowSlot> findByEvent_EventId(Long eventId);
    List<ShowSlot> findByLocation_LocationId(Long locationId);
    List<ShowSlot> findByShowDate(LocalDate date);
    List<ShowSlot> findBySlotStatus(String status);
    List<ShowSlot> findByEvent_EventIdAndShowDate(Long eventId, LocalDate date);
    List<ShowSlot> findBySeatsLeftGreaterThan(int seats);

    // Slots starting in the next 60-75 minutes (for reminders)
    @Query("SELECT s FROM ShowSlot s WHERE s.showDate = :today AND " +
            "s.startTime BETWEEN :fromTime AND :toTime AND s.slotStatus = 'AVAILABLE'")
    List<ShowSlot> findSlotsStartingBetween(@Param("today") LocalDate today,
                                            @Param("fromTime") LocalTime fromTime,
                                            @Param("toTime") LocalTime toTime);

    // Slots that have ended but not yet marked COMPLETED
    @Query("SELECT s FROM ShowSlot s WHERE s.slotStatus NOT IN ('COMPLETED','CANCELLED') AND " +
            "(s.showDate < :today OR (s.showDate = :today AND s.endTime < :now))")
    List<ShowSlot> findEndedSlots(@Param("today") LocalDate today,
                                  @Param("now") LocalTime now);
}