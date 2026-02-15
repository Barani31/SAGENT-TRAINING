package com.example.patientmonitoring.service;

import com.example.patientmonitoring.entity.Appointment;
import com.example.patientmonitoring.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    public Appointment save(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getAll() {
        return appointmentRepository.findAll();
    }

    public Appointment getById(int id) {
        return appointmentRepository.findById(id).orElseThrow();
    }

    public void delete(int id) {
        appointmentRepository.deleteById(id);
    }
}

