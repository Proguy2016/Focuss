import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AuthService, { AuthResponse, LoginData, RegisterData, UserProfile } from '../services/AuthService';
import api from '../services/api';
import { AppContext } from './AppContext';

// Define the AuthContext type
interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (loginData: LoginData) => Promise<void>;
  register: (registerData: RegisterData) => Promise<void>;
  logout: () => void;
  updateName: (nameData: { firstName: string, lastName: string }) => Promise<void>;
  updateBio: (bioData: { bio: string }) => Promise<void>;
  updatePrivacy: (privacyData: any) => Promise<void>;
  updatePfp: (formData: FormData) => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  clearError: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: { token: string; newPassword: string }) => Promise<void>;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const appContext = useContext(AppContext);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const currentUser = await AuthService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login a user
  const login = useCallback(async (loginData: LoginData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await AuthService.login(loginData);
      localStorage.setItem('token', response.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
      setUser(response.user);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Register a new user
  const register = useCallback(async (registerData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await AuthService.register(registerData);
      localStorage.setItem('token', response.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
      setUser(response.user);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout a user
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    if (appContext && appContext.resetAppState) {
      appContext.resetAppState();
    }
  }, [appContext]);

  const safeUpdateUser = useCallback((updatedData: Partial<UserProfile>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      // Merge the new data with the existing user data
      return { ...prevUser, ...updatedData };
    });
  }, []);

  const updateName = useCallback(async (nameData: { firstName: string, lastName: string }) => {
    if (!user) throw new Error("User not authenticated");
    try {
      const updatedUser = await AuthService.updateName(nameData);
      safeUpdateUser(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Name update failed');
      throw err;
    }
  }, [user, safeUpdateUser]);

  const updateBio = useCallback(async (bioData: { bio: string }) => {
    if (!user) throw new Error("User not authenticated");
    try {
      const updatedUser = await AuthService.updateBio(bioData);
      safeUpdateUser(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bio update failed');
      throw err;
    }
  }, [user, safeUpdateUser]);

  const updatePrivacy = useCallback(async (privacyData: any) => {
    if (!user) throw new Error("User not authenticated");
    try {
      const updatedUser = await AuthService.updatePrivacy(privacyData);
      safeUpdateUser(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Privacy update failed');
      throw err;
    }
  }, [user, safeUpdateUser]);

  const updatePfp = useCallback(async (formData: FormData) => {
    if (!user) throw new Error("User not authenticated");
    try {
      console.log('Updating pfp in AuthContext');
      const updatedUser = await AuthService.updatePfp(formData);
      safeUpdateUser(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile picture update failed');
      throw err;
    }
  }, [user, safeUpdateUser]);

  // Forgot password
  const forgotPassword = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      await AuthService.forgotPassword(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (data: { token: string; newPassword: string }) => {
    try {
      setLoading(true);
      setError(null);
      await AuthService.resetPassword(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Context value
  const value = useMemo(() => ({
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateName,
    updateBio,
    updatePrivacy,
    updatePfp,
    setUser,
    clearError,
    forgotPassword,
    resetPassword,
  }), [user, loading, error, login, register, logout, updateName, updateBio, updatePrivacy, updatePfp, setUser, clearError, forgotPassword, resetPassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 