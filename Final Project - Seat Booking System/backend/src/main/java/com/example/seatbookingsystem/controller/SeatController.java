package com.example.seatbookingsystem.controller;

import com.example.seatbookingsystem.dto.ApiResponse;
import com.example.seatbookingsystem.dto.BulkSeatRequest;
import com.example.seatbookingsystem.dto.FamilyPackRequest;
import com.example.seatbookingsystem.entity.Seat;
import com.example.seatbookingsystem.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;

    @PostMapping("/location/{locationId}")
    public ResponseEntity<ApiResponse<Seat>> createSeat(@RequestBody Seat seat, @PathVariable Long locationId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Seat created", seatService.createSeat(seat, locationId)));
    }

    @PostMapping("/location/{locationId}/bulk")
    public ResponseEntity<ApiResponse<List<Seat>>> createBulkSeats(@PathVariable Long locationId, @RequestBody BulkSeatRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Seats created", seatService.createBulkSeats(locationId, req)));
    }

    // ── Family Pack ───────────────────────────────────────────────────────────
    @PostMapping("/location/{locationId}/family-pack")
    public ResponseEntity<ApiResponse<List<Seat>>> createFamilyPack(
            @PathVariable Long locationId, @RequestBody FamilyPackRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Family pack created", seatService.createFamilyPack(locationId, req)));
    }

    @GetMapping("/family-group/{groupId}")
    public ResponseEntity<ApiResponse<List<Seat>>> getFamilyGroup(@PathVariable String groupId) {
        return ResponseEntity.ok(ApiResponse.success("Fetched", seatService.getSeatsByFamilyGroup(groupId)));
    }

    @DeleteMapping("/family-group/{groupId}")
    public ResponseEntity<ApiResponse<String>> deleteFamilyPack(@PathVariable String groupId) {
        seatService.deleteFamilyPack(groupId);
        return ResponseEntity.ok(ApiResponse.success("Deleted", "Group " + groupId + " removed"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Seat>>> getAllSeats() {
        return ResponseEntity.ok(ApiResponse.success("Fetched", seatService.getAllSeats()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Seat>> getSeatById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Fetched", seatService.getSeatById(id)));
    }

    @GetMapping("/location/{locationId}")
    public ResponseEntity<ApiResponse<List<Seat>>> getByLocation(@PathVariable Long locationId) {
        return ResponseEntity.ok(ApiResponse.success("Fetched", seatService.getSeatsByLocation(locationId)));
    }

    @GetMapping("/location/{locationId}/type/{type}")
    public ResponseEntity<ApiResponse<List<Seat>>> getByType(@PathVariable Long locationId, @PathVariable String type) {
        return ResponseEntity.ok(ApiResponse.success("Fetched", seatService.getSeatsByLocationAndType(locationId, type)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Seat>> updateSeat(@PathVariable Long id, @RequestBody Seat req) {
        return ResponseEntity.ok(ApiResponse.success("Updated", seatService.updateSeat(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteSeat(@PathVariable Long id) {
        seatService.deleteSeat(id);
        return ResponseEntity.ok(ApiResponse.success("Deleted", "Deleted: " + id));
    }
}