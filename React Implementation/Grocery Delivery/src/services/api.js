import axios from 'axios';

const BASE = 'http://localhost:8080/api';
const api  = axios.create({ baseURL: BASE });

export const customerApi = {
  getAll:  ()          => api.get('/customers').then(r => r.data),
  getById: (id)        => api.get(`/customers/${id}`).then(r => r.data),
  create:  (data)      => api.post('/customers', data).then(r => r.data),
  update:  (id, data)  => api.put(`/customers/${id}`, data).then(r => r.data),
  delete:  (id)        => api.delete(`/customers/${id}`),
  login:   (data)      => api.post('/auth/login', data).then(r => r.data),
};

export const categoryApi = {
  getAll:  ()         => api.get('/categories').then(r => r.data),
  create:  (data)     => api.post('/categories', data).then(r => r.data),
  update:  (id, data) => api.put(`/categories/${id}`, data).then(r => r.data),
  delete:  (id)       => api.delete(`/categories/${id}`),
};

export const productApi = {
  getAll:  ()         => api.get('/products').then(r => r.data),
  getById: (id)       => api.get(`/products/${id}`).then(r => r.data),
  create:  (data)     => api.post('/products', data).then(r => r.data),
  update:  (id, data) => api.put(`/products/${id}`, data).then(r => r.data),
  delete:  (id)       => api.delete(`/products/${id}`),
};

export const cartApi = {
  getAll:  ()         => api.get('/carts').then(r => r.data),
  getById: (id)       => api.get(`/carts/${id}`).then(r => r.data),
  create:  (data)     => api.post('/carts', data).then(r => r.data),
  update:  (id, data) => api.put(`/carts/${id}`, data).then(r => r.data),
  delete:  (id)       => api.delete(`/carts/${id}`),
};

export const orderApi = {
  getAll:  ()         => api.get('/orders').then(r => r.data),
  getById: (id)       => api.get(`/orders/${id}`).then(r => r.data),
  create:  (data)     => api.post('/orders', data).then(r => r.data),
  update:  (id, data) => api.put(`/orders/${id}`, data).then(r => r.data),
  delete:  (id)       => api.delete(`/orders/${id}`),
};

export const paymentApi = {
  getAll:  ()         => api.get('/payments').then(r => r.data),
  create:  (data)     => api.post('/payments', data).then(r => r.data),
  update:  (id, data) => api.put(`/payments/${id}`, data).then(r => r.data),
  delete:  (id)       => api.delete(`/payments/${id}`),
};

export const deliveryApi = {
  getAll:  ()         => api.get('/delivery-persons').then(r => r.data),
  create:  (data)     => api.post('/delivery-persons', data).then(r => r.data),
  update:  (id, data) => api.put(`/delivery-persons/${id}`, data).then(r => r.data),
  delete:  (id)       => api.delete(`/delivery-persons/${id}`),
};

export const notificationApi = {
  getAll:  ()         => api.get('/notifications').then(r => r.data),
  create:  (data)     => api.post('/notifications', data).then(r => r.data),
  delete:  (id)       => api.delete(`/notifications/${id}`),
};
