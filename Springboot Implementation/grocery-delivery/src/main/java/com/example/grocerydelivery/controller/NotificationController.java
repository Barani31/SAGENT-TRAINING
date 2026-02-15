package com.example.grocerydelivery.controller;

import com.example.grocerydelivery.entity.Notification;
import com.example.grocerydelivery.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @PostMapping
    public Notification create(@RequestBody Notification notification) {
        return notificationService.save(notification);
    }

    @GetMapping
    public List<Notification> getAll() {
        return notificationService.getAll();
    }

    @GetMapping("/{id}")
    public Notification getById(@PathVariable int id) {
        return notificationService.getById(id);
    }

    @PutMapping("/{id}")
    public Notification update(@PathVariable int id,
                               @RequestBody Notification notification) {
        notification.setNotifyId(id);
        return notificationService.save(notification);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        notificationService.delete(id);
    }
}

