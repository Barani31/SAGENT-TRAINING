# ShowSpot - Seat Booking Frontend

A full-featured React frontend for the Spring Boot Seat Booking System.

## Tech Stack
- React 18 + React Router v6
- Axios (API calls)
- React Hot Toast (notifications)
- Custom CSS design system (no UI library)

## Setup

### Prerequisites
- Node.js 16+
- Spring Boot backend running on `http://localhost:8080`

### Install & Run

```bash
cd seat-booking-frontend
npm install
npm start
```

App runs at: http://localhost:3000

---

## Features

### User Side
- **Browse Events** — Filter by type (Movie/Concert/Event), genre, language, status; sort by name/type/genre; live search
- **Event Detail** — View event info, pick date, see available time slots
- **Seat Selection** — BookMyShow-style interactive seat grid; VIP/Premium/Regular color-coded
- **Payment** — Choose UPI/Card/Netbanking/Wallet; auto-generates booking + transaction
- **My Bookings** — View all bookings with status tabs; cancel with 80% refund
- **Notifications** — View all email notifications (Booking/Payment/Cancellation/Reminder)

### Admin Side
- **Dashboard** — Stats: events, bookings, revenue, cancellations; quick actions
- **Events** — Full CRUD; create movies/concerts/events with all metadata
- **Show Slots** — Schedule shows with venue/date/time; auto-creates seat slots from venue layout
- **Seat Management** — Create venues, add individual seats with type & pricing; visual seat map
- **Bookings** — View all bookings for own events; manage cancellation refund approvals
- **Payments** — Full transaction history with revenue summary

---

## File Structure

```
src/
├── api/
│   └── api.js              # All Axios API calls
├── context/
│   └── AuthContext.jsx     # Login state (localStorage)
├── components/
│   ├── common/
│   │   └── Navbar.jsx
│   └── user/
│       └── EventCard.jsx
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── user/
│   │   ├── BrowsePage.jsx
│   │   ├── EventDetailPage.jsx
│   │   ├── BookingPage.jsx
│   │   ├── MyBookingsPage.jsx
│   │   └── NotificationsPage.jsx
│   └── admin/
│       ├── AdminDashboard.jsx
│       ├── AdminEventsPage.jsx
│       ├── AdminSlotsPage.jsx
│       ├── AdminSeatsPage.jsx
│       ├── AdminBookingsPage.jsx
│       └── AdminPaymentsPage.jsx
└── styles/
    └── global.css
```

---

## Backend API Base URL
Edit `src/api/api.js` to change:
```js
baseURL: 'http://localhost:8080/api'
```

## Notes
- No JWT — uses session-based auth stored in localStorage
- Admin is redirected to `/admin`, User to `/`
- Duplicate email registration is caught and shows a friendly message
- Reminder emails are handled by Spring Boot scheduler (every 5 min, 1hr before show)
