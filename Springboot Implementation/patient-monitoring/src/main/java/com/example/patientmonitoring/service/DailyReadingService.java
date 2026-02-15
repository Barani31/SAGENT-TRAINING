package com.example.patientmonitoring.service;

import com.example.patientmonitoring.entity.DailyReading;
import com.example.patientmonitoring.repository.DailyReadingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DailyReadingService {

    @Autowired
    private DailyReadingRepository dailyReadingRepository;

    public DailyReading save(DailyReading reading) {
        return dailyReadingRepository.save(reading);
    }

    public List<DailyReading> getAll() {
        return dailyReadingRepository.findAll();
    }

    public DailyReading getById(int id) {
        return dailyReadingRepository.findById(id).orElseThrow();
    }

    public void delete(int id) {
        dailyReadingRepository.deleteById(id);
    }
}

