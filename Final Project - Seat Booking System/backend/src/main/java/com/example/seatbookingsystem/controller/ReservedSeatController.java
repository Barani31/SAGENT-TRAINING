package com.example.seatbookingsystem.controller;

import com.example.seatbookingsystem.dto.ApiResponse;
import com.example.seatbookingsystem.entity.ReservedSeat;
import com.example.seatbookingsystem.repository.ReservedSeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/reserved-seats")
@RequiredArgsConstructor
public class ReservedSeatController {

    private final ReservedSeatRepository reservedSeatRepository;

    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<ApiResponse<List<ReservedSeat>>> getByReservation(
            @PathVariable Long reservationId) {
        return ResponseEntity.ok(ApiResponse.success("Fetched",
                reservedSeatRepository.findByReservation_ReservationId(reservationId)));
    }
}