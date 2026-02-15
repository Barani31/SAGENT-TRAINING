package com.example.collegeadmission.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int paymentId;

    private String paymentMode;
    private String status;
    private LocalDate paymentDate;
    private LocalDate deadline;

    @OneToOne
    @JoinColumn(name = "application_id")
    private Application application;
}
