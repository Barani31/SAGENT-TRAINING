package com.example.grocerydelivery.controller;

import com.example.grocerydelivery.entity.DeliveryPerson;
import com.example.grocerydelivery.service.DeliveryPersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery-persons")
public class DeliveryPersonController {

    @Autowired
    private DeliveryPersonService deliveryPersonService;

    @PostMapping
    public DeliveryPerson create(@RequestBody DeliveryPerson person) {
        return deliveryPersonService.save(person);
    }

    @GetMapping
    public List<DeliveryPerson> getAll() {
        return deliveryPersonService.getAll();
    }

    @GetMapping("/{id}")
    public DeliveryPerson getById(@PathVariable int id) {
        return deliveryPersonService.getById(id);
    }

    @PutMapping("/{id}")
    public DeliveryPerson update(@PathVariable int id,
                                 @RequestBody DeliveryPerson person) {
        person.setPersonId(id);
        return deliveryPersonService.save(person);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        deliveryPersonService.delete(id);
    }
}
