package com.example.seatbookingsystem.service;

import com.example.seatbookingsystem.entity.Location;
import com.example.seatbookingsystem.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;

    public Location createLocation(Location l)   { return locationRepository.save(l); }
    public List<Location> getAllLocations()       { return locationRepository.findAll(); }
    public List<Location> searchByName(String n) { return locationRepository.findByLocNameContainingIgnoreCase(n); }

    public Location getLocationById(Long id) {
        return locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found: " + id));
    }

    public Location updateLocation(Long id, Location req) {
        Location loc = getLocationById(id);
        if (req.getLocName() != null)    loc.setLocName(req.getLocName());
        if (req.getAddress() != null)    loc.setAddress(req.getAddress());
        if (req.getTotalSeats() != null) loc.setTotalSeats(req.getTotalSeats());
        if (req.getFacilities() != null) loc.setFacilities(req.getFacilities());
        return locationRepository.save(loc);
    }

    public void deleteLocation(Long id) {
        if (!locationRepository.existsById(id)) throw new RuntimeException("Location not found: " + id);
        locationRepository.deleteById(id);
    }
}