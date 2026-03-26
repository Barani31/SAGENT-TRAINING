package com.example.seatbookingsystem.service;

import com.example.seatbookingsystem.dto.LoginRequest;
import com.example.seatbookingsystem.dto.RegisterRequest;
import com.example.seatbookingsystem.entity.User;
import com.example.seatbookingsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import com.example.seatbookingsystem.service.EmailService;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final Map<String, String> otpStore          = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> otpExpiry  = new ConcurrentHashMap<>();

    public User register(RegisterRequest req) {
        if (userRepository.existsByMail(req.getMail())) {
            throw new RuntimeException("Email already registered: " + req.getMail());
        }
        User user = User.builder()
                .name(req.getName())
                .mail(req.getMail())
                .contactNo(req.getContactNo())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(req.getRole() != null ? req.getRole().toUpperCase() : "USER")
                .build();
        return userRepository.save(user);
    }

    public User login(LoginRequest req) {
        User user = userRepository.findByMail(req.getMail())
                .orElseThrow(() -> new RuntimeException("No account found with email: " + req.getMail()));
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        return user;
    }

    public List<User> getAllUsers()            { return userRepository.findAll(); }
    public List<User> getUsersByRole(String r) { return userRepository.findByRole(r.toUpperCase()); }
    public List<User> searchUsers(String name) { return userRepository.findByNameContainingIgnoreCase(name); }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    public User updateUser(Long id, RegisterRequest req) {
        User user = getUserById(id);
        if (req.getMail() != null && !user.getMail().equals(req.getMail())
                && userRepository.existsByMail(req.getMail())) {
            throw new RuntimeException("Email already registered: " + req.getMail());
        }
        if (req.getName() != null)      user.setName(req.getName());
        if (req.getMail() != null)      user.setMail(req.getMail());
        if (req.getContactNo() != null) user.setContactNo(req.getContactNo());
        if (req.getRole() != null)      user.setRole(req.getRole().toUpperCase());
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(req.getPassword()));
        }
        return userRepository.save(user);
    }

    public void sendPasswordResetOtp(String mail) {
        User user = userRepository.findByMail(mail)
                .orElseThrow(() -> new RuntimeException("No account found with email: " + mail));
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStore.put(mail, otp);
        otpExpiry.put(mail, LocalDateTime.now().plusMinutes(10));
        emailService.sendOtpEmail(mail, user.getName(), otp);
    }

    public void resetPasswordWithOtp(String mail, String otp, String newPassword) {
        if (!otpStore.containsKey(mail))
            throw new RuntimeException("OTP not found. Please request a new one.");
        if (LocalDateTime.now().isAfter(otpExpiry.get(mail))) {
            otpStore.remove(mail); otpExpiry.remove(mail);
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }
        if (!otpStore.get(mail).equals(otp))
            throw new RuntimeException("Invalid OTP. Please try again.");
        User user = userRepository.findByMail(mail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        otpStore.remove(mail);
        otpExpiry.remove(mail);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) throw new RuntimeException("User not found: " + id);
        userRepository.deleteById(id);
    }
}