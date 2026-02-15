package com.example.grocerydelivery.repository;

import com.example.grocerydelivery.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Integer> {

}
