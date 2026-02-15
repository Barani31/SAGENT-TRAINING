package com.example.budgettracker.service;

import com.example.budgettracker.entity.Balance;
import com.example.budgettracker.entity.Expense;
import com.example.budgettracker.entity.Income;
import com.example.budgettracker.entity.User;
import com.example.budgettracker.repository.BalanceRepository;
import com.example.budgettracker.repository.ExpenseRepository;
import com.example.budgettracker.repository.IncomeRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BalanceService {

    @Autowired
    private BalanceRepository balanceRepository;

    @Autowired
    private IncomeRepository incomeRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    public void updateBalance(User user) {

        double totalIncome = 0;
        double totalExpense = 0;

        for (Income income : incomeRepository.findAll()) {
            if (income.getUser().getUserId() == user.getUserId()) {
                totalIncome += income.getAmount();
            }
        }

        for (Expense expense : expenseRepository.findAll()) {
            if (expense.getUser().getUserId() == user.getUserId()) {
                totalExpense += expense.getAmount();
            }
        }

        Balance balance = balanceRepository.findByUser(user)
                .orElse(new Balance());

        balance.setUser(user);
        balance.setTotalIncome(totalIncome);
        balance.setTotalExpense(totalExpense);
        balance.setBalance(totalIncome - totalExpense);

        balanceRepository.save(balance);
    }

    public Balance getBalanceByUser(User user) {
        return balanceRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Balance not found"));
    }

    public void delete(int id) {
        balanceRepository.deleteById(id);
    }
}
