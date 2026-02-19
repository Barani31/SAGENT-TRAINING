# MediTrack — Patient Monitoring Frontend

A clean React frontend for the Patient Monitoring System Spring Boot backend.

---

## 📁 Project Structure

```
patient-monitoring-frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx       ← Navigation sidebar
│   │   └── CrudPage.jsx      ← Reusable table + modal CRUD component
│   ├── pages/
│   │   ├── Dashboard.jsx     ← Overview + workflow visualization
│   │   └── EntityPages.jsx   ← All 8 entity pages (patients, doctors, etc.)
│   ├── services/
│   │   └── api.js            ← Axios API calls to Spring Boot backend
│   ├── styles/
│   │   └── global.css        ← All styling (white + light blue theme)
│   ├── App.jsx               ← Router + layout
│   └── index.js              ← Entry point
├── package.json
└── README.md
```

---

## 🚀 Step-by-Step Setup

### STEP 1 — Start your Spring Boot backend in IntelliJ

1. Open your project in **IntelliJ IDEA**
2. Add this to `application.properties` to allow frontend access:
   ```properties
   server.port=8080
   spring.web.cors.allowed-origins=http://localhost:3000
   ```
3. Also add a CORS config class (see below)
4. Run the Spring Boot app — it should start on `http://localhost:8080`

### STEP 2 — Add CORS Configuration to Spring Boot

Create this file in your Spring Boot project:

```java
// src/main/java/com/example/patientmonitoring/config/CorsConfig.java
package com.example.patientmonitoring.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
```

### STEP 3 — Open frontend in VS Code

1. Copy this `patient-monitoring-frontend` folder to your machine
2. Open it in **VS Code**
3. Open the **Terminal** in VS Code (`Ctrl + `` ` ``)

### STEP 4 — Install dependencies

```bash
npm install
```

### STEP 5 — Start the frontend

```bash
npm start
```

The app will open at **http://localhost:3000**

---

## 🔗 API Endpoints Connected

| Page           | Backend Endpoint          |
|----------------|--------------------------|
| Patients       | `/api/patients`          |
| Doctors        | `/api/doctors`           |
| Appointments   | `/api/appointments`      |
| Consultations  | `/api/consultations`     |
| Daily Readings | `/api/readings`          |
| Health Records | `/api/health-data`       |
| Messages       | `/api/messages`          |
| Reports        | `/api/reports`           |

---

## 🎨 UI Theme

- **Colors**: White + Light Blue only
- **Font**: Playfair Display (headings) + Nunito (body)
- Every page has: View All (table) → Add New (modal) → Edit → Delete

---

## 💡 App Flow (based on Use Case)

```
Patient Registration → Health Data Entry → Daily Readings →
Doctor Reviews → Consultation → Appointment → Message → Report
```

The Dashboard shows all 8 steps visually.
