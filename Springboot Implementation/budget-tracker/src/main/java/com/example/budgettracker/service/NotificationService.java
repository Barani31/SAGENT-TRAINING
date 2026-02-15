package com.example.budgettracker.service;

import com.example.budgettracker.entity.Notification;
import com.example.budgettracker.entity.User;
import com.example.budgettracker.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public void sendNotification(User user, String message) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setSentDate(LocalDate.now());

        notificationRepository.save(notification);
    }
}
