import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add interceptors to automatically include the auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('API Request:', config.method.toUpperCase(), config.url, 'Token injected');
    } else {
        console.warn('API Request:', config.method.toUpperCase(), config.url, 'No token found in localStorage');
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
