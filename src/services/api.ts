import axios from 'axios';

// List of problematic endpoints that should be blocked temporarily
const BLOCKED_ENDPOINTS = [
  '/messages/unread-count',
  '/api/messages/unread-count'
  // Note: Feed endpoints are not blocked
];

// Create an instance of axios with default configuration
const api = axios.create({
  baseURL: 'http://localhost:5001',
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

    // Check if this is a blocked endpoint - if so, cancel the request
    if (config.url && BLOCKED_ENDPOINTS.some(endpoint => config.url?.includes(endpoint))) {
      // Create a canceled request to prevent the API call
      const cancelToken = axios.CancelToken;
      const source = cancelToken.source();
      config.cancelToken = source.token;
      source.cancel('Request blocked to prevent typing issues');
      console.log(`Blocked request to problematic endpoint: ${config.url}`);
      return config;
    }

    // FIXED: Handle URL construction correctly to avoid double /api/ prefixes
    // Only add /api prefix if the URL doesn't already have it and isn't an absolute URL
    if (config.url && !config.url.includes('/api/') && !config.url.startsWith('http')) {
      config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
    }

    // Log all API requests for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params || {});

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
    // Don't log errors for canceled requests (our blocked endpoints)
    if (axios.isCancel(error)) {
      return Promise.resolve({ data: {} }); // Return empty data for blocked requests
    }

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