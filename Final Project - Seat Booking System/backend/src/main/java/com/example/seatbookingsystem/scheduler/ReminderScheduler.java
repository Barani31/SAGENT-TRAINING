package com.example.seatbookingsystem.scheduler;

import com.example.seatbookingsystem.entity.*;
import com.example.seatbookingsystem.repository.*;
import com.example.seatbookingsystem.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReminderScheduler {

    private final ShowSlotRepository      showSlotRepository;
    private final EventRepository         eventRepository;
    private final ReservationRepository   reservationRepository;
    private final ReservedSeatRepository  reservedSeatRepository;
    private final NotificationRepository  notificationRepository;
    private final ReviewRepository        reviewRepository;
    private final EmailService            emailService;

    // ── 1. Send 1-hour show reminders (every 5 mins) ─────────────────────────
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void sendOneHourReminders() {
        LocalDate today = LocalDate.now();
        LocalTime from  = LocalTime.now().plusMinutes(60);
        LocalTime to    = LocalTime.now().plusMinutes(75);

        List<ShowSlot> upcoming = showSlotRepository.findSlotsStartingBetween(today, from, to);

        for (ShowSlot slot : upcoming) {
            List<Reservation> reservations =
                    reservationRepository.findBySlot_SlotId(slot.getSlotId());

            for (Reservation reservation : reservations) {
                if (!"CONFIRMED".equals(reservation.getStatus())) continue;

                boolean alreadySent = notificationRepository
                        .findByUser_UserIdAndNotifyType(
                                reservation.getUser().getUserId(), "REMINDER")
                        .stream()
                        .anyMatch(n -> n.getReservation() != null &&
                                n.getReservation().getReservationId()
                                        .equals(reservation.getReservationId()));
                if (alreadySent) continue;

                User user = reservation.getUser();
                List<ReservedSeat> seats = reservedSeatRepository
                        .findByReservation_ReservationId(reservation.getReservationId());

                String seatNos = seats.stream()
                        .map(s -> s.getSeat().getRowLetter() + s.getSeat().getSeatNo())
                        .reduce("", (a, b) -> a.isEmpty() ? b : a + ", " + b);

                emailService.sendReminderEmail(user.getMail(), user.getName(),
                        slot.getEvent().getName(), slot.getShowDate().toString(),
                        slot.getStartTime().toString(), slot.getLocation().getLocName(),
                        reservation.getRefCode(), seatNos);

                notificationRepository.save(Notification.builder()
                        .user(user).reservation(reservation)
                        .message("⏰ Reminder: " + slot.getEvent().getName() +
                                " starts at " + slot.getStartTime() + ". Seats: " + seatNos)
                        .sentTime(LocalDateTime.now())
                        .notifyType("REMINDER").deliveryState("SENT").build());

                log.info("Reminder sent to {} for {}", user.getMail(), reservation.getRefCode());
            }
        }
    }

    // ── 2. Auto-complete ended slots + events (every 5 mins) ─────────────────
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void autoCompleteSlots() {
        LocalDate today = LocalDate.now();
        LocalTime now   = LocalTime.now();

        List<ShowSlot> endedSlots = showSlotRepository.findEndedSlots(today, now);

        for (ShowSlot slot : endedSlots) {
            slot.setSlotStatus("COMPLETED");
            showSlotRepository.save(slot);
            log.info("Slot {} for '{}' on {} marked COMPLETED",
                    slot.getSlotId(), slot.getEvent().getName(), slot.getShowDate());
        }

        if (!endedSlots.isEmpty()) {
            autoCompleteEvents();
        }
    }

    private void autoCompleteEvents() {
        List<Event> activeEvents = eventRepository.findByStatus("ACTIVE");
        for (Event event : activeEvents) {
            List<ShowSlot> slots = showSlotRepository.findByEvent_EventId(event.getEventId());
            if (slots.isEmpty()) continue;

            boolean allDone = slots.stream().allMatch(s ->
                    "COMPLETED".equals(s.getSlotStatus()) ||
                            "CANCELLED".equals(s.getSlotStatus()));

            if (allDone) {
                event.setStatus("COMPLETED");
                eventRepository.save(event);
                log.info("Event '{}' auto-marked COMPLETED", event.getName());
            }
        }
    }

    // ── 3. Send review reminders after show ends (every 10 mins) ─────────────
    @Scheduled(fixedRate = 600000)
    @Transactional
    public void sendReviewReminders() {
        LocalDate today = LocalDate.now();
        LocalTime now   = LocalTime.now();

        // Slots completed today within last 60 mins
        List<ShowSlot> recentlyCompleted = showSlotRepository.findByShowDate(today)
                .stream()
                .filter(s -> "COMPLETED".equals(s.getSlotStatus()))
                .filter(s -> s.getEndTime() != null &&
                        s.getEndTime().isAfter(now.minusMinutes(60)) &&
                        s.getEndTime().isBefore(now))
                .toList();

        // Past completed slots (catch-up for missed reminders)
        List<ShowSlot> pastCompleted = showSlotRepository.findBySlotStatus("COMPLETED")
                .stream()
                .filter(s -> s.getShowDate().isBefore(today))
                .toList();

        List<ShowSlot> allCompleted = new ArrayList<>(recentlyCompleted);
        allCompleted.addAll(pastCompleted);

        for (ShowSlot slot : allCompleted) {
            List<Reservation> reservations =
                    reservationRepository.findBySlot_SlotId(slot.getSlotId());

            for (Reservation reservation : reservations) {
                if (!"CONFIRMED".equals(reservation.getStatus())) continue;

                if (reviewRepository.existsByReservation_ReservationId(
                        reservation.getReservationId())) continue;

                boolean alreadySent = notificationRepository
                        .findByUser_UserIdAndNotifyType(
                                reservation.getUser().getUserId(), "REVIEW")
                        .stream()
                        .anyMatch(n -> n.getReservation() != null &&
                                n.getReservation().getReservationId()
                                        .equals(reservation.getReservationId()));
                if (alreadySent) continue;

                User user = reservation.getUser();

                notificationRepository.save(Notification.builder()
                        .user(user).reservation(reservation)
                        .message("⭐ How was " + slot.getEvent().getName() +
                                "? Share your experience and rate the show!")
                        .sentTime(LocalDateTime.now())
                        .notifyType("REVIEW").deliveryState("SENT").build());

                emailService.sendReviewReminderEmail(user.getMail(), user.getName(),
                        slot.getEvent().getName(), reservation.getReservationId());

                log.info("Review reminder sent to {} for '{}'",
                        user.getMail(), slot.getEvent().getName());
            }
        }
    }
}