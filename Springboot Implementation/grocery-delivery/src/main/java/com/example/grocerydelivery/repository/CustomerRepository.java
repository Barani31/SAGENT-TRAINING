package com.example.grocerydelivery.repository;

import com.example.grocerydelivery.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {

}

