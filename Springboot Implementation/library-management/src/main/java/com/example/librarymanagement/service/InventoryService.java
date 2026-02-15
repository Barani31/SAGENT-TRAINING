package com.example.librarymanagement.service;

import com.example.librarymanagement.entity.Book;
import com.example.librarymanagement.entity.Inventory;
import com.example.librarymanagement.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    public void reduceAvailableCopies(Inventory inventory) {
        inventory.setAvailableCopies(inventory.getAvailableCopies() - 1);
        inventory.setLastUpdated(LocalDate.now());
        inventoryRepository.save(inventory);
    }

    public void increaseAvailableCopies(Book book) {
        Inventory inventory = inventoryRepository.findByBook(book)
                .orElseThrow(() -> new RuntimeException("Inventory not found"));

        inventory.setAvailableCopies(inventory.getAvailableCopies() + 1);
        inventory.setLastUpdated(LocalDate.now());
        inventoryRepository.save(inventory);
    }

}
