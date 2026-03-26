package com.example.seatbookingsystem.controller;

import com.example.seatbookingsystem.dto.ApiResponse;
import com.example.seatbookingsystem.entity.Notification;
import com.example.seatbookingsystem.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Fetched", notificationService.getAllNotifications()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Notification>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Fetched", notificationService.getNotificationById(id)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Notification>>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Fetched", notificationService.getNotificationsByUser(userId)));
    }

    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<ApiResponse<List<Notification>>> getByReservation(@PathVariable Long reservationId) {
        return ResponseEntity.ok(ApiResponse.success("Fetched", notificationService.getNotificationsByReservation(reservationId)));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse<List<Notification>>> getByType(@PathVariable String type) {
        return ResponseEntity.ok(ApiResponse.success("Fetched", notificationService.getNotificationsByType(type)));
    }

    // ── Unread count ──────────────────────────────────────────────────────────
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(@PathVariable Long userId) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success("Fetched", Map.of("unreadCount", count)));
    }

    // ── Mark all read ─────────────────────────────────────────────────────────
    @PutMapping("/user/{userId}/mark-all-read")
    public ResponseEntity<ApiResponse<String>> markAllRead(@PathVariable Long userId) {
        int updated = notificationService.markAllRead(userId);
        return ResponseEntity.ok(ApiResponse.success("Marked " + updated + " notifications as read", "ok"));
    }

    // ── Mark single read ──────────────────────────────────────────────────────
    @PutMapping("/{id}/mark-read")
    public ResponseEntity<ApiResponse<String>> markRead(@PathVariable Long id) {
        notificationService.markRead(id);
        return ResponseEntity.ok(ApiResponse.success("Marked as read", "ok"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(ApiResponse.success("Deleted", "Deleted: " + id));
    }
}