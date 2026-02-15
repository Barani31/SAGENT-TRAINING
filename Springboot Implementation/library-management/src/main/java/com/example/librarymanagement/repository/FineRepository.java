package com.example.librarymanagement.repository;

import com.example.librarymanagement.entity.Fine;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FineRepository extends JpaRepository<Fine, Integer> {
}

