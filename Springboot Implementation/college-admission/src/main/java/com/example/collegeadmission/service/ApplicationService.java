package com.example.collegeadmission.service;

import com.example.collegeadmission.entity.Application;
import com.example.collegeadmission.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    public Application apply(Application application) {
        application.setStatus("APPLIED");
        application.setAppliedDate(LocalDate.now());
        return applicationRepository.save(application);
    }

    public Application save(Application application) {
        return applicationRepository.save(application);
    }

    public List<Application> getAll() {
        return applicationRepository.findAll();
    }

    public Application getById(int id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
    }

    public void delete(int id) {
        applicationRepository.deleteById(id);
    }
}


