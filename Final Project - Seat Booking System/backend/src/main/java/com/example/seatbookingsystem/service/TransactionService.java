package com.example.seatbookingsystem.service;

import com.example.seatbookingsystem.dto.PaymentRequest;
import com.example.seatbookingsystem.entity.*;
import com.example.seatbookingsystem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final ReservationRepository reservationRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    @Transactional
    public Transaction processPayment(PaymentRequest req) {
        Reservation reservation = reservationRepository.findById(req.getReservationId())
                .orElseThrow(() -> new RuntimeException("Reservation not found: " + req.getReservationId()));
        if (transactionRepository.findByReservation_ReservationId(req.getReservationId()).isPresent())
            throw new RuntimeException("Payment already done for this reservation");

        String txnRef = req.getTransactionRef() != null ? req.getTransactionRef()
                : "TXN-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();

        Transaction saved = transactionRepository.save(Transaction.builder()
                .reservation(reservation).paymentMethod(req.getPaymentMethod())
                .date(LocalDateTime.now()).amount(req.getAmount())
                .discountAmount(req.getDiscountAmount())
                .status("SUCCESS").transactionRef(txnRef).build());

        notificationRepository.save(Notification.builder()
                .user(reservation.getUser()).reservation(reservation)
                .message("Payment of Rs. " + req.getAmount() + " via " +
                        req.getPaymentMethod() + ". TxnRef: " + txnRef)
                .sentTime(LocalDateTime.now())
                .notifyType("PAYMENT").deliveryState("SENT").build());

        emailService.sendPaymentConfirmation(reservation.getUser().getMail(),
                reservation.getUser().getName(),
                reservation.getSlot().getEvent().getName(),
                txnRef, req.getAmount().doubleValue(), req.getPaymentMethod());

        return saved;
    }

    public List<Transaction> getAllTransactions()                { return transactionRepository.findAll(); }
    public List<Transaction> getTransactionsByUser(Long id)      { return transactionRepository.findByReservation_User_UserId(id); }
    public List<Transaction> getTransactionsByOrganiser(Long id) { return transactionRepository.findByOrganiserId(id); }
    public Transaction getTransactionById(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found: " + id));
    }

    public Transaction getTransactionByReservation(Long resId) {
        return transactionRepository.findByReservation_ReservationId(resId)
                .orElseThrow(() -> new RuntimeException("Transaction not found for reservation: " + resId));
    }

    public Transaction updateTransactionStatus(Long id, String status) {
        Transaction txn = getTransactionById(id);
        txn.setStatus(status);
        return transactionRepository.save(txn);
    }

    public void deleteTransaction(Long id) {
        if (!transactionRepository.existsById(id))
            throw new RuntimeException("Transaction not found: " + id);
        transactionRepository.deleteById(id);
    }
}