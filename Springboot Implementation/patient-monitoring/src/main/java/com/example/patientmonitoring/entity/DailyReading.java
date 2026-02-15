package com.example.patientmonitoring.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
public class DailyReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int readingId;

    private int heartRate;
    private String bloodPressure;
    private int oxygenLevel;
    private double temperature;
    private LocalDate recordedDate;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;
}
