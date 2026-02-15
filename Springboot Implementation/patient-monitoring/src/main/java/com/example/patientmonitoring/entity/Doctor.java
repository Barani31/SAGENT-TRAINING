package com.example.patientmonitoring.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int doctorId;

    private String name;
    private String email;
    private String password;
    private String specialization;
    private String contactNo;
}

