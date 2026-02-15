package com.example.patientmonitoring.controller;

import com.example.patientmonitoring.entity.Message;
import com.example.patientmonitoring.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @PostMapping
    public Message create(@RequestBody Message message) {
        return messageService.save(message);
    }

    @GetMapping
    public List<Message> getAll() {
        return messageService.getAll();
    }

    @GetMapping("/{id}")
    public Message getById(@PathVariable int id) {
        return messageService.getById(id);
    }

    @PutMapping("/{id}")
    public Message update(@PathVariable int id, @RequestBody Message message) {
        message.setMessageId(id);
        return messageService.save(message);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        messageService.delete(id);
    }
}

