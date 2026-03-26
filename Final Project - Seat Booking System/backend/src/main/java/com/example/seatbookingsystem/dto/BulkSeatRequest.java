package com.example.seatbookingsystem.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class BulkSeatRequest {
    private String rowLetter;   // e.g. "A"
    private int seatCount;      // e.g. 10
    private String seatType;    // VIP / PREMIUM / REGULAR
    private BigDecimal basePrice;
}