import axios from 'axios';

const BASE = 'http://localhost:8080/api';
const api = axios.create({ baseURL: BASE });

export const userApi = {
  getAll:  () => api.get('/users').then(r => r.data),
  getById: (id) => api.get(`/users/${id}`).then(r => r.data),
  create:  (data) => api.post('/users', data).then(r => r.data),
  update:  (id, data) => api.put(`/users/${id}`, data).then(r => r.data),
  delete:  (id) => api.delete(`/users/${id}`),
};

export const incomeApi = {
  getAll:  () => api.get('/income').then(r => r.data),
  create:  (data) => api.post('/income', data).then(r => r.data),
  update:  (id, data) => api.put(`/income/${id}`, data).then(r => r.data),
  delete:  (id) => api.delete(`/income/${id}`),
};

export const expenseApi = {
  getAll:  () => api.get('/expense').then(r => r.data),
  create:  (data) => api.post('/expense', data).then(r => r.data),
  update:  (id, data) => api.put(`/expense/${id}`, data).then(r => r.data),
  delete:  (id) => api.delete(`/expense/${id}`),
};

export const budgetApi = {
  getAll:  () => api.get('/budget').then(r => r.data),
  create:  (data) => api.post('/budget', data).then(r => r.data),
  update:  (id, data) => api.put(`/budget/${id}`, data).then(r => r.data),
  delete:  (id) => api.delete(`/budget/${id}`),
};

// Fixed path to /goals/user/{userId}
export const goalApi = {
  getByUser: (userId) => api.get(`/goals/user/${userId}`).then(r => r.data),
  create:    (userId, data) => api.post(`/goals/user/${userId}`, data).then(r => r.data),
  update:    (goalId, data) => api.put(`/goals/${goalId}`, data).then(r => r.data),
  delete:    (goalId) => api.delete(`/goals/${goalId}`),
};

export const balanceApi = {
  getByUser: (userId) => api.get(`/balance/${userId}`).then(r => r.data),
  update:    (userId) => api.put(`/balance/${userId}`).then(r => r.data),
};

export const notificationApi = {
  getAll:  () => api.get('/notifications').then(r => r.data),
  create:  (data) => api.post('/notifications', data).then(r => r.data),
  delete:  (id) => api.delete(`/notifications/${id}`),
};