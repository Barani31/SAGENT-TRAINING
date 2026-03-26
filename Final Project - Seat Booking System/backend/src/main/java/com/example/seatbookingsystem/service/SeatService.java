package com.example.seatbookingsystem.service;

import com.example.seatbookingsystem.dto.BulkSeatRequest;
import com.example.seatbookingsystem.dto.FamilyPackRequest;
import com.example.seatbookingsystem.entity.Location;
import com.example.seatbookingsystem.entity.Seat;
import com.example.seatbookingsystem.repository.LocationRepository;
import com.example.seatbookingsystem.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SeatService {

    private final SeatRepository     seatRepository;
    private final LocationRepository locationRepository;

    public Seat createSeat(Seat seat, Long locationId) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Location not found: " + locationId));
        seat.setLocation(location);
        return seatRepository.save(seat);
    }

    public List<Seat> createBulkSeats(Long locationId, BulkSeatRequest req) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Location not found: " + locationId));
        List<Seat> seats = new ArrayList<>();
        for (int i = 1; i <= req.getSeatCount(); i++) {
            seats.add(Seat.builder()
                    .location(location)
                    .rowLetter(req.getRowLetter())
                    .seatNo(String.valueOf(i))
                    .seatType(req.getSeatType())
                    .basePrice(req.getBasePrice())
                    .isFamily(false)
                    .build());
        }
        return seatRepository.saveAll(seats);
    }

    // ── Create a Family Pack ──────────────────────────────────────────────────
    // Creates N consecutive seats marked as a family group with a bundle price
    public List<Seat> createFamilyPack(Long locationId, FamilyPackRequest req) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Location not found: " + locationId));

        // Find next available seat number in this row
        List<Seat> existingInRow = seatRepository.findByLocation_LocationId(locationId)
                .stream()
                .filter(s -> req.getRowLetter().equalsIgnoreCase(s.getRowLetter()))
                .toList();

        int startFrom = existingInRow.stream()
                .mapToInt(s -> { try { return Integer.parseInt(s.getSeatNo()); } catch (Exception e) { return 0; } })
                .max().orElse(0) + 1;

        String groupId = "FAM-" + req.getRowLetter().toUpperCase() + "-" + startFrom;

        // Per-seat price = bundle / count (for display purposes)
        BigDecimal perSeatPrice = req.getFamilyPrice()
                .divide(BigDecimal.valueOf(req.getSeatCount()), 2, java.math.RoundingMode.HALF_UP);

        List<Seat> seats = new ArrayList<>();
        for (int i = 0; i < req.getSeatCount(); i++) {
            seats.add(Seat.builder()
                    .location(location)
                    .rowLetter(req.getRowLetter().toUpperCase())
                    .seatNo(String.valueOf(startFrom + i))
                    .seatType(req.getSeatType() != null ? req.getSeatType() : "PREMIUM")
                    .basePrice(perSeatPrice)
                    .isFamily(true)
                    .familyGroupId(groupId)
                    .familyPrice(req.getFamilyPrice())
                    .build());
        }
        return seatRepository.saveAll(seats);
    }

    public List<Seat> getSeatsByFamilyGroup(String groupId) {
        return seatRepository.findByFamilyGroupId(groupId);
    }

    public List<Seat> getAllSeats()                                   { return seatRepository.findAll(); }
    public List<Seat> getSeatsByLocation(Long id)                     { return seatRepository.findByLocation_LocationId(id); }
    public List<Seat> getSeatsByLocationAndType(Long id, String type) { return seatRepository.findByLocation_LocationIdAndSeatType(id, type); }

    public Seat getSeatById(Long id) {
        return seatRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Seat not found: " + id));
    }

    public Seat updateSeat(Long id, Seat req) {
        Seat seat = getSeatById(id);
        if (req.getSeatNo()        != null) seat.setSeatNo(req.getSeatNo());
        if (req.getRowLetter()     != null) seat.setRowLetter(req.getRowLetter());
        if (req.getSeatType()      != null) seat.setSeatType(req.getSeatType());
        if (req.getBasePrice()     != null) seat.setBasePrice(req.getBasePrice());
        if (req.getIsFamily()      != null) seat.setIsFamily(req.getIsFamily());
        if (req.getFamilyGroupId() != null) seat.setFamilyGroupId(req.getFamilyGroupId());
        if (req.getFamilyPrice()   != null) seat.setFamilyPrice(req.getFamilyPrice());
        return seatRepository.save(seat);
    }

    public void deleteSeat(Long id) {
        if (!seatRepository.existsById(id)) throw new RuntimeException("Seat not found: " + id);
        seatRepository.deleteById(id);
    }

    public void deleteFamilyPack(String groupId) {
        List<Seat> seats = seatRepository.findByFamilyGroupId(groupId);
        if (seats.isEmpty()) throw new RuntimeException("Family group not found: " + groupId);
        seatRepository.deleteAll(seats);
    }
}