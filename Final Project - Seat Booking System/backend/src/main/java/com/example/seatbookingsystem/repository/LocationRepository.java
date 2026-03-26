package com.example.seatbookingsystem.repository;

import com.example.seatbookingsystem.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    List<Location> findByLocNameContainingIgnoreCase(String name);
    List<Location> findByAddressContainingIgnoreCase(String address);
}