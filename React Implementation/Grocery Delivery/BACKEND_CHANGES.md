# Backend Changes Required for Grocery Delivery Frontend

## 1. Add CORS Configuration (REQUIRED)
Create this file in your Spring Boot project:
File: src/main/java/com/example/grocerydelivery/config/CorsConfig.java

```java
package com.example.grocerydelivery.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000")
            .allowedMethods("GET","POST","PUT","DELETE","OPTIONS")
            .allowedHeaders("*");
    }
}
```

---

## 2. Add Auth Login Endpoint (REQUIRED)
Create this file:
File: src/main/java/com/example/grocerydelivery/controller/AuthController.java

```java
package com.example.grocerydelivery.controller;

import com.example.grocerydelivery.entity.Customer;
import com.example.grocerydelivery.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private CustomerRepository customerRepo;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String mail = body.get("mail");
        String password = body.get("password");

        Optional<Customer> customer = customerRepo.findByMailAndPassword(mail, password);
        if (customer.isEmpty()) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }

        Map<String, Object> res = new HashMap<>();
        res.put("id", customer.get().getCustomerId());
        res.put("name", customer.get().getName());
        res.put("mail", customer.get().getMail());
        res.put("address", customer.get().getAddress());
        res.put("phnNo", customer.get().getPhnNo());
        return ResponseEntity.ok(res);
    }
}
```

---

## 3. Update CustomerRepository (REQUIRED)
Replace CustomerRepository.java with:

```java
package com.example.grocerydelivery.repository;

import com.example.grocerydelivery.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    Optional<Customer> findByMailAndPassword(String mail, String password);
}
```

---

## 4. Add @CrossOrigin to All Controllers (REQUIRED)
Add this annotation to the top of every controller class:
@CrossOrigin(origins = "http://localhost:3000")

Controllers to update:
- CartController.java
- CustomerController.java
- DeliveryPersonController.java
- NotificationController.java
- OrderController.java
- PaymentController.java
- ProductCategoryController.java
- ProductController.java

---

## 5. Update OrderService to NOT override status on update (IMPORTANT)
In OrderService.java, the current save() always sets status to "PLACED".
This means you cannot update order status (Confirmed, Out for Delivery etc).

Replace OrderService.java save() method:

```java
@Autowired
private OrderRepository orderRepository;

public Order save(Order order) {
    // Only set defaults for NEW orders (no ID yet)
    if (order.getOrderId() == 0) {
        order.setOrderDate(LocalDate.now());
        if (order.getStatus() == null) order.setStatus("PLACED");
    }
    return orderRepository.save(order);
}
```

---

## 6. Update PaymentService to NOT override status (IMPORTANT)
Same issue — PaymentService always sets status to "PAID".
For now this is fine, but if you add failed payments later, fix:

```java
public Payment save(Payment payment) {
    if (payment.getStatus() == null) {
        payment.setStatus("PAID");
    }
    return paymentRepository.save(payment);
}
```

---

## 7. Add OrderRepository filter methods (OPTIONAL but useful)

```java
package com.example.grocerydelivery.repository;

import com.example.grocerydelivery.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByCustomer_CustomerId(int customerId);
}
```

---

## Summary of Steps:
1. Create CorsConfig.java
2. Create AuthController.java
3. Update CustomerRepository.java
4. Add @CrossOrigin to all controllers
5. Fix OrderService.java save() method
6. Restart Spring Boot
7. Run frontend with: npm install && npm start
