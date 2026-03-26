package com.example.seatbookingsystem.repository;

import com.example.seatbookingsystem.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUser_UserId(Long userId);
    List<Notification> findByReservation_ReservationId(Long reservationId);
    List<Notification> findByNotifyType(String notifyType);
    List<Notification> findByUser_UserIdAndNotifyType(Long userId, String notifyType);

    // Count unread notifications for a user
    long countByUser_UserIdAndIsRead(Long userId, boolean isRead);

    // Find all unread notifications for a user
    List<Notification> findByUser_UserIdAndIsRead(Long userId, boolean isRead);

    // Mark all notifications as read for a user
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.userId = :userId AND n.isRead = false")
    int markAllReadByUser(@Param("userId") Long userId);

    // Mark a single notification as read
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.notificationId = :id")
    int markReadById(@Param("id") Long id);
}