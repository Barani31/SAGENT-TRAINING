package com.example.seatbookingsystem.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentRequest {
    private Long reservationId;
    private String paymentMethod;
    private BigDecimal amount;
    private BigDecimal discountAmount;
    private String transactionRef;
}