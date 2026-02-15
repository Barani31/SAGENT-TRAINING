package com.example.patientmonitoring.repository;

import com.example.patientmonitoring.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DailyReadingRepository extends JpaRepository<DailyReading, Integer> {

}
