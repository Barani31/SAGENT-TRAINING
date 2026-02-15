package com.example.budgettracker.repository;

import com.example.budgettracker.entity.SavingsGoal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, Integer> {
}
