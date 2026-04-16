import { describe, it, expect } from 'bun:test';
import { registerSchema, loginSchema } from '../schemas/auth.schemas';

// ── registerSchema ────────────────────────────────────────────────────────────

describe('registerSchema', () => {
  it('accepts a valid payload', () => {
    const result = registerSchema.safeParse({
      name: 'Anya Okoro',
      email: 'anya@farm.com',
      password: 'Password1',
      locale: 'en',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a name shorter than 2 chars', () => {
    const result = registerSchema.safeParse({
      name: 'A',
      email: 'anya@farm.com',
      password: 'Password1',
      locale: 'en',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Name must be at least 2 characters');
  });

  it('rejects an invalid email', () => {
    const result = registerSchema.safeParse({
      name: 'Anya Okoro',
      email: 'not-an-email',
      password: 'Password1',
      locale: 'en',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('email');
  });

  it('rejects a password shorter than 8 chars', () => {
    const result = registerSchema.safeParse({
      name: 'Anya Okoro',
      email: 'anya@farm.com',
      password: 'pass',
      locale: 'en',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/8 characters/);
  });

  it('rejects an unsupported locale', () => {
    const result = registerSchema.safeParse({
      name: 'Anya Okoro',
      email: 'anya@farm.com',
      password: 'Password1',
      locale: 'de',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('locale');
  });

  it('accepts an optional phone number', () => {
    const result = registerSchema.safeParse({
      name: 'Anya Okoro',
      email: 'anya@farm.com',
      password: 'Password1',
      locale: 'fr',
      phone: '+2348012345678',
    });
    expect(result.success).toBe(true);
  });

  it('accepts both locales: en and fr', () => {
    const en = registerSchema.safeParse({ name: 'Test', email: 'a@b.com', password: 'Password1', locale: 'en' });
    const fr = registerSchema.safeParse({ name: 'Test', email: 'a@b.com', password: 'Password1', locale: 'fr' });
    expect(en.success).toBe(true);
    expect(fr.success).toBe(true);
  });
});

// ── loginSchema ───────────────────────────────────────────────────────────────

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({ email: 'anya@farm.com', password: 'Password1' });
    expect(result.success).toBe(true);
  });

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({ email: 'anya@farm.com', password: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('password');
  });

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-email', password: 'Password1' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('email');
  });

  it('rejects missing fields', () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
    expect(result.error?.issues.length).toBeGreaterThan(0);
  });
});
