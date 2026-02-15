package com.example.budgettracker.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Balance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int balanceId;

    private double totalIncome;
    private double totalExpense;
    private double balance;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}

