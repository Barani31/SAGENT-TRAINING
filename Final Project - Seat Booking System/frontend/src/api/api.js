import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((cfg) => {
  try {
    const stored = localStorage.getItem('sbs_user');
    if (stored) {
      const userData = JSON.parse(stored);
      if (userData?.token) cfg.headers.Authorization = `Bearer ${userData.token}`;
    }
  } catch { /* ignore */ }
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sbs_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const loginUser    = (data) => api.post('/users/login', data);
export const registerUser = (data) => api.post('/users/register', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const checkEmailExists = (email) =>
  api.get('/users/search', { params: { name: email } })
    .then((res) => {
      const users  = res.data?.data || [];
      const exists = users.some((u) => u.mail?.toLowerCase() === email.toLowerCase());
      return { data: { data: { exists } } };
    })
    .catch(() => ({ data: { data: { exists: false } } }));
export const forgotPassword = (mail)                   => api.post('/users/forgot-password', null, { params: { mail } });
export const resetPassword  = (mail, otp, newPassword) => api.post('/users/reset-password',  null, { params: { mail, otp, newPassword } });

// ─── EVENTS ───────────────────────────────────────────────────────────────────
export const getAllEvents          = (sortBy)      => api.get('/events', { params: sortBy ? { sortBy } : {} });
export const filterEvents         = (params)      => api.get('/events/filter', { params });
export const getEventById         = (id)          => api.get(`/events/${id}`);
export const getEventsByOrganiser = (organiserId) => api.get(`/events/organiser/${organiserId}`);
export const searchEvents         = (name)        => api.get('/events/search', { params: { name } });
export const createEvent          = (data)        => api.post('/events', data);
export const updateEvent          = (id, data)    => api.put(`/events/${id}`, data);
export const deleteEvent          = (id)          => api.delete(`/events/${id}`);

// ─── SLOTS ────────────────────────────────────────────────────────────────────
export const getAllSlots        = ()         => api.get('/slots');
export const getSlotById       = (id)       => api.get(`/slots/${id}`);
export const getSlotsByEvent   = (eventId)  => api.get(`/slots/event/${eventId}`);
export const getAvailableSeats = (slotId)   => api.get(`/slots/${slotId}/seats/available`);
export const createSlot        = (data)     => api.post('/slots', data);
export const updateSlot        = (id, data) => api.put(`/slots/${id}`, data);
export const deleteSlot        = (id)       => api.delete(`/slots/${id}`);
export const getAllSeatsForSlot = (slotId)  => api.get(`/slots/${slotId}/seats/all`);
export const syncSeatsForSlot  = (slotId)  => api.post(`/slots/${slotId}/seats/sync`);

// ─── LOCATIONS ────────────────────────────────────────────────────────────────
export const getAllLocations  = ()         => api.get('/locations');
export const getLocationById  = (id)       => api.get(`/locations/${id}`);
export const createLocation   = (data)     => api.post('/locations', data);
export const updateLocation   = (id, data) => api.put(`/locations/${id}`, data);
export const deleteLocation   = (id)       => api.delete(`/locations/${id}`);

// ─── SEATS ────────────────────────────────────────────────────────────────────
export const getSeatsByLocation = (locationId)       => api.get(`/seats/location/${locationId}`);
export const createSeat         = (locationId, data) => api.post(`/seats/location/${locationId}`, data);
export const updateSeat         = (id, data)         => api.put(`/seats/${id}`, data);
export const deleteSeat         = (id)               => api.delete(`/seats/${id}`);

// ─── SEAT HOLD TIMER ──────────────────────────────────────────────────────────
export const lockSeatHold    = (slotId, userId, seatSlotIds) =>
  api.post(`/seat-slots/lock?slotId=${slotId}&userId=${userId}`, seatSlotIds);
export const releaseSeatHold = (slotId, userId) =>
  api.post(`/seat-slots/release?slotId=${slotId}&userId=${userId}`);
export const getHoldTimer    = (slotId, userId) =>
  api.get('/seat-slots/hold-timer', { params: { slotId, userId } });

// ─── RESERVATIONS ─────────────────────────────────────────────────────────────
export const bookSeats                     = (data)   => api.post('/reservations/book', data);
export const getReservationsByUser         = (userId) => api.get(`/reservations/user/${userId}`);
export const getReservationsByOrganiser    = (orgId)  => api.get(`/reservations/organiser/${orgId}`);
export const getReservationById            = (id)     => api.get(`/reservations/${id}`);
export const deleteReservation             = (id)     => api.delete(`/reservations/${id}`);
export const getLoyaltyOffer               = (userId) => api.get(`/reservations/loyalty/${userId}`);
export const getReservedSeatsByReservation = (resId)  => api.get(`/reserved-seats/reservation/${resId}`);

// ─── CANCELLATIONS ────────────────────────────────────────────────────────────
export const cancelReservation      = (data)       => api.post('/cancellations', data);
export const getAllCancellations     = ()           => api.get('/cancellations');
export const getCancellationsByUser = (userId)     => api.get(`/cancellations/user/${userId}`);
export const updateRefundStatus     = (id, status) =>
  api.put(`/cancellations/${id}/refund-status`, null, { params: { status } });

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
export const processPayment              = (data)   => api.post('/transactions/pay', data);
export const getTransactionsByUser       = (userId) => api.get(`/transactions/user/${userId}`);
export const getTransactionsByOrganiser  = (orgId)  => api.get(`/transactions/organiser/${orgId}`);
export const getTransactionByReservation = (resId)  => api.get(`/transactions/reservation/${resId}`);

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const getNotificationsByUser = (userId) => api.get(`/notifications/user/${userId}`);
export const getUnreadNotificationCount = (userId) =>
  api.get(`/notifications/user/${userId}/unread-count`);
 
export const markAllNotificationsRead = (userId) =>
  api.put(`/notifications/user/${userId}/mark-all-read`);
// ─── REVIEWS ──────────────────────────────────────────────────────────────────
export const submitReview          = (data)          => api.post('/reviews', data);
export const getReviewsByEvent     = (eventId)       => api.get(`/reviews/event/${eventId}`);
export const getReviewsByUser      = (userId)        => api.get(`/reviews/user/${userId}`);
export const getEventRatingSummary = (eventId)       => api.get(`/reviews/event/${eventId}/summary`);
export const checkHasReviewed      = (reservationId) => api.get(`/reviews/check/${reservationId}`);