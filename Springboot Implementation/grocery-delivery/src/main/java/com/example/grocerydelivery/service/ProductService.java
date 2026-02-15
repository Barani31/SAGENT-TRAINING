package com.example.grocerydelivery.service;

import com.example.grocerydelivery.entity.Product;
import com.example.grocerydelivery.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public Product save(Product product) {
        return productRepository.save(product);
    }

    public List<Product> getAll() {
        return productRepository.findAll();
    }

    public Product getById(int id) {
        return productRepository.findById(id).orElseThrow();
    }

    public void delete(int id) {
        productRepository.deleteById(id);
    }
}
