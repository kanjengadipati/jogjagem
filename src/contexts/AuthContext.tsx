import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, type ProfileResponse } from '../lib/api';
import { syncLocalItinerariesToDB } from '../lib/itinerary-storage';

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

  const maybeRedirectToAdmin = useCallback(async () => {
    try {
      const profileRes = await auth.getProfile();
      const role = profileRes?.data?.role;
      if (role === 'admin' || role === 'superadmin' || role === 'partner') {
        const token = auth.getAccessToken();
        if (token) {
          window.open(`${process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3005'}/login?token=${token}`, '_blank');
        }
      }
    } catch { /* ignore */ }
  }, []);

  // On mount: handle social login callback OR hydrate existing session
  useEffect(() => {
    const handleAuth = async () => {
      if (typeof window === 'undefined') return;

      let idToken: string | null = null;

      if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        idToken = hashParams.get('id_token');
      }
      if (!idToken && window.location.search) {
        const searchParams = new URLSearchParams(window.location.search);
        idToken = searchParams.get('id_token');
      }

      if (idToken) {
        // Social login callback
        try {
          const res = await auth.socialLogin('google', idToken);
          if (res.status === 'success') {
            if (window.history?.replaceState) {
              const searchParams = new URLSearchParams(window.location.search);
              searchParams.delete('id_token');
              const searchStr = searchParams.toString();
              window.history.replaceState(null, '', window.location.pathname + (searchStr ? `?${searchStr}` : ''));
            } else {
              window.location.hash = '';
            }
            await refreshProfile();
            maybeRedirectToAdmin();
          } else {
            console.error('Social login failed:', res.message);
            setState(prev => ({ ...prev, isLoading: false }));
          }
        } catch (err) {
          console.error('Error in social login callback:', err);
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        // Normal page load — hydrate session if token exists
        await refreshProfile();
      }
    };

    handleAuth();
  }, [refreshProfile, maybeRedirectToAdmin]);

  const login = async (email: string, password: string) => {
    try {
      const res = await auth.login(email, password);
      if (res.status === 'success') {
        await refreshProfile();
        syncLocalItinerariesToDB().catch(() => {});
        maybeRedirectToAdmin();
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
        syncLocalItinerariesToDB().catch(() => {});
        maybeRedirectToAdmin();
        return { success: true };
      }
      return { success: false, error: res.message || 'Social login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Social login failed' };
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
