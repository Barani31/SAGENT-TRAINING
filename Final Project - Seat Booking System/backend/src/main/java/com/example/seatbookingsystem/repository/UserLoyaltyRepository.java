package com.example.seatbookingsystem.repository;

import com.example.seatbookingsystem.entity.UserLoyalty;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserLoyaltyRepository extends JpaRepository<UserLoyalty, Long> {

    boolean existsByUser_UserIdAndGrantedMonthAndUsed(Long userId, int month, boolean used);

    Optional<UserLoyalty> findByUser_UserIdAndUsed(Long userId, boolean used);
}