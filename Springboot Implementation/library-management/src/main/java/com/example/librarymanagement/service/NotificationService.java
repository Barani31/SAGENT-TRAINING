package com.example.librarymanagement.service;

import com.example.librarymanagement.entity.Member;
import com.example.librarymanagement.entity.Notification;
import com.example.librarymanagement.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public void sendNotification(Member member, String message) {
        Notification notification = new Notification();
        notification.setMember(member);
        notification.setMessage(message);
        notification.setSentDate(LocalDate.now());
        notificationRepository.save(notification);
    }
}

