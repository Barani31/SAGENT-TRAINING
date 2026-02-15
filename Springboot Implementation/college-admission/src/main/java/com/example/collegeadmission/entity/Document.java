package com.example.collegeadmission.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int documentId;

    private String docType;
    private LocalDate uploadedDate;

    @OneToOne
    @JoinColumn(name = "application_id")
    private Application application;
}
