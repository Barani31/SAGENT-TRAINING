package com.example.librarymanagement.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int inventoryId;

    @OneToOne
    @JoinColumn(name = "book_id")
    private Book book;

    private int totalCopies;
    private int availableCopies;
    private int lostCopies;
    private int damagedCopies;
    private LocalDate lastUpdated;
}
