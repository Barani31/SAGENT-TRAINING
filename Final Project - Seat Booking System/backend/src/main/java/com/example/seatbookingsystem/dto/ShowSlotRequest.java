package com.example.seatbookingsystem.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ShowSlotRequest {
    private Long eventId;
    private Long locationId;
    private LocalDate showDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer seatsLeft;
    private String slotStatus;
}