package com.example.grocerydelivery.service;

import com.example.grocerydelivery.entity.Payment;
import com.example.grocerydelivery.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    public Payment save(Payment payment) {
        payment.setStatus("PAID");
        return paymentRepository.save(payment);
    }

    public List<Payment> getAll() {
        return paymentRepository.findAll();
    }

    public Payment getById(int id) {
        return paymentRepository.findById(id).orElseThrow();
    }

    public void delete(int id) {
        paymentRepository.deleteById(id);
    }
}

