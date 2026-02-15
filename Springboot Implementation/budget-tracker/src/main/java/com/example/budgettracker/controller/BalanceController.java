package com.example.budgettracker.controller;

import com.example.budgettracker.entity.Balance;
import com.example.budgettracker.entity.User;
import com.example.budgettracker.service.BalanceService;
import com.example.budgettracker.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/balance")
public class BalanceController {

    @Autowired
    private BalanceService balanceService;

    @Autowired
    private UserService userService;

    @GetMapping("/{userId}")
    public Balance getBalance(@PathVariable int userId) {
        User user = userService.getUserById(userId);
        return balanceService.getBalanceByUser(user);
    }

    @PutMapping("/{userId}")
    public void updateBalance(@PathVariable int userId) {
        User user = userService.getUserById(userId);
        balanceService.updateBalance(user);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        balanceService.delete(id);
    }
}
