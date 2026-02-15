package com.example.grocerydelivery.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int notifyId;

    private String message;
    private LocalDateTime sentTime;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;
}
