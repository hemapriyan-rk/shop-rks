import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api';
import type { User, Role } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  role: Role | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('rks_token'),
    isAuthenticated: false,
    isLoading: true,
  });

  const logout = useCallback(() => {
    authApi.logout().catch(() => {}); // Notify backend, ignore errors
    localStorage.removeItem('rks_token');
    localStorage.removeItem('rks_user');
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.me();
      if (res.data.data) {
        const user = res.data.data as unknown as User;
        localStorage.setItem('rks_user', JSON.stringify(user));
        setState(s => ({ ...s, user, isAuthenticated: true, isLoading: false }));
      }
    } catch {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem('rks_token');
    if (token) {
      setState(s => ({ ...s, token, isLoading: true }));
      refreshUser();
    } else {
      setState(s => ({ ...s, isLoading: false }));
    }
  }, [refreshUser]);

  const login = async (username: string, password: string) => {
    const res = await authApi.login(username, password);
    const { token, user } = res.data.data!;
    localStorage.setItem('rks_token', token);
    localStorage.setItem('rks_user', JSON.stringify(user));
    setState({ user: user as unknown as User, token, isAuthenticated: true, isLoading: false });
  };

  const role = state.user?.role ?? null;

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      logout,
      role,
      isAdmin: role === 'ADMIN' || role === 'SUPER_ADMIN',
      isSuperAdmin: role === 'SUPER_ADMIN',
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
