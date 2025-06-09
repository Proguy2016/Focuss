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
    user: any;
}

export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    bio?: string;
    profilePicture?: string;
    settings?: any;
}

// Error response interface
interface ErrorResponse {
    message?: string;
}

// Create the AuthService class
class AuthService {
    // Register a new user
    async register(userData: RegisterData): Promise<AuthResponse> {
        console.log('Sending registration request to backend:', userData);
        const response = await api.post('/auth/register', userData);
        return response.data;
    }

    // Login a user
    async login(loginData: LoginData): Promise<AuthResponse> {
        console.log('Sending login request to backend:', loginData);
        const response = await api.post('/auth/login', loginData);
        return response.data;
    }

    // Get current user information
    async getCurrentUser(): Promise<UserProfile | null> {
        const token = localStorage.getItem('token');
        if (!token) {
            return null;
        }
        // We need to set the token for this specific request
        const response = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.user;
    }

    // Update user name
    async updateName(nameData: { firstName: string, lastName: string }): Promise<UserProfile> {
        const response = await api.put('/update/name', nameData);
        return response.data.user;
    }

    // Update user bio
    async updateBio(bioData: { bio: string }): Promise<UserProfile> {
        const response = await api.put('/update/bio', bioData);
        return response.data.user;
    }

    // Update privacy settings
    async updatePrivacy(privacyData: any): Promise<UserProfile> {
        const response = await api.put('/update/privacy', privacyData);
        return response.data.user;
    }

    // Update profile picture
    async updatePfp(formData: FormData): Promise<UserProfile> {
        const response = await api.post('/update/pfp', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.user;
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