package com.example.patientmonitoring.controller;

import com.example.patientmonitoring.entity.Doctor;
import com.example.patientmonitoring.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @PostMapping
    public Doctor create(@RequestBody Doctor doctor) {
        return doctorService.save(doctor);
    }

    @GetMapping
    public List<Doctor> getAll() {
        return doctorService.getAll();
    }

    @GetMapping("/{id}")
    public Doctor getById(@PathVariable int id) {
        return doctorService.getById(id);
    }

    @PutMapping("/{id}")
    public Doctor update(@PathVariable int id, @RequestBody Doctor doctor) {
        doctor.setDoctorId(id);
        return doctorService.save(doctor);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        doctorService.delete(id);
    }
}

