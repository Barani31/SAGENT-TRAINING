package com.example.budgettracker.controller;

import com.example.budgettracker.entity.Notification;
import com.example.budgettracker.repository.NotificationRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @PostMapping
    public Notification create(@RequestBody Notification notification) {
        return notificationRepository.save(notification);
    }

    @GetMapping
    public List<Notification> getAll() {
        return notificationRepository.findAll();
    }

    @GetMapping("/{id}")
    public Notification getById(@PathVariable int id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
    }

    @PutMapping("/{id}")
    public Notification update(@PathVariable int id,
                               @RequestBody Notification notification) {
        notification.setNotificationId(id);
        return notificationRepository.save(notification);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        notificationRepository.deleteById(id);
    }
}

