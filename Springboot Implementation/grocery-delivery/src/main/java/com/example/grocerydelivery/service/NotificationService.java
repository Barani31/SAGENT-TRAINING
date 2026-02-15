package com.example.grocerydelivery.service;

import com.example.grocerydelivery.entity.Notification;
import com.example.grocerydelivery.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification save(Notification notification) {
        notification.setSentTime(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    public List<Notification> getAll() {
        return notificationRepository.findAll();
    }

    public Notification getById(int id) {
        return notificationRepository.findById(id).orElseThrow();
    }

    public void delete(int id) {
        notificationRepository.deleteById(id);
    }
}

