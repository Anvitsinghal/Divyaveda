import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/', // Your backend URL
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: Automatically add Token to EVERY request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('userToken'); // distinct key for user app
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;