package com.example.budgettracker.repository;

import com.example.budgettracker.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BudgetRepository extends JpaRepository<Budget, Integer> {
}
