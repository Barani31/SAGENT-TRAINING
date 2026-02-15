package com.example.budgettracker.controller;

import com.example.budgettracker.entity.Income;
import com.example.budgettracker.service.IncomeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/income")
public class IncomeController {

    @Autowired
    private IncomeService incomeService;

    @PostMapping
    public Income create(@RequestBody Income income) {
        return incomeService.addIncome(income);
    }

    @GetMapping
    public List<Income> getAll() {
        return incomeService.getAllIncome();
    }

    @GetMapping("/{id}")
    public Income getById(@PathVariable int id) {
        return incomeService.getById(id);
    }

    @PutMapping("/{id}")
    public Income update(@PathVariable int id, @RequestBody Income income) {
        income.setIncomeId(id);
        return incomeService.addIncome(income);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        incomeService.delete(id);
    }
}
