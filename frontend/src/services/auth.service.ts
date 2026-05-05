import axios from 'axios';
import type { AuthResponse, AuthUser } from '../types/auth';

export const TOKEN_STORAGE_KEY = 'agrosense_token';

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: string;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config;

  const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) return config;

  config.headers = config.headers ?? {};
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function extractApiError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { error?: string } | undefined)?.error;
    return message ?? error.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

// ── Auth API calls ────────────────────────────────────────────────────────────

export async function loginRequest(email: string, password: string) {
  const res = await api.post<ApiEnvelope<AuthResponse>>('/api/auth/login', { email, password });
  return res.data.data;
}

export async function registerRequest(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  locale: 'en' | 'fr';
}) {
  const res = await api.post<ApiEnvelope<{ user: AuthUser; token?: string }>>(
    '/api/auth/register',
    payload,
  );
  return res.data.data;
}

export async function getMeRequest() {
  const res = await api.get<ApiEnvelope<{ user: AuthUser }>>('/api/auth/me');
  return res.data.data.user;
}

export async function updateProfileRequest(data: {
  name?: string;
  phone?: string;
  locale?: 'en' | 'fr';
}) {
  const res = await api.put<ApiEnvelope<{ user: AuthUser }>>('/api/auth/profile', data);
  return res.data.data.user;
}
