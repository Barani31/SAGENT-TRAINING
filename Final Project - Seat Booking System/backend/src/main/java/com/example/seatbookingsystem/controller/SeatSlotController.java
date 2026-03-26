package com.example.seatbookingsystem.controller;

import com.example.seatbookingsystem.dto.ApiResponse;
import com.example.seatbookingsystem.service.SeatHoldService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/seat-slots")
@RequiredArgsConstructor
public class SeatSlotController {

    private final SeatHoldService seatHoldService;

    // Lock seats when user proceeds to payment (2 min hold)
    @PostMapping("/lock")
    public ResponseEntity<ApiResponse<Map<String, Object>>> lockSeats(
            @RequestParam Long slotId,
            @RequestParam Long userId,
            @RequestBody List<Long> seatSlotIds) {
        seatHoldService.lockSeats(slotId, seatSlotIds, userId);
        int remaining = seatHoldService.getRemainingHoldSeconds(slotId, userId);
        return ResponseEntity.ok(ApiResponse.success("Seats locked",
                Map.of("lockedCount", seatSlotIds.size(), "holdSeconds", remaining, "holdMinutes", 2)));
    }

    // Release locks when user goes back or abandons
    @PostMapping("/release")
    public ResponseEntity<ApiResponse<String>> releaseSeats(
            @RequestParam Long slotId,
            @RequestParam Long userId) {
        seatHoldService.releaseLocksForUser(slotId, userId);
        return ResponseEntity.ok(ApiResponse.success("Seats released", "OK"));
    }

    // Check remaining hold time
    @GetMapping("/hold-timer")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHoldTimer(
            @RequestParam Long slotId,
            @RequestParam Long userId) {
        int seconds = seatHoldService.getRemainingHoldSeconds(slotId, userId);
        return ResponseEntity.ok(ApiResponse.success("Timer",
                Map.of("remainingSeconds", seconds, "expired", seconds <= 0)));
    }
}