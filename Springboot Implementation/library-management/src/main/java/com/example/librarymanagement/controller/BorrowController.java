package com.example.librarymanagement.controller;

import com.example.librarymanagement.entity.Borrow;
import com.example.librarymanagement.service.BorrowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrow")
public class BorrowController {

    @Autowired
    private BorrowService borrowService;

    @PostMapping
    public Borrow borrowBook(@RequestBody Borrow borrow) {
        return borrowService.borrowBook(borrow);
    }

    @GetMapping
    public List<Borrow> getAllBorrows() {
        return borrowService.getAllBorrows();
    }

    @PutMapping("/return/{id}")
    public Borrow returnBook(@PathVariable int id) {
        Borrow borrow = borrowService.getBorrowById(id);
        return borrowService.returnBook(borrow);
    }

}
