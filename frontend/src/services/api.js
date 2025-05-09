import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'; // Default to backend port 5000

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Interceptor to handle 401 errors (e.g., redirect to login)
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       // Token expired or invalid
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       // Prevent redirect loops if already on login page
//       if (window.location.pathname !== '/login') {
//         window.location.href = '/login'; 
//       }
//     }
//     return Promise.reject(error);
//   }
// );

export default api;
