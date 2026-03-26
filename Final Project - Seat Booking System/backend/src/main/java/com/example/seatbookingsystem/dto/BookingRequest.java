package com.example.seatbookingsystem.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class BookingRequest {
    private Long userId;
    private Long slotId;
    private List<Long> seatIds;
    private BigDecimal discount;
    private String paymentMethod;
    private String discountCode;   // promo code e.g. "SHOW10"
}