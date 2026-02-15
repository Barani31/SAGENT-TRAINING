package com.example.budgettracker.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int expenseId;

    private String category;
    private double amount;
    private LocalDate spentDate;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}

