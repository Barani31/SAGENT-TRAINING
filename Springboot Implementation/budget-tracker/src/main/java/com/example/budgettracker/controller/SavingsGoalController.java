package com.example.budgettracker.controller;

import com.example.budgettracker.entity.SavingsGoal;
import com.example.budgettracker.entity.User;
import com.example.budgettracker.service.SavingsGoalService;
import com.example.budgettracker.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class SavingsGoalController {

    @Autowired
    private SavingsGoalService savingsGoalService;

    @Autowired
    private UserService userService;

    @PostMapping("/{userId}")
    public SavingsGoal create(@PathVariable int userId,
                              @RequestBody SavingsGoal goal) {
        User user = userService.getUserById(userId);
        goal.setUser(user);
        return savingsGoalService.addGoal(goal);
    }

    @GetMapping("/{userId}")
    public List<SavingsGoal> getAll(@PathVariable int userId) {
        User user = userService.getUserById(userId);
        return savingsGoalService.getGoalsByUser(user);
    }

    @PutMapping("/{goalId}")
    public SavingsGoal update(@PathVariable int goalId,
                              @RequestBody SavingsGoal goal) {
        goal.setGoalId(goalId);
        return savingsGoalService.addGoal(goal);
    }

    @DeleteMapping("/{goalId}")
    public void delete(@PathVariable int goalId) {
        savingsGoalService.delete(goalId);
    }
}

