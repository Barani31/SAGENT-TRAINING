package com.example.patientmonitoring.service;

import com.example.patientmonitoring.entity.Doctor;
import com.example.patientmonitoring.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    public Doctor save(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    public List<Doctor> getAll() {
        return doctorRepository.findAll();
    }

    public Doctor getById(int id) {
        return doctorRepository.findById(id).orElseThrow();
    }

    public void delete(int id) {
        doctorRepository.deleteById(id);
    }
}

