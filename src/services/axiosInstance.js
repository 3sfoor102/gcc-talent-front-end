import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 403 || error.response.status === 401)) {
            
            const errorMsg = error.response.data?.err || error.response.data?.message;
            
            if (errorMsg === 'Account suspended' || errorMsg === 'Your account has been suspended.') {
                localStorage.removeItem('token');
                window.location.href = '/sign-in';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;