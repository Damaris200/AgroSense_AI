/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { api, type ApiEnvelope, TOKEN_STORAGE_KEY } from '../lib/api';
import type { AuthResponse, AuthUser } from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (session: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }

    setToken(null);
    setUser(null);
  };

  const setSession = ({ user: nextUser, token: nextToken }: AuthResponse) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    }

    setToken(nextToken);
    setUser(nextUser);
  };

  const logout = () => {
    clearSession();
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      if (typeof window === 'undefined') {
        if (isMounted) setIsLoading(false);
        return;
      }

      const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);

      if (!storedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      setToken(storedToken);

      try {
        const response = await api.get<ApiEnvelope<{ user: AuthUser }>>('/api/auth/me');

        if (isMounted) {
          setUser(response.data.data.user);
        }
      } catch {
        if (isMounted) {
          clearSession();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        setSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
