package com.example.collegeadmission.controller;

import com.example.collegeadmission.entity.Application;
import com.example.collegeadmission.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @PostMapping
    public Application apply(@RequestBody Application application) {
        return applicationService.apply(application);
    }

    @GetMapping
    public List<Application> getAll() {
        return applicationService.getAll();
    }

    @GetMapping("/{id}")
    public Application getById(@PathVariable int id) {
        return applicationService.getById(id);
    }

    @PutMapping("/{id}")
    public Application update(@PathVariable int id, @RequestBody Application application) {
        application.setApplicationId(id);
        return applicationService.save(application);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        applicationService.delete(id);
    }
}

