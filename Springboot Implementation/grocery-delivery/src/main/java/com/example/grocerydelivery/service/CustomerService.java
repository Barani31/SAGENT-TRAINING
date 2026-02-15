package com.example.grocerydelivery.service;

import com.example.grocerydelivery.entity.Customer;
import com.example.grocerydelivery.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    public Customer save(Customer customer) {
        return customerRepository.save(customer);
    }

    public List<Customer> getAll() {
        return customerRepository.findAll();
    }

    public Customer getById(int id) {
        return customerRepository.findById(id).orElseThrow();
    }

    public void delete(int id) {
        customerRepository.deleteById(id);
    }
}
