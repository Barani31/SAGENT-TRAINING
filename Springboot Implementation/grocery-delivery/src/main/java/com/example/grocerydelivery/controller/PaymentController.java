package com.example.grocerydelivery.controller;

import com.example.grocerydelivery.entity.Payment;
import com.example.grocerydelivery.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping
    public Payment create(@RequestBody Payment payment) {
        return paymentService.save(payment);
    }

    @GetMapping
    public List<Payment> getAll() {
        return paymentService.getAll();
    }

    @GetMapping("/{id}")
    public Payment getById(@PathVariable int id) {
        return paymentService.getById(id);
    }

    @PutMapping("/{id}")
    public Payment update(@PathVariable int id, @RequestBody Payment payment) {
        payment.setPaymentId(id);
        return paymentService.save(payment);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        paymentService.delete(id);
    }
}
