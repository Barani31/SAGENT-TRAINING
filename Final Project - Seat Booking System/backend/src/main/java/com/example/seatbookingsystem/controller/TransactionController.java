package com.example.seatbookingsystem.controller;

import com.example.seatbookingsystem.dto.*;
import com.example.seatbookingsystem.entity.Transaction;
import com.example.seatbookingsystem.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/pay")
    public ResponseEntity<ApiResponse<Transaction>> processPayment(@RequestBody PaymentRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment successful", transactionService.processPayment(req)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Transaction>>> getAllTransactions() {
        return ResponseEntity.ok(ApiResponse.success("Fetched", transactionService.getAllTransactions()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Transaction>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Fetched", transactionService.getTransactionById(id)));
    }

    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<ApiResponse<Transaction>> getByReservation(@PathVariable Long reservationId) {
        return ResponseEntity.ok(ApiResponse.success("Fetched",
                transactionService.getTransactionByReservation(reservationId)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Transaction>>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Fetched",
                transactionService.getTransactionsByUser(userId)));
    }

    @GetMapping("/organiser/{organiserId}")
    public ResponseEntity<ApiResponse<List<Transaction>>> getByOrganiser(@PathVariable Long organiserId) {
        return ResponseEntity.ok(ApiResponse.success("Payment history fetched",
                transactionService.getTransactionsByOrganiser(organiserId)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Transaction>> updateStatus(@PathVariable Long id,
                                                                 @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                transactionService.updateTransactionStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.ok(ApiResponse.success("Deleted", "Deleted: " + id));
    }
}