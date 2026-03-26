package com.example.seatbookingsystem.service;

import com.example.seatbookingsystem.entity.Notification;
import com.example.seatbookingsystem.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public List<Notification> getNotificationsByUser(Long userId) {
        return notificationRepository.findByUser_UserId(userId);
    }

    public List<Notification> getNotificationsByReservation(Long reservationId) {
        return notificationRepository.findByReservation_ReservationId(reservationId);
    }

    public List<Notification> getNotificationsByType(String type) {
        return notificationRepository.findByNotifyType(type);
    }

    public Notification getNotificationById(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + id));
    }

    // ── Unread count ──────────────────────────────────────────────────────────
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUser_UserIdAndIsRead(userId, false);
    }

    // ── Mark all read for a user ──────────────────────────────────────────────
    @Transactional
    public int markAllRead(Long userId) {
        return notificationRepository.markAllReadByUser(userId);
    }

    // ── Mark single notification read ─────────────────────────────────────────
    @Transactional
    public void markRead(Long id) {
        notificationRepository.markReadById(id);
    }

    public void deleteNotification(Long id) {
        if (!notificationRepository.existsById(id))
            throw new RuntimeException("Notification not found: " + id);
        notificationRepository.deleteById(id);
    }
}