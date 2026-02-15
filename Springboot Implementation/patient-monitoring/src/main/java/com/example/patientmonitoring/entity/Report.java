package com.example.patientmonitoring.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int reportId;

    private String reportDetails;
    private String filePath;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "health_id")
    private HealthData healthData;
}

