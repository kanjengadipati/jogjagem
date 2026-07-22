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
  socialLogin: (provider: 'google' | 'facebook', token: string) => Promise<{ success: boolean; error?: string }>;
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
      // Try to hydrate from the httpOnly session cookie first
      await auth.hydrateSession();
    }
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
    const handleAuth = async () => {
      if (typeof window !== 'undefined') {
        let idToken = null;

        // Try getting id_token from hash
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          idToken = hashParams.get('id_token');
        }

        // Try getting id_token from search query if not found in hash
        if (!idToken && window.location.search) {
          const searchParams = new URLSearchParams(window.location.search);
          idToken = searchParams.get('id_token');
        }

        if (idToken) {
          setState(prev => ({ ...prev, isLoading: true }));
          try {
            const res = await auth.socialLogin('google', idToken);
            if (res.status === 'success') {
              // Clean up URL: remove hash and/or id_token search param
              if (window.history && window.history.replaceState) {
                const searchParams = new URLSearchParams(window.location.search);
                searchParams.delete('id_token');
                const searchStr = searchParams.toString();
                const cleanUrl = window.location.pathname + (searchStr ? `?${searchStr}` : '');
                window.history.replaceState(null, '', cleanUrl);
              } else {
                window.location.hash = '';
              }
            } else {
              console.error('Social login failed:', res.message);
              setState(prev => ({ ...prev, isLoading: false }));
            }
          } catch (err) {
            console.error('Error in social login callback:', err);
            setState(prev => ({ ...prev, isLoading: false }));
          }
        }
        await refreshProfile();
      }
    };

    handleAuth();
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

  const socialLogin = async (provider: 'google' | 'facebook', token: string) => {
    try {
      const res = await auth.socialLogin(provider, token);
      if (res.status === 'success') {
        await refreshProfile();
        return { success: true };
      }
      return { success: false, error: res.message || 'Social login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const logout = async () => {
    await auth.logout();
    setState({ isAuthenticated: false, isLoading: false, user: null });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, socialLogin, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
