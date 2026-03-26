package com.example.seatbookingsystem.controller;

import com.example.seatbookingsystem.dto.*;
import com.example.seatbookingsystem.entity.Reservation;
import com.example.seatbookingsystem.service.LoyaltyService;
import com.example.seatbookingsystem.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final LoyaltyService     loyaltyService;

    @PostMapping("/book")
    public ResponseEntity<ApiResponse<Reservation>> bookSeats(@RequestBody BookingRequest req) {
        Reservation r = reservationService.bookSeats(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking confirmed! Ref: " + r.getRefCode(), r));
    }

    // Check loyalty discount for a user
    @GetMapping("/loyalty/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLoyalty(@PathVariable Long userId) {
        double pct = loyaltyService.getActiveLoyaltyDiscount(userId);
        return ResponseEntity.ok(ApiResponse.success("Loyalty status",
                Map.of("hasOffer", pct > 0, "discountPercent", pct)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Reservation>>> getAllReservations() {
        return ResponseEntity.ok(ApiResponse.success("Fetched", reservationService.getAllReservations()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Reservation>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Fetched", reservationService.getReservationById(id)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Reservation>>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Fetched",
                reservationService.getReservationsByUser(userId)));
    }

    @GetMapping("/slot/{slotId}")
    public ResponseEntity<ApiResponse<List<Reservation>>> getBySlot(@PathVariable Long slotId) {
        return ResponseEntity.ok(ApiResponse.success("Fetched",
                reservationService.getReservationsBySlot(slotId)));
    }

    @GetMapping("/organiser/{organiserId}")
    public ResponseEntity<ApiResponse<List<Reservation>>> getByOrganiser(@PathVariable Long organiserId) {
        return ResponseEntity.ok(ApiResponse.success("Fetched",
                reservationService.getReservationsByOrganiser(organiserId)));
    }

    @GetMapping("/ref/{refCode}")
    public ResponseEntity<ApiResponse<Reservation>> getByRefCode(@PathVariable String refCode) {
        return ResponseEntity.ok(ApiResponse.success("Fetched",
                reservationService.getReservationByRefCode(refCode)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteReservation(@PathVariable Long id) {
        reservationService.deleteReservation(id);
        return ResponseEntity.ok(ApiResponse.success("Deleted", "Deleted: " + id));
    }
}