import axios from 'axios';
import { Capacitor } from '@capacitor/core';

const baseURL = Capacitor.isNativePlatform() 
  ? 'https://shop-rks.onrender.com/api' 
  : '/api';

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rks_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — redirect to login, EXCEPT when we are actually trying to log in
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Don't redirect if we're already on the login page, so we can see the error message
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('rks_token');
        localStorage.removeItem('rks_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
