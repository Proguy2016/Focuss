import api from './api';

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
    level?: number;
    xp?: number;
}

// Create the AuthService class
class AuthService {
    // Register a new user
    async register(userData: RegisterData): Promise<AuthResponse> {
        console.log('Sending registration request to backend:', userData);
        const response = await api.post('/api/auth/register', userData);
        return response.data;
    }

    // Login a user
    async login(loginData: LoginData): Promise<AuthResponse> {
        console.log('Sending login request to backend:', loginData);
        const response = await api.post('/api/auth/login', loginData);
        return response.data;
    }

    // Get current user information
    async getCurrentUser(): Promise<UserProfile | null> {
        const token = localStorage.getItem('token');
        if (!token) {
            return null;
        }
        // We need to set the token for this specific request
        const response = await api.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.user;
    }

    // Update user name
    async updateName(nameData: { firstName: string, lastName: string }): Promise<UserProfile> {
        const response = await api.put('/api/update/name', nameData);
        return response.data.user;
    }

    // Update user bio
    async updateBio(bioData: { bio: string }): Promise<UserProfile> {
        const response = await api.put('/api/update/bio', bioData);
        return response.data.user;
    }

    // Update privacy settings
    async updatePrivacy(privacyData: any): Promise<UserProfile> {
        const response = await api.put('/api/update/privacy', privacyData);
        return response.data.user;
    }

    // Update profile picture
    async updatePfp(formData: FormData): Promise<UserProfile> {
        const response = await api.put('/api/update/pfp', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.user;
    }

    // Forgot password
    async forgotPassword(email: string): Promise<void> {
        await api.post('/api/auth/forgot-password', { email });
    }

    // Reset password
    async resetPassword(data: { token: string; newPassword: string }): Promise<void> {
        // Use PUT for reset-password endpoint instead of POST
        await api.put('/api/auth/reset-password', data);
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