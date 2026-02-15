package com.example.librarymanagement.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int notifyId;

    @ManyToOne
    @JoinColumn(name = "mem_id")
    private Member member;

    private String message;
    private LocalDate sentDate;
}
