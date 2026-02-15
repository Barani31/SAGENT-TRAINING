package com.example.collegeadmission.service;

import com.example.collegeadmission.entity.Officer;
import com.example.collegeadmission.repository.OfficerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OfficerService {

    @Autowired
    private OfficerRepository officerRepository;

    public Officer save(Officer officer) {
        return officerRepository.save(officer);
    }

    public List<Officer> getAll() {
        return officerRepository.findAll();
    }

    public Officer getById(int id) {
        return officerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Officer not found"));
    }

    public void delete(int id) {
        officerRepository.deleteById(id);
    }
}

