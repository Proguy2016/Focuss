import api from './api';
import axios, { AxiosError } from 'axios';

// Define types for authentication data
export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
}

// Error response interface
interface ErrorResponse {
    message?: string;
}

// Create the AuthService class
class AuthService {
    // Register a new user
    async register(userData: RegisterData): Promise<AuthResponse> {
        try {
            console.log('Sending registration request to backend:', userData);
            const response = await api.post('/auth/register', userData);
            console.log('Registration response:', response.data);

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error: unknown) {
            console.error('Registration error:', error);
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<ErrorResponse>;
                if (axiosError.response?.data) {
                    const errorMessage = axiosError.response.data.message || 'Registration failed';
                    throw new Error(errorMessage);
                }
            }
            throw new Error('Registration failed - Cannot connect to the server');
        }
    }

    // Login a user
    async login(loginData: LoginData): Promise<AuthResponse> {
        try {
            console.log('Sending login request to backend:', loginData);
            const response = await api.post('/auth/login', loginData);
            console.log('Login response:', response.data);

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error: unknown) {
            console.error('Login error details:', error);
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<ErrorResponse>;
                if (axiosError.response?.data) {
                    const errorMessage = axiosError.response.data.message || 'Login failed';
                    throw new Error(errorMessage);
                }
            }
            throw new Error('Login failed - Cannot connect to the server');
        }
    }

    // Get current user information
    async getCurrentUser() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return null;
            }

            const response = await api.get('/auth/me');
            return response.data.user;
        } catch (error: unknown) {
            console.error('Error fetching current user:', error);
            this.logout();
            return null;
        }
    }

    // Logout a user
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    // Get authentication token
    getToken() {
        return localStorage.getItem('token');
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getToken();
    }
}

// Export a singleton instance
export default new AuthService(); 