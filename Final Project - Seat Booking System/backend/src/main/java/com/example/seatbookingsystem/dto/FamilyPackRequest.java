package com.example.seatbookingsystem.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class FamilyPackRequest {
    private String     rowLetter;   // e.g. "D"
    private int        seatCount;   // typically 4
    private String     seatType;    // REGULAR, PREMIUM, VIP
    private BigDecimal familyPrice; // bundle total e.g. 700.00
}