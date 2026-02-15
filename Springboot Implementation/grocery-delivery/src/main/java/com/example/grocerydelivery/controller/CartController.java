package com.example.grocerydelivery.controller;

import com.example.grocerydelivery.entity.Cart;
import com.example.grocerydelivery.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carts")
public class CartController {

    @Autowired
    private CartService cartService;

    @PostMapping
    public Cart create(@RequestBody Cart cart) {
        return cartService.save(cart);
    }

    @GetMapping
    public List<Cart> getAll() {
        return cartService.getAll();
    }

    @GetMapping("/{id}")
    public Cart getById(@PathVariable int id) {
        return cartService.getById(id);
    }

    @PutMapping("/{id}")
    public Cart update(@PathVariable int id, @RequestBody Cart cart) {
        cart.setCartId(id);
        return cartService.save(cart);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        cartService.delete(id);
    }
}
