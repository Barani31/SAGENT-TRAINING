package com.example.seatbookingsystem.repository;

import com.example.seatbookingsystem.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByReservation_ReservationId(Long reservationId);
    List<Transaction> findByStatus(String status);
    List<Transaction> findByReservation_User_UserId(Long userId);
    Optional<Transaction> findByTransactionRef(String ref);

    @Query("SELECT t FROM Transaction t WHERE t.reservation.slot.event.organiser.userId = :organiserId")
    List<Transaction> findByOrganiserId(@Param("organiserId") Long organiserId);
}