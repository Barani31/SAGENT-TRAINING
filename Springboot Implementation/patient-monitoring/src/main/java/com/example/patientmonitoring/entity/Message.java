package com.example.patientmonitoring.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalTime;

@Entity
@Data
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int messageId;

    private String sender;
    private String message;
    private LocalTime time;

    @ManyToOne
    @JoinColumn(name = "consult_id")
    private Consultation consultation;
}
