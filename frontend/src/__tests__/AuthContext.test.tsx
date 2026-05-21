import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor, cleanup } from '@testing-library/react';
import type { ReactNode } from 'react';

// vi.mock is hoisted — use vi.fn() directly inside the factory
vi.mock('@/services/auth.service', () => ({
  getMeRequest:      vi.fn(),
  TOKEN_STORAGE_KEY: 'agrosense_token',
}));

// Import the mocked module AFTER vi.mock so we get the mock instance
import { getMeRequest } from '@/services/auth.service';
import { AuthProvider, useAuth } from '@/context/AuthContext';

const mockGetMe = vi.mocked(getMeRequest);

const MOCK_USER = {
  id:        'user-123',
  name:      'Anya Okoro',
  email:     'anya@farm.com',
  role:      'farmer' as const,
  locale:    'en' as const,
  isActive:  true,
  phone:     null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const MOCK_TOKEN = 'mock.jwt.token';

function wrapper({ children }: { readonly children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('useAuth — outside provider', () => {
  it('throws when used outside AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider',
    );
  });
});

describe('AuthProvider initial state', () => {
  beforeEach(() => {
    localStorage.clear();
    mockGetMe.mockReset();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('starts unauthenticated when no token is stored', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('resolves session from localStorage when a token is present', async () => {
    mockGetMe.mockResolvedValue(MOCK_USER);
    localStorage.setItem('agrosense_token', MOCK_TOKEN);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(MOCK_USER);
    expect(result.current.token).toBe(MOCK_TOKEN);
  });

  it('clears session when getMeRequest rejects (invalid stored token)', async () => {
    mockGetMe.mockRejectedValue(new Error('Token expired'));
    localStorage.setItem('agrosense_token', 'bad-token');

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('agrosense_token')).toBeNull();
  });
});

describe('setSession and logout', () => {
  beforeEach(() => {
    localStorage.clear();
    mockGetMe.mockReset();
    mockGetMe.mockResolvedValue(null as never);
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('setSession stores token in localStorage and marks authenticated', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => { result.current.setSession({ user: MOCK_USER, token: MOCK_TOKEN }); });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(MOCK_USER);
    expect(result.current.token).toBe(MOCK_TOKEN);
    expect(localStorage.getItem('agrosense_token')).toBe(MOCK_TOKEN);
  });

  it('logout clears user, token, and localStorage', async () => {
    mockGetMe.mockResolvedValue(MOCK_USER);
    localStorage.setItem('agrosense_token', MOCK_TOKEN);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => { result.current.logout(); });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem('agrosense_token')).toBeNull();
  });
});
