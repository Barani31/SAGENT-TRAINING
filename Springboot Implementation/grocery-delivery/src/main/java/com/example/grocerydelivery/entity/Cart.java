package com.example.grocerydelivery.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int cartId;

    private double totalPrice;
    private double discount;

    @OneToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;
}
