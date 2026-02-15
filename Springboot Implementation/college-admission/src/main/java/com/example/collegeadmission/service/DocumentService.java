package com.example.collegeadmission.service;

import com.example.collegeadmission.entity.Document;
import com.example.collegeadmission.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    public Document save(Document document) {
        document.setUploadedDate(LocalDate.now());
        return documentRepository.save(document);
    }

    public List<Document> getAll() {
        return documentRepository.findAll();
    }

    public Document getById(int id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
    }

    public void delete(int id) {
        documentRepository.deleteById(id);
    }
}

