package com.example.budgettracker.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int budgetId;

    private String month;
    private double monthLimit;

    @ManyToOne
    @JoinColumn(name = "income_id")
    private Income income;

    @ManyToOne
    @JoinColumn(name = "expense_id")
    private Expense expense;
}

