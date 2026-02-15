package com.example.patientmonitoring.controller;

import com.example.patientmonitoring.entity.Consultation;
import com.example.patientmonitoring.service.ConsultationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consultations")
public class ConsultationController {

    @Autowired
    private ConsultationService consultationService;

    @PostMapping
    public Consultation create(@RequestBody Consultation consultation) {
        return consultationService.save(consultation);
    }

    @GetMapping
    public List<Consultation> getAll() {
        return consultationService.getAll();
    }

    @GetMapping("/{id}")
    public Consultation getById(@PathVariable int id) {
        return consultationService.getById(id);
    }

    @PutMapping("/{id}")
    public Consultation update(@PathVariable int id, @RequestBody Consultation consultation) {
        consultation.setConsultId(id);
        return consultationService.save(consultation);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        consultationService.delete(id);
    }
}
