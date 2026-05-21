import { describe, it, expect, vi } from 'vitest';

vi.mock('../utils/passkey', () => ({
  isPasskeySupported: () => false,
  hasPasskeyCredential: () => false,
  enablePasskeyForSession: vi.fn(),
  signInWithPasskey: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ setSession: vi.fn(), logout: vi.fn() }),
}));

import { loginSchema } from '@/hooks/useLoginForm';

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'Password1' });
    expect(result.success).toBe(true);
  });

  it('rejects an empty email', () => {
    const result = loginSchema.safeParse({ email: '', password: 'Password1' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid email format', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'Password1' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email');
    }
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'short' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/8 characters/);
    }
  });

  it('rejects missing fields', () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });

  it('trims whitespace from email', () => {
    const result = loginSchema.safeParse({ email: '  user@example.com  ', password: 'Password1' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('user@example.com');
    }
  });

  it('rejects a missing password field', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com' });
    expect(result.success).toBe(false);
  });
});
