package com.example.collegeadmission.controller;

import com.example.collegeadmission.entity.Officer;
import com.example.collegeadmission.service.OfficerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/officers")
public class OfficerController {

    @Autowired
    private OfficerService officerService;

    @PostMapping
    public Officer create(@RequestBody Officer officer) {
        return officerService.save(officer);
    }

    @GetMapping
    public List<Officer> getAll() {
        return officerService.getAll();
    }

    @GetMapping("/{id}")
    public Officer getById(@PathVariable int id) {
        return officerService.getById(id);
    }

    @PutMapping("/{id}")
    public Officer update(@PathVariable int id, @RequestBody Officer officer) {
        officer.setOfficerId(id);
        return officerService.save(officer);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        officerService.delete(id);
    }
}
