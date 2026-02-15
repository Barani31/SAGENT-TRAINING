package com.example.patientmonitoring.repository;

import com.example.patientmonitoring.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HealthDataRepository extends JpaRepository<HealthData, Integer> {

}
