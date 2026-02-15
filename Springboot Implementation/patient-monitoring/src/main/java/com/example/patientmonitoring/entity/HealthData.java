package com.example.patientmonitoring.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Data
public class HealthData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int healthId;

    private String pastRecords;
    private LocalDate recordedDate;
    private LocalTime recordedTime;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;
}

