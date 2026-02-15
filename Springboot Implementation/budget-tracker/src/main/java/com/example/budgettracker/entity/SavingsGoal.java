package com.example.budgettracker.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class SavingsGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int goalId;

    private String goalName;
    private double targetAmount;
    private double currentAmount;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}

