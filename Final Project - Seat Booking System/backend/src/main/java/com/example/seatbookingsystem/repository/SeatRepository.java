package com.example.seatbookingsystem.repository;

import com.example.seatbookingsystem.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByLocation_LocationId(Long locationId);
    List<Seat> findByLocation_LocationIdAndSeatType(Long locationId, String seatType);
    List<Seat> findByFamilyGroupId(String familyGroupId);
    List<Seat> findByLocation_LocationIdAndIsFamily(Long locationId, Boolean isFamily);
}