package com.example.seatbookingsystem.dto;

import lombok.Data;

@Data
public class EventRequest {
    private Long organiserId;
    private String name;
    private String type;
    private String genre;
    private String summary;
    private String duration;
    private String language;
    private String categoryName;
    private String status;
}