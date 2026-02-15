package com.example.grocerydelivery.service;

import com.example.grocerydelivery.entity.Cart;
import com.example.grocerydelivery.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    public Cart save(Cart cart) {
        return cartRepository.save(cart);
    }

    public List<Cart> getAll() {
        return cartRepository.findAll();
    }

    public Cart getById(int id) {
        return cartRepository.findById(id).orElseThrow();
    }

    public void delete(int id) {
        cartRepository.deleteById(id);
    }
}
