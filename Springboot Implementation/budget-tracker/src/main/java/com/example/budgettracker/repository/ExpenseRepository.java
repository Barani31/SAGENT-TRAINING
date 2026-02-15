package com.example.budgettracker.repository;

import com.example.budgettracker.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseRepository extends JpaRepository<Expense, Integer> {
}
