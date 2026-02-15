package com.example.budgettracker.controller;

import com.example.budgettracker.entity.User;
import com.example.budgettracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping
    public User addUser(@RequestBody User user) {
        return userService.addUser(user);
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable int id) {
        return userService.getUserById(id);
    }

    @PutMapping("/{id}")
    public User update(@PathVariable int id, @RequestBody User user) {
        User existing = userService.getUserById(id);
        user.setUserId(existing.getUserId());
        return userService.addUser(user);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        userService.deleteUser(id);
    }
}

