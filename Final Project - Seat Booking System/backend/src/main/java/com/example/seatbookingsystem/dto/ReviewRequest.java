package com.example.seatbookingsystem.dto;

import lombok.Data;

@Data
public class ReviewRequest {
    private Long userId;
    private Long eventId;
    private Long reservationId;
    private int rating;        // 1-5
    private String comment;
}