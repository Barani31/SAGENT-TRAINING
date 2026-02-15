package com.example.budgettracker.controller;

import com.example.budgettracker.entity.Budget;
import com.example.budgettracker.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budget")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @PostMapping
    public Budget create(@RequestBody Budget budget) {
        return budgetService.createBudget(budget);
    }

    @GetMapping
    public List<Budget> getAll() {
        return budgetService.getAllBudgets();
    }

    @GetMapping("/{id}")
    public Budget getById(@PathVariable int id) {
        return budgetService.getById(id);
    }

    @PutMapping("/{id}")
    public Budget update(@PathVariable int id, @RequestBody Budget budget) {
        budget.setBudgetId(id);
        return budgetService.createBudget(budget);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        budgetService.delete(id);
    }
}

