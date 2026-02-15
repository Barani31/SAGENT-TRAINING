package com.example.grocerydelivery.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int paymentId;

    private String mode;
    private String status;
    private double amount;

    @OneToOne
    @JoinColumn(name = "order_id")
    private Order order;
}
