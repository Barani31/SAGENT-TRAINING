package com.example.patientmonitoring.controller;

import com.example.patientmonitoring.entity.DailyReading;
import com.example.patientmonitoring.service.DailyReadingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/readings")
public class DailyReadingController {

    @Autowired
    private DailyReadingService dailyReadingService;

    @PostMapping
    public DailyReading create(@RequestBody DailyReading reading) {
        return dailyReadingService.save(reading);
    }

    @GetMapping
    public List<DailyReading> getAll() {
        return dailyReadingService.getAll();
    }

    @GetMapping("/{id}")
    public DailyReading getById(@PathVariable int id) {
        return dailyReadingService.getById(id);
    }

    @PutMapping("/{id}")
    public DailyReading update(@PathVariable int id, @RequestBody DailyReading reading) {
        reading.setReadingId(id);
        return dailyReadingService.save(reading);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        dailyReadingService.delete(id);
    }
}

