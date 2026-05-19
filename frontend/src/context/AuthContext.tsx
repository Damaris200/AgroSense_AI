/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { TOKEN_STORAGE_KEY, getMeRequest } from '../services/auth.service';
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

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    if (typeof globalThis.window !== 'undefined') {
      globalThis.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    setToken(null);
    setUser(null);
  }, []);

  const setSession = useCallback(({ user: nextUser, token: nextToken }: AuthResponse) => {
    if (typeof globalThis.window !== 'undefined') {
      globalThis.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    }
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      if (typeof globalThis.window === 'undefined') {
        if (isMounted) setIsLoading(false);
        return;
      }

      const storedToken = globalThis.localStorage.getItem(TOKEN_STORAGE_KEY);

      if (!storedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      setToken(storedToken);

      try {
        const authUser = await getMeRequest();
        if (isMounted) setUser(authUser);
      } catch {
        if (isMounted) clearSession();
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void initializeAuth();
    return () => { isMounted = false; };
  }, [clearSession]);

  const contextValue = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      setSession,
      logout,
    }),
    [user, token, isLoading, setSession, logout],
  );

  return (
    <AuthContext.Provider value={contextValue}>
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
