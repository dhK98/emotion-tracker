// src/api/axios.ts
import axios, { AxiosInstance } from 'axios';
import { useNavigate } from 'react-router-dom';

const api: AxiosInstance = axios.create({
    baseURL: 'http://localhost:3010',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ✅ 요청 인터셉터 – JWT 토큰 자동 첨부
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ 응답 인터셉터 – 401 처리
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn('Unauthorized. Redirecting to login...');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
