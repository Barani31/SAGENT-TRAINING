package com.example.patientmonitoring.controller;

import com.example.patientmonitoring.entity.Report;
import com.example.patientmonitoring.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @PostMapping
    public Report create(@RequestBody Report report) {
        return reportService.save(report);
    }

    @GetMapping
    public List<Report> getAll() {
        return reportService.getAll();
    }

    @GetMapping("/{id}")
    public Report getById(@PathVariable int id) {
        return reportService.getById(id);
    }

    @PutMapping("/{id}")
    public Report update(@PathVariable int id, @RequestBody Report report) {
        report.setReportId(id);
        return reportService.save(report);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        reportService.delete(id);
    }
}

