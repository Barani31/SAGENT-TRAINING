package com.example.seatbookingsystem.controller;

import com.example.seatbookingsystem.dto.*;
import com.example.seatbookingsystem.entity.Event;
import com.example.seatbookingsystem.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @PostMapping
    public ResponseEntity<ApiResponse<Event>> createEvent(@RequestBody EventRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Event created", eventService.createEvent(req)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Event>>> getAllEvents(
            @RequestParam(required = false) String sortBy) {
        List<Event> events = sortBy != null
                ? eventService.getAllEventsSorted(sortBy)
                : eventService.getAllEvents();
        return ResponseEntity.ok(ApiResponse.success("Events fetched", events));
    }

    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<List<Event>>> filterEvents(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String name) {
        return ResponseEntity.ok(ApiResponse.success("Filtered",
                eventService.filterEvents(type, genre, language, status, name)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Event>> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Event fetched", eventService.getEventById(id)));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse<List<Event>>> getByType(@PathVariable String type) {
        return ResponseEntity.ok(ApiResponse.success("Events fetched", eventService.getEventsByType(type)));
    }

    @GetMapping("/organiser/{organiserId}")
    public ResponseEntity<ApiResponse<List<Event>>> getByOrganiser(@PathVariable Long organiserId) {
        return ResponseEntity.ok(ApiResponse.success("Events fetched",
                eventService.getEventsByOrganiser(organiserId)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Event>>> searchEvents(@RequestParam String name) {
        return ResponseEntity.ok(ApiResponse.success("Results", eventService.searchEvents(name)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Event>> updateEvent(@PathVariable Long id,
                                                          @RequestBody EventRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Event updated", eventService.updateEvent(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.success("Event deleted", "Deleted: " + id));
    }
}