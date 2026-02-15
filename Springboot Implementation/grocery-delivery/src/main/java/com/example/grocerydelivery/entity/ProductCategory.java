package com.example.grocerydelivery.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class ProductCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int categoryId;

    private String categoryType;
}
