package com.example.budgettracker.service;

import com.example.budgettracker.entity.Budget;
import com.example.budgettracker.repository.BudgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    public Budget createBudget(Budget budget) {
        return budgetRepository.save(budget);
    }

    public List<Budget> getAllBudgets() {
        return budgetRepository.findAll();
    }

    public Budget getById(int id) {
        return budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
    }

    public void delete(int id) {
        budgetRepository.deleteById(id);
    }

}
