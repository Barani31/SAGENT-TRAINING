package com.example.patientmonitoring.service;

import com.example.patientmonitoring.entity.Message;
import com.example.patientmonitoring.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    public Message save(Message message) {
        return messageRepository.save(message);
    }

    public List<Message> getAll() {
        return messageRepository.findAll();
    }

    public Message getById(int id) {
        return messageRepository.findById(id).orElseThrow();
    }

    public void delete(int id) {
        messageRepository.deleteById(id);
    }
}

