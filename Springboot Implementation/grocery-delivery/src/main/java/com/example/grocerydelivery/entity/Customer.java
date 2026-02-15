package com.example.grocerydelivery.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int customerId;

    private String name;
    private String mail;
    private String password;
    private String phnNo;
    private String address;
}
