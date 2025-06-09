import axios from 'axios';

// Create an instance of axios with default configuration
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This is important for CORS requests with credentials
});

// Add a request interceptor to attach the JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error.message || error);
    
    // Handle unauthorized errors (expired token, etc.)
    if (error.response && error.response.status === 401) {
      // Clear stored tokens
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login (you can customize this behavior)
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api; 