package com.example.seatbookingsystem.controller;

import com.example.seatbookingsystem.dto.*;
import com.example.seatbookingsystem.entity.Cancellation;
import com.example.seatbookingsystem.service.CancellationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/cancellations")
@RequiredArgsConstructor
public class CancellationController {

    private final CancellationService cancellationService;

    @PostMapping
    public ResponseEntity<ApiResponse<Cancellation>> cancel(@RequestBody CancellationRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Cancelled, refund initiated",
                        cancellationService.cancelReservation(req)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Cancellation>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Fetched", cancellationService.getAllCancellations()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Cancellation>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Fetched",
                cancellationService.getCancellationById(id)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Cancellation>>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Fetched",
                cancellationService.getCancellationsByUser(userId)));
    }

    @PutMapping("/{id}/refund-status")
    public ResponseEntity<ApiResponse<Cancellation>> updateRefundStatus(@PathVariable Long id,
                                                                        @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.success("Refund status updated",
                cancellationService.updateRefundStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        cancellationService.deleteCancellation(id);
        return ResponseEntity.ok(ApiResponse.success("Deleted", "Deleted: " + id));
    }
}