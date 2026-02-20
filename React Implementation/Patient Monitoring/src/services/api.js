import axios from 'axios';

const BASE = 'http://localhost:8080/api';
const api = axios.create({ baseURL: BASE });

// Auth
export const authApi = {
  patientLogin: (data) => api.post('/auth/patient-login', data).then(r => r.data),
  doctorLogin:  (data) => api.post('/auth/doctor-login', data).then(r => r.data),
};

// Patients
export const patientApi = {
  getAll:   () => api.get('/patients').then(r => r.data),
  getById:  (id) => api.get(`/patients/${id}`).then(r => r.data),
  create:   (data) => api.post('/patients', data).then(r => r.data),
  update:   (id, data) => api.put(`/patients/${id}`, data).then(r => r.data),
  delete:   (id) => api.delete(`/patients/${id}`),
};

// Doctors
export const doctorApi = {
  getAll:   () => api.get('/doctors').then(r => r.data),
  getById:  (id) => api.get(`/doctors/${id}`).then(r => r.data),
  create:   (data) => api.post('/doctors', data).then(r => r.data),
  update:   (id, data) => api.put(`/doctors/${id}`, data).then(r => r.data),
  delete:   (id) => api.delete(`/doctors/${id}`),
};

// Appointments — backend needs /api/appointments/patient/{id} and /doctor/{id}
export const appointmentApi = {
  getAll:        () => api.get('/appointments').then(r => r.data),
  getByPatient:  (id) => api.get(`/appointments/patient/${id}`).then(r => r.data),
  getByDoctor:   (id) => api.get(`/appointments/doctor/${id}`).then(r => r.data),
  create:        (data) => api.post('/appointments', data).then(r => r.data),
  update:        (id, data) => api.put(`/appointments/${id}`, data).then(r => r.data),
  delete:        (id) => api.delete(`/appointments/${id}`),
};

// Consultations
export const consultationApi = {
  getAll:       () => api.get('/consultations').then(r => r.data),
  getByPatient: (id) => api.get(`/consultations/patient/${id}`).then(r => r.data),
  getByDoctor:  (id) => api.get(`/consultations/doctor/${id}`).then(r => r.data),
  create:       (data) => api.post('/consultations', data).then(r => r.data),
  update:       (id, data) => api.put(`/consultations/${id}`, data).then(r => r.data),
  delete:       (id) => api.delete(`/consultations/${id}`),
};

// Daily Readings
export const dailyReadingApi = {
  getAll:       () => api.get('/readings').then(r => r.data),
  getByPatient: (id) => api.get(`/readings/patient/${id}`).then(r => r.data),
  create:       (data) => api.post('/readings', data).then(r => r.data),
  update:       (id, data) => api.put(`/readings/${id}`, data).then(r => r.data),
  delete:       (id) => api.delete(`/readings/${id}`),
};

// Health Data
export const healthDataApi = {
  getAll:       () => api.get('/health-data').then(r => r.data),
  getByPatient: (id) => api.get(`/health-data/patient/${id}`).then(r => r.data),
  create:       (data) => api.post('/health-data', data).then(r => r.data),
  update:       (id, data) => api.put(`/health-data/${id}`, data).then(r => r.data),
  delete:       (id) => api.delete(`/health-data/${id}`),
};

// Messages
export const messageApi = {
  getAll:       () => api.get('/messages').then(r => r.data),
  getByPatient: (id) => api.get(`/messages/patient/${id}`).then(r => r.data),
  getByDoctor:  (id) => api.get(`/messages/doctor/${id}`).then(r => r.data),
  create:       (data) => api.post('/messages', data).then(r => r.data),
  update:       (id, data) => api.put(`/messages/${id}`, data).then(r => r.data),
  delete:       (id) => api.delete(`/messages/${id}`),
};

// Reports
export const reportApi = {
  getAll:       () => api.get('/reports').then(r => r.data),
  getByPatient: (id) => api.get(`/reports/patient/${id}`).then(r => r.data),
  create:       (data) => api.post('/reports', data).then(r => r.data),
  update:       (id, data) => api.put(`/reports/${id}`, data).then(r => r.data),
  delete:       (id) => api.delete(`/reports/${id}`),
};