package com.example.patientmonitoring.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int patientId;

    private String name;
    private int age;
    private String phnNo;
    private String mail;
    private String password;
    private String address;
    private String gender;
}
