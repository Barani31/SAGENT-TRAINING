package com.example.budgettracker.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int notificationId;

    private String message;
    private LocalDate sentDate;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}

