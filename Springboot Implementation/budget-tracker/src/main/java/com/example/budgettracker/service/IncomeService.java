package com.example.budgettracker.service;

import com.example.budgettracker.entity.Income;
import com.example.budgettracker.repository.IncomeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IncomeService {

    @Autowired
    private IncomeRepository incomeRepository;

    @Autowired
    private BalanceService balanceService;

    public Income addIncome(Income income) {
        Income savedIncome = incomeRepository.save(income);
        balanceService.updateBalance(income.getUser());
        return savedIncome;
    }

    public List<Income> getAllIncome() {
        return incomeRepository.findAll();
    }

    public Income getById(int id) {
        return incomeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Income not found"));
    }

    public void delete(int id) {
        incomeRepository.deleteById(id);
    }

}
