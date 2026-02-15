package com.example.grocerydelivery.service;

import com.example.grocerydelivery.entity.DeliveryPerson;
import com.example.grocerydelivery.repository.DeliveryPersonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DeliveryPersonService {

    @Autowired
    private DeliveryPersonRepository deliveryPersonRepository;

    public DeliveryPerson save(DeliveryPerson person) {
        return deliveryPersonRepository.save(person);
    }

    public List<DeliveryPerson> getAll() {
        return deliveryPersonRepository.findAll();
    }

    public DeliveryPerson getById(int id) {
        return deliveryPersonRepository.findById(id).orElseThrow();
    }

    public void delete(int id) {
        deliveryPersonRepository.deleteById(id);
    }
}
