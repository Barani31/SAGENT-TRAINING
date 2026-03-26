package com.example.seatbookingsystem.service;

import com.example.seatbookingsystem.entity.SeatSlot;
import com.example.seatbookingsystem.repository.SeatSlotRepository;
import com.example.seatbookingsystem.repository.ShowSlotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class SeatHoldService {

    private final SeatSlotRepository seatSlotRepository;
    private final ShowSlotRepository showSlotRepository;

    // ── Hold duration: 2 minutes ──────────────────────────────────────────────
    private static final int HOLD_MINUTES = 2;

    // ── Lock seats for a user (called when they proceed to payment) ───────────
    @Transactional
    public void lockSeats(Long slotId, List<Long> seatSlotIds, Long userId) {
        LocalDateTime now = LocalDateTime.now();
        for (Long seatSlotId : seatSlotIds) {
            seatSlotRepository.findById(seatSlotId).ifPresent(ss -> {
                if ("AVAILABLE".equals(ss.getAvailability())) {
                    ss.setAvailability("LOCKED");
                    ss.setLockedAt(now);
                    ss.setLockedByUserId(userId);
                    seatSlotRepository.save(ss);
                }
            });
        }
        log.info("Locked {} seats for user {} on slot {}", seatSlotIds.size(), userId, slotId);
    }

    // ── Release locks for a user (called when they go back or abandon) ────────
    @Transactional
    public void releaseLocksForUser(Long slotId, Long userId) {
        List<SeatSlot> locked = seatSlotRepository.findBySlot_SlotIdAndLockedByUserId(slotId, userId);
        for (SeatSlot ss : locked) {
            if ("LOCKED".equals(ss.getAvailability())) {
                ss.setAvailability("AVAILABLE");
                ss.setLockedAt(null);
                ss.setLockedByUserId(null);
                seatSlotRepository.save(ss);
            }
        }
        // Restore slot to AVAILABLE if it was HOUSEFULL
        showSlotRepository.findById(slotId).ifPresent(slot -> {
            if ("HOUSEFULL".equals(slot.getSlotStatus())) {
                slot.setSlotStatus("AVAILABLE");
                showSlotRepository.save(slot);
            }
        });
        log.info("Released locks for user {} on slot {}", userId, slotId);
    }

    // ── Get remaining hold time in seconds ────────────────────────────────────
    public int getRemainingHoldSeconds(Long slotId, Long userId) {
        List<SeatSlot> locked = seatSlotRepository.findBySlot_SlotIdAndLockedByUserId(slotId, userId);
        if (locked.isEmpty() || locked.get(0).getLockedAt() == null) return 0;
        LocalDateTime expiry = locked.get(0).getLockedAt().plusMinutes(HOLD_MINUTES);
        long secondsLeft = java.time.Duration.between(LocalDateTime.now(), expiry).getSeconds();
        return (int) Math.max(0, secondsLeft);
    }

    // ── Scheduler: auto-release expired locks every 30 seconds ───────────────
    // Runs every 2 seconds to match frontend polling interval
    @Scheduled(fixedDelay = 2000)
    @Transactional
    public void releaseExpiredLocks() {
        LocalDateTime expiry = LocalDateTime.now().minusMinutes(HOLD_MINUTES);
        List<SeatSlot> expired = seatSlotRepository.findExpiredLocks(expiry);
        if (expired.isEmpty()) return;

        Map<Long, Integer> slotReleaseCounts = new HashMap<>();
        for (SeatSlot ss : expired) {
            ss.setAvailability("AVAILABLE");
            ss.setLockedAt(null);
            ss.setLockedByUserId(null);
            seatSlotRepository.save(ss);
            slotReleaseCounts.merge(ss.getSlot().getSlotId(), 1, Integer::sum);
        }

        for (Long slotId : slotReleaseCounts.keySet()) {
            showSlotRepository.findById(slotId).ifPresent(slot -> {
                if ("HOUSEFULL".equals(slot.getSlotStatus())) {
                    slot.setSlotStatus("AVAILABLE");
                    showSlotRepository.save(slot);
                }
            });
        }
        log.info("Auto-released {} expired seat locks (2-min hold)", expired.size());
    }
}