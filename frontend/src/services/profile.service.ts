import { api, type ApiEnvelope } from './auth.service';
import type { AuthUser } from '../types/auth';

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  locale?: 'en' | 'fr';
}

export async function updateProfileRequest(payload: UpdateProfilePayload): Promise<AuthUser> {
  const res = await api.put<ApiEnvelope<{ user: AuthUser }>>('/api/auth/profile', payload);
  return res.data.data.user;
}