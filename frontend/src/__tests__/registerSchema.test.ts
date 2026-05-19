import { describe, it, expect, vi } from 'vitest';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ setSession: vi.fn(), logout: vi.fn() }),
}));

import { registerSchema } from '../hooks/useRegisterForm';

describe('registerSchema', () => {
  const valid = {
    name: 'Anya Okoro',
    email: 'anya@farm.com',
    password: 'Password1',
    locale: 'en' as const,
  };

  it('accepts a fully valid payload', () => {
    const result = registerSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('accepts both en and fr locales', () => {
    expect(registerSchema.safeParse({ ...valid, locale: 'en' }).success).toBe(true);
    expect(registerSchema.safeParse({ ...valid, locale: 'fr' }).success).toBe(true);
  });

  it('rejects an unsupported locale', () => {
    const result = registerSchema.safeParse({ ...valid, locale: 'de' });
    expect(result.success).toBe(false);
  });

  it('rejects a name shorter than 2 characters', () => {
    const result = registerSchema.safeParse({ ...valid, name: 'A' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/2 characters/);
    }
  });

  it('rejects an invalid email', () => {
    const result = registerSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email');
    }
  });

  it('rejects a password with no uppercase letter', () => {
    const result = registerSchema.safeParse({ ...valid, password: 'password1' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/uppercase/i);
    }
  });

  it('rejects a password with no number', () => {
    const result = registerSchema.safeParse({ ...valid, password: 'Password' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/number/i);
    }
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({ ...valid, password: 'Pass1' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/8 characters/);
    }
  });

  it('accepts a valid international phone number', () => {
    const result = registerSchema.safeParse({ ...valid, phone: '+2348012345678' });
    expect(result.success).toBe(true);
  });

  it('rejects a malformed phone number', () => {
    const result = registerSchema.safeParse({ ...valid, phone: '123' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/international/i);
    }
  });

  it('allows phone to be omitted entirely', () => {
    const { phone: _p, ...withoutPhone } = { ...valid, phone: undefined };
    const result = registerSchema.safeParse(withoutPhone);
    expect(result.success).toBe(true);
  });

  it('trims whitespace from name and email', () => {
    const result = registerSchema.safeParse({ ...valid, name: '  Alice  ', email: '  alice@farm.com  ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Alice');
      expect(result.data.email).toBe('alice@farm.com');
    }
  });
});
