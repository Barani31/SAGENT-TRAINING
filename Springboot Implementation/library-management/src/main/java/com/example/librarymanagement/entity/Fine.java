package com.example.librarymanagement.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
public class Fine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int fineId;

    @OneToOne
    @JoinColumn(name = "borrow_id")
    private Borrow borrow;

    private double fineAmount;
    private LocalDate fineDate;
    private String status;
}

