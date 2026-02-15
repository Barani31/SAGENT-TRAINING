package com.example.budgettracker.repository;

import com.example.budgettracker.entity.Balance;
import com.example.budgettracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BalanceRepository extends JpaRepository<Balance, Integer> {

    Optional<Balance> findByUser(User user);

}
