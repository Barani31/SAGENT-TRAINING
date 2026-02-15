package com.example.librarymanagement.service;

import com.example.librarymanagement.entity.Borrow;
import com.example.librarymanagement.entity.Fine;
import com.example.librarymanagement.repository.FineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
public class FineService {

    @Autowired
    private FineRepository fineRepository;

    public Fine calculateFine(Borrow borrow) {
        long daysLate = ChronoUnit.DAYS.between(
                borrow.getDueDate(),
                borrow.getReturnDate()
        );

        if (daysLate > 0) {
            Fine fine = new Fine();
            fine.setBorrow(borrow);
            fine.setFineAmount(daysLate * 10);
            fine.setFineDate(LocalDate.now());
            fine.setStatus("UNPAID");
            return fineRepository.save(fine);
        }
        return null;
    }
}

