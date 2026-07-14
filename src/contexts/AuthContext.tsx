import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, type ProfileResponse } from '../lib/api';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: ProfileResponse | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  const refreshProfile = useCallback(async () => {
    if (!auth.isLoggedIn()) {
      setState({ isAuthenticated: false, isLoading: false, user: null });
      return;
    }
    try {
      const res = await auth.getProfile();
      if (res.status === 'success' && res.data) {
        setState({ isAuthenticated: true, isLoading: false, user: res.data });
      } else {
        setState({ isAuthenticated: false, isLoading: false, user: null });
      }
    } catch {
      setState({ isAuthenticated: false, isLoading: false, user: null });
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (email: string, password: string) => {
    try {
      const res = await auth.login(email, password);
      if (res.status === 'success') {
        await refreshProfile();
        // Get fresh profile to check role
        const profileRes = await auth.getProfile();
        const role = profileRes?.data?.role;
        if (role === 'admin' || role === 'superadmin') {
          const token = auth.getAccessToken();
          if (token) {
            window.open(`http://localhost:3005/login?token=${token}`, '_blank');
            return { success: true };
          }
        }
        return { success: true };
      }
      return { success: false, error: res.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await auth.register(name, email, password);
      if (res.status === 'success') {
        return { success: true };
      }
      return { success: false, error: res.message || 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const logout = async () => {
    await auth.logout();
    setState({ isAuthenticated: false, isLoading: false, user: null });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
