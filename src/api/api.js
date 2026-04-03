import axios from 'axios';

/**
 * API Configuration
 * Centralized axios instance with interceptors
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 30000 // 30 seconds
});

// Optional: Global loading counter for overlay loaders
let pendingRequests = 0;
const loadingListeners = [];

/**
 * Subscribe to global loading count changes
 * Useful for showing/hiding global spinners
 */
export const subscribeToLoading = (callback) => {
    loadingListeners.push(callback);
    return () => {
        const index = loadingListeners.indexOf(callback);
        if (index > -1) loadingListeners.splice(index, 1);
    };
};

const notifyListeners = () => {
    loadingListeners.forEach(cb => cb(pendingRequests));
};

// Request interceptor - inject auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn('No auth token found for:', config.url);
        }

        // Increment pending requests for global loading
        pendingRequests++;
        notifyListeners();

        // Add request ID for debugging
        config.metadata = config.metadata || {};
        config.metadata.requestId = Math.random().toString(36).substring(7);

        console.log(`[API ${config.metadata.requestId}] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        pendingRequests = Math.max(0, pendingRequests - 1);
        notifyListeners();
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors and decrement counter
api.interceptors.response.use(
    (response) => {
        pendingRequests = Math.max(0, pendingRequests - 1);
        notifyListeners();
        console.log(`[API] ${response.status} ${response.config?.url}`);
        return response;
    },
    (error) => {
        pendingRequests = Math.max(0, pendingRequests - 1);
        notifyListeners();

        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;
            console.error(`[API Error] ${status} on ${error.config?.url}`, data);

            // Handle common errors
            if (status === 401) {
                // Unauthorized - redirect to login
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else if (status === 403) {
                console.error('Access forbidden. Insufficient permissions.');
            } else if (status >= 500) {
                console.error('Server error. Please try again later.');
            }
        } else if (error.request) {
            // Network error or timeout
            console.error('Network error. Please check your connection.');
        } else {
            // Other error
            console.error('Request setup error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default api;
