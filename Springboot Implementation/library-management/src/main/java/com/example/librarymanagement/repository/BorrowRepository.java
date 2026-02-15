package com.example.librarymanagement.repository;

import com.example.librarymanagement.entity.Borrow;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BorrowRepository extends JpaRepository<Borrow, Integer> {
}
