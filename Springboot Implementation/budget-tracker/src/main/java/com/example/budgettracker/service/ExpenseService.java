package com.example.budgettracker.service;

import com.example.budgettracker.entity.Expense;
import com.example.budgettracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private BalanceService balanceService;

    public Expense addExpense(Expense expense) {
        Expense savedExpense = expenseRepository.save(expense);
        balanceService.updateBalance(expense.getUser());
        return savedExpense;
    }

    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    public Expense getById(int id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
    }

    public void delete(int id) {
        expenseRepository.deleteById(id);
    }

}

