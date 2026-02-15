package com.example.grocerydelivery.controller;

import com.example.grocerydelivery.entity.Customer;
import com.example.grocerydelivery.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @PostMapping
    public Customer create(@RequestBody Customer customer) {
        return customerService.save(customer);
    }

    @GetMapping
    public List<Customer> getAll() {
        return customerService.getAll();
    }

    @GetMapping("/{id}")
    public Customer getById(@PathVariable int id) {
        return customerService.getById(id);
    }

    @PutMapping("/{id}")
    public Customer update(@PathVariable int id, @RequestBody Customer customer) {
        customer.setCustomerId(id);
        return customerService.save(customer);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        customerService.delete(id);
    }
}

