package com.example.librarymanagement.entity;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int memId;

    private String name;
    private String email;
    private String password;
    private String address;
    private String phNo;

    // Staff / Student
    private String category;
}
