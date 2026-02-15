package com.example.grocerydelivery.controller;

import com.example.grocerydelivery.entity.ProductCategory;
import com.example.grocerydelivery.service.ProductCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class ProductCategoryController {

    @Autowired
    private ProductCategoryService productCategoryService;

    @PostMapping
    public ProductCategory create(@RequestBody ProductCategory category) {
        return productCategoryService.save(category);
    }

    @GetMapping
    public List<ProductCategory> getAll() {
        return productCategoryService.getAll();
    }

    @GetMapping("/{id}")
    public ProductCategory getById(@PathVariable int id) {
        return productCategoryService.getById(id);
    }

    @PutMapping("/{id}")
    public ProductCategory update(@PathVariable int id,
                                  @RequestBody ProductCategory category) {
        category.setCategoryId(id);
        return productCategoryService.save(category);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        productCategoryService.delete(id);
    }
}

