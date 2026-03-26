package com.example.seatbookingsystem.controller;

import com.example.seatbookingsystem.dto.ApiResponse;
import com.example.seatbookingsystem.dto.ReviewRequest;
import com.example.seatbookingsystem.entity.Review;
import com.example.seatbookingsystem.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ApiResponse<Review>> submitReview(@RequestBody ReviewRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review submitted", reviewService.submitReview(req)));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<ApiResponse<List<Review>>> getByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(ApiResponse.success("Fetched",
                reviewService.getReviewsByEvent(eventId)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Review>>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Fetched",
                reviewService.getReviewsByUser(userId)));
    }

    @GetMapping("/event/{eventId}/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSummary(@PathVariable Long eventId) {
        return ResponseEntity.ok(ApiResponse.success("Fetched",
                reviewService.getEventRatingSummary(eventId)));
    }

    @GetMapping("/check/{reservationId}")
    public ResponseEntity<ApiResponse<Boolean>> hasReviewed(@PathVariable Long reservationId) {
        return ResponseEntity.ok(ApiResponse.success("Checked",
                reviewService.hasReviewed(reservationId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.success("Deleted", "Deleted: " + id));
    }
}