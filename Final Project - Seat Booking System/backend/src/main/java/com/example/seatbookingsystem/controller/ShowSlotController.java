package com.example.seatbookingsystem.controller;

import com.example.seatbookingsystem.dto.*;
import com.example.seatbookingsystem.entity.SeatSlot;
import com.example.seatbookingsystem.entity.ShowSlot;
import com.example.seatbookingsystem.service.ShowSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
public class ShowSlotController {

    private final ShowSlotService showSlotService;

    @PostMapping
    public ResponseEntity<ApiResponse<ShowSlot>> createSlot(@RequestBody ShowSlotRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Slot created", showSlotService.createSlot(req)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShowSlot>>> getAllSlots() {
        return ResponseEntity.ok(ApiResponse.success("Slots fetched", showSlotService.getAllSlots()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowSlot>> getSlotById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Slot fetched", showSlotService.getSlotById(id)));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<ApiResponse<List<ShowSlot>>> getByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(ApiResponse.success("Slots fetched",
                showSlotService.getSlotsByEvent(eventId)));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<ApiResponse<List<ShowSlot>>> getByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success("Slots fetched", showSlotService.getSlotsByDate(date)));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<ShowSlot>>> getAvailable() {
        return ResponseEntity.ok(ApiResponse.success("Available slots", showSlotService.getAvailableSlots()));
    }

    @GetMapping("/{slotId}/seats/available")
    public ResponseEntity<ApiResponse<List<SeatSlot>>> getAvailableSeats(@PathVariable Long slotId) {
        return ResponseEntity.ok(ApiResponse.success("Available seats",
                showSlotService.getAvailableSeatsForSlot(slotId)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowSlot>> updateSlot(@PathVariable Long id,
                                                            @RequestBody ShowSlotRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Slot updated", showSlotService.updateSlot(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteSlot(@PathVariable Long id) {
        showSlotService.deleteSlot(id);
        return ResponseEntity.ok(ApiResponse.success("Slot deleted", "Deleted: " + id));
    }

    @GetMapping("/{slotId}/seats/all")
    public ResponseEntity<ApiResponse<List<SeatSlot>>> getAllSeatsForSlot(@PathVariable Long slotId) {
        return ResponseEntity.ok(ApiResponse.success("All seats",
                showSlotService.getAllSeatsForSlot(slotId)));
    }

    @PostMapping("/{slotId}/seats/sync")
    public ResponseEntity<ApiResponse<String>> syncSeats(@PathVariable Long slotId) {
        showSlotService.syncNewSeatsToSlot(slotId);
        return ResponseEntity.ok(ApiResponse.success("Seats synced", "Done"));
    }
}