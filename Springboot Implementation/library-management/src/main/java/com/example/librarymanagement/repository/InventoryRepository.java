package com.example.librarymanagement.repository;

import com.example.librarymanagement.entity.Book;
import com.example.librarymanagement.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Integer> {
    Optional<Inventory> findByBook(Book book);
}
