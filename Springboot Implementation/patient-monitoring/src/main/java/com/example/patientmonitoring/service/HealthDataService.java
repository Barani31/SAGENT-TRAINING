package com.example.patientmonitoring.service;

import com.example.patientmonitoring.entity.HealthData;
import com.example.patientmonitoring.repository.HealthDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HealthDataService {

    @Autowired
    private HealthDataRepository healthDataRepository;

    public HealthData save(HealthData data) {
        return healthDataRepository.save(data);
    }

    public List<HealthData> getAll() {
        return healthDataRepository.findAll();
    }

    public HealthData getById(int id) {
        return healthDataRepository.findById(id).orElseThrow();
    }

    public void delete(int id) {
        healthDataRepository.deleteById(id);
    }
}
