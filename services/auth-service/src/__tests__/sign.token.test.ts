import { describe, it, expect } from 'bun:test';
import jwt from 'jsonwebtoken';
import { signAuthToken } from '../services/auth.service';

const TEST_USER = {
  id:    '11111111-1111-4111-8111-111111111111',
  role:  'farmer',
  email: 'anya@farm.com',
};

describe('signAuthToken', () => {
  it('returns a non-empty string', () => {
    const token = signAuthToken(TEST_USER);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('produces a valid JWT with three segments', () => {
    const token = signAuthToken(TEST_USER);
    const parts = token.split('.');
    expect(parts.length).toBe(3);
  });

  it('embeds sub, role, and email claims', () => {
    const token   = signAuthToken(TEST_USER);
    const decoded = jwt.decode(token) as Record<string, unknown>;
    expect(decoded.sub).toBe(TEST_USER.id);
    expect(decoded.role).toBe(TEST_USER.role);
    expect(decoded.email).toBe(TEST_USER.email);
  });

  it('includes an expiry (exp) claim', () => {
    const token   = signAuthToken(TEST_USER);
    const decoded = jwt.decode(token) as Record<string, unknown>;
    expect(decoded.exp).toBeDefined();
    expect(typeof decoded.exp).toBe('number');
  });

  it('generates different tokens for different users', () => {
    const token1 = signAuthToken({ id: 'aaa', role: 'farmer', email: 'a@b.com' });
    const token2 = signAuthToken({ id: 'bbb', role: 'admin',  email: 'c@d.com' });
    expect(token1).not.toBe(token2);
  });

  it('is verifiable with the test JWT_SECRET', () => {
    const token = signAuthToken(TEST_USER);
    expect(() => jwt.verify(token, process.env.JWT_SECRET!)).not.toThrow();
  });
});
