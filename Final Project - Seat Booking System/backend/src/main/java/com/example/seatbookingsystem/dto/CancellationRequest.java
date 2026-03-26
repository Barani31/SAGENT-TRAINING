package com.example.seatbookingsystem.dto;

import lombok.Data;

@Data
public class CancellationRequest {
    private Long reservationId;
    private Long userId;
    private String reason;
}