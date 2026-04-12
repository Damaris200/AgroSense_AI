export type Locale = 'en' | 'fr';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'farmer' | 'agronomist' | 'admin';
  locale: Locale;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}
