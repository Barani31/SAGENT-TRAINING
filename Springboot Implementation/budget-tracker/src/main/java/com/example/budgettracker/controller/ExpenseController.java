package com.example.budgettracker.controller;

import com.example.budgettracker.entity.Expense;
import com.example.budgettracker.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expense")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @PostMapping
    public Expense create(@RequestBody Expense expense) {
        return expenseService.addExpense(expense);
    }

    @GetMapping
    public List<Expense> getAll() {
        return expenseService.getAllExpenses();
    }

    @GetMapping("/{id}")
    public Expense getById(@PathVariable int id) {
        return expenseService.getById(id);
    }

    @PutMapping("/{id}")
    public Expense update(@PathVariable int id, @RequestBody Expense expense) {
        expense.setExpenseId(id);
        return expenseService.addExpense(expense);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        expenseService.delete(id);
    }
}

