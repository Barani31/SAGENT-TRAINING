package com.example.grocerydelivery.service;

import com.example.grocerydelivery.entity.ProductCategory;
import com.example.grocerydelivery.repository.ProductCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductCategoryService {

    @Autowired
    private ProductCategoryRepository productCategoryRepository;

    public ProductCategory save(ProductCategory category) {
        return productCategoryRepository.save(category);
    }

    public List<ProductCategory> getAll() {
        return productCategoryRepository.findAll();
    }

    public ProductCategory getById(int id) {
        return productCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
    }

    public void delete(int id) {
        productCategoryRepository.deleteById(id);
    }
}
