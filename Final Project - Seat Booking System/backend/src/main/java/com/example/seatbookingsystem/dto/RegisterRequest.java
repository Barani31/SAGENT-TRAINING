package com.example.seatbookingsystem.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank private String name;
    @Email @NotBlank private String mail;
    private String contactNo;
    @NotBlank private String password;
    private String role; // USER or ADMIN
}