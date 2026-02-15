package com.example.patientmonitoring.controller;

import com.example.patientmonitoring.entity.HealthData;
import com.example.patientmonitoring.service.HealthDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/health-data")
public class HealthDataController {

    @Autowired
    private HealthDataService healthDataService;

    @PostMapping
    public HealthData create(@RequestBody HealthData data) {
        return healthDataService.save(data);
    }

    @GetMapping
    public List<HealthData> getAll() {
        return healthDataService.getAll();
    }

    @GetMapping("/{id}")
    public HealthData getById(@PathVariable int id) {
        return healthDataService.getById(id);
    }

    @PutMapping("/{id}")
    public HealthData update(@PathVariable int id, @RequestBody HealthData data) {
        data.setHealthId(id);
        return healthDataService.save(data);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        healthDataService.delete(id);
    }
}

