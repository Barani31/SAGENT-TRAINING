package com.example.seatbookingsystem.controller;

import com.example.seatbookingsystem.dto.ApiResponse;
import com.example.seatbookingsystem.entity.Location;
import com.example.seatbookingsystem.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @PostMapping
    public ResponseEntity<ApiResponse<Location>> createLocation(@RequestBody Location location) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Location created", locationService.createLocation(location)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Location>>> getAllLocations() {
        return ResponseEntity.ok(ApiResponse.success("Locations fetched", locationService.getAllLocations()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Location>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Location fetched", locationService.getLocationById(id)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Location>>> search(@RequestParam String name) {
        return ResponseEntity.ok(ApiResponse.success("Results", locationService.searchByName(name)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Location>> updateLocation(@PathVariable Long id,
                                                                @RequestBody Location req) {
        return ResponseEntity.ok(ApiResponse.success("Updated", locationService.updateLocation(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteLocation(@PathVariable Long id) {
        locationService.deleteLocation(id);
        return ResponseEntity.ok(ApiResponse.success("Deleted", "Deleted: " + id));
    }
}