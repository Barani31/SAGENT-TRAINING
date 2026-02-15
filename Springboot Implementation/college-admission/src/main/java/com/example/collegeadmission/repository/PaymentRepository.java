package com.example.collegeadmission.repository;

import com.example.collegeadmission.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {

}
