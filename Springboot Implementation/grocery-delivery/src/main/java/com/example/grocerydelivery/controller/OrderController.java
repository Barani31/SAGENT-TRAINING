package com.example.grocerydelivery.controller;

import com.example.grocerydelivery.entity.Order;
import com.example.grocerydelivery.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public Order create(@RequestBody Order order) {
        return orderService.save(order);
    }

    @GetMapping
    public List<Order> getAll() {
        return orderService.getAll();
    }

    @GetMapping("/{id}")
    public Order getById(@PathVariable int id) {
        return orderService.getById(id);
    }

    @PutMapping("/{id}")
    public Order update(@PathVariable int id, @RequestBody Order order) {
        order.setOrderId(id);
        return orderService.save(order);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        orderService.delete(id);
    }
}
