package com.example.patientmonitoring.controller;

import com.example.patientmonitoring.entity.Patient;
import com.example.patientmonitoring.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @PostMapping
    public Patient create(@RequestBody Patient patient) {
        return patientService.save(patient);
    }

    @GetMapping
    public List<Patient> getAll() {
        return patientService.getAll();
    }

    @GetMapping("/{id}")
    public Patient getById(@PathVariable int id) {
        return patientService.getById(id);
    }

    @PutMapping("/{id}")
    public Patient update(@PathVariable int id, @RequestBody Patient patient) {
        patient.setPatientId(id);
        return patientService.save(patient);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        patientService.delete(id);
    }
}
