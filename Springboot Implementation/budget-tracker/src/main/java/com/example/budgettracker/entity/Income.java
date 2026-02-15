package com.example.budgettracker.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
public class Income {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int incomeId;

    private LocalDate incomeDate;
    private String source;
    private double amount;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}

