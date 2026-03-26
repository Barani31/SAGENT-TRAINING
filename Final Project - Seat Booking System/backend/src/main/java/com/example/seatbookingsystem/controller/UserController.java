package com.example.seatbookingsystem.controller;

import com.example.seatbookingsystem.dto.*;
import com.example.seatbookingsystem.entity.User;
import com.example.seatbookingsystem.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registered successfully", userService.register(req)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<User>> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Login successful", userService.login(req)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users fetched", userService.getAllUsers()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("User fetched", userService.getUserById(id)));
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<ApiResponse<List<User>>> getUsersByRole(@PathVariable String role) {
        return ResponseEntity.ok(ApiResponse.success("Users fetched", userService.getUsersByRole(role)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<User>>> searchUsers(@RequestParam String name) {
        return ResponseEntity.ok(ApiResponse.success("Results", userService.searchUsers(name)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(@PathVariable Long id,
                                                        @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(ApiResponse.success("User updated", userService.updateUser(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted", "Deleted: " + id));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestParam String mail) {
        userService.sendPasswordResetOtp(mail);
        return ResponseEntity.ok(ApiResponse.success("OTP sent to your email", "Sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @RequestParam String mail,
            @RequestParam String otp,
            @RequestParam String newPassword) {
        userService.resetPasswordWithOtp(mail, otp, newPassword);
        return ResponseEntity.ok(ApiResponse.success("Password reset successful", "Done"));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<String>> handleRuntimeException(RuntimeException ex) {
        String msg = ex.getMessage() != null ? ex.getMessage() : "An error occurred";

        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        if (msg.toLowerCase().contains("already registered")) {
            status = HttpStatus.CONFLICT; // 409
        } else if (msg.toLowerCase().contains("no account found") || msg.toLowerCase().contains("not found")) {
            status = HttpStatus.NOT_FOUND; // 404
        } else if (msg.toLowerCase().contains("invalid password")) {
            status = HttpStatus.UNAUTHORIZED; // 401
        }

        return ResponseEntity.status(status)
                .body(ApiResponse.error(msg)); // you may need to add error() to ApiResponse
    }
}