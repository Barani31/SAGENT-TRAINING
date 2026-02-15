package com.example.budgettracker.service;

import com.example.budgettracker.entity.SavingsGoal;
import com.example.budgettracker.entity.User;
import com.example.budgettracker.repository.SavingsGoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SavingsGoalService {

    @Autowired
    private SavingsGoalRepository savingsGoalRepository;

    public SavingsGoal addGoal(SavingsGoal goal) {
        return savingsGoalRepository.save(goal);
    }

    public List<SavingsGoal> getGoalsByUser(User user) {
        return savingsGoalRepository.findAll().stream()
                .filter(g -> g.getUser().getUserId() == user.getUserId())
                .toList();
    }

    public void delete(int id) {
        savingsGoalRepository.deleteById(id);
    }

}

