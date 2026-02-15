package com.example.librarymanagement.service;

import com.example.librarymanagement.entity.Borrow;
import com.example.librarymanagement.entity.Fine;
import com.example.librarymanagement.repository.BorrowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;


import java.util.List;

@Service
public class BorrowService {

    @Autowired
    private BorrowRepository borrowRepository;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private FineService fineService;

    @Autowired
    private NotificationService notificationService;


    public Borrow borrowBook(Borrow borrow) {
        return borrowRepository.save(borrow);
    }

    public List<Borrow> getAllBorrows() {
        return borrowRepository.findAll();
    }

    public Borrow returnBook(Borrow borrow) {

        borrow.setReturnDate(LocalDate.now());
        borrow.setStatus("RETURNED");

        // Increase inventory
        inventoryService.increaseAvailableCopies(borrow.getBook());


        // Calculate fine
        Fine fine = fineService.calculateFine(borrow);

        // Send notification
        if (fine != null) {
            notificationService.sendNotification(
                    borrow.getMember(),
                    "Book returned late. Fine: ₹" + fine.getFineAmount()
            );
        } else {
            notificationService.sendNotification(
                    borrow.getMember(),
                    "Book returned successfully. No fine."
            );
        }

        return borrowRepository.save(borrow);
    }
    public Borrow getBorrowById(int id) {
        return borrowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Borrow record not found"));
    }



}
