# Patient Monitoring System - Frontend Setup

## Folder Structure

```
patient-monitoring-frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Sidebar.js       ← Navigation sidebar
│   │   ├── Layout.js        ← Page wrapper
│   │   └── CrudTable.js     ← Reusable table with Add/Edit/Delete
│   ├── pages/
│   │   ├── Dashboard.js     ← Overview + quick links
│   │   ├── Patients.js
│   │   ├── Doctors.js
│   │   ├── Appointments.js
│   │   ├── HealthData.js
│   │   ├── DailyReadings.js
│   │   ├── Consultations.js
│   │   ├── Messages.js
│   │   └── Reports.js
│   ├── services/
│   │   └── api.js           ← Axios calls to Spring Boot
│   ├── App.js
│   ├── index.js
│   └── index.css
└── package.json
```

---

## Step 1 — Enable CORS in Spring Boot (IntelliJ)

Add this class to your Spring Boot project:

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
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("*");
    }
}
```

Start your Spring Boot app (runs on port 8080).

---

## Step 2 — Run the Frontend (VS Code)

1. Open this `patient-monitoring-frontend` folder in VS Code
2. Open the terminal and run:

```bash
npm install
npm start
```

3. Browser opens at **http://localhost:3000**

---

## Step 3 — Usage Flow

| Page | What you can do |
|------|----------------|
| **Dashboard** | See counts of patients, doctors, appointments, reports. View system flow. |
| **Patients** | Add/edit/delete patient registrations |
| **Doctors** | Manage doctor profiles |
| **Appointments** | Schedule appointments between patient and doctor |
| **Health Data** | Enter past medical records per patient |
| **Daily Readings** | Log heart rate, BP, oxygen, temperature daily |
| **Consultations** | Record doctor consultations and prescriptions |
| **Messages** | Send feedback/advice messages between doctor and patient |
| **Reports** | Store and view medical reports |

---

## Notes

- Frontend talks to `http://localhost:8080/api/...`
- Make sure Spring Boot is running **before** using the app
- Field names in forms must match your entity fields exactly
