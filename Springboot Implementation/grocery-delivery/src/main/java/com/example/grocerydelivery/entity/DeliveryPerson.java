package com.example.grocerydelivery.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class DeliveryPerson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int personId;

    private String name;
    private String phnNo;
    private String gender;
}
