package com.example.budgettracker.repository;

import com.example.budgettracker.entity.Income;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncomeRepository extends JpaRepository<Income, Integer> {

}
