// src/api.ts
// ✅ Axios instance terpusat — otomatis attach JWT token ke semua request
// Gunakan ini di semua file sebagai pengganti 'axios' biasa:
// import api from '../api';  (sesuaikan path relatifnya)

import axios from 'axios';

const BASE_URL = 'https://glikosense-backend.vercel.app';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

// Interceptor REQUEST — otomatis sisipkan token di setiap request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor RESPONSE — kalau token kadaluarsa (403), logout otomatis
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Token invalid atau expired — bersihkan sesi dan redirect ke landing
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;