package com.example.collegeadmission.controller;

import com.example.collegeadmission.entity.Document;
import com.example.collegeadmission.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @PostMapping
    public Document upload(@RequestBody Document document) {
        return documentService.save(document);
    }

    @GetMapping
    public List<Document> getAll() {
        return documentService.getAll();
    }

    @GetMapping("/{id}")
    public Document getById(@PathVariable int id) {
        return documentService.getById(id);
    }

    @PutMapping("/{id}")
    public Document update(@PathVariable int id, @RequestBody Document document) {
        document.setDocumentId(id);
        return documentService.save(document);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        documentService.delete(id);
    }
}
