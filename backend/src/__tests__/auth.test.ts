/**
 * Auth unit tests — Prisma and bcrypt are mocked so no database is needed.
 * Covers: register success, duplicate email, login success, wrong password.
 */
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import request from 'supertest';

// ── Mocks (must be declared before any import of the mocked modules) ──────────

const mockUser = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Alice',
  email: 'alice@test.com',
  phone: '+237600000000',
  role: 'farmer',
  locale: 'en',
  isActive: true,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const mockUserWithHash = { ...mockUser, passwordHash: '$2b$10$hashedpassword' };

// Track calls for assertion
let findUniqueCallCount = 0;
let createCallCount = 0;

mock.module('../config/prisma', () => ({
  prisma: {
    user: {
      findUnique: async ({ where }: { where: { email?: string; id?: string; isActive?: boolean } }) => {
        findUniqueCallCount++;
        // Return null for non-existent email, real user for existing email
        if (where.email === 'alice@test.com' && createCallCount > 0) return mockUserWithHash;
        if (where.email === 'duplicate@test.com') return mockUserWithHash;
        if (where.id === mockUser.id) return mockUserWithHash;
        return null;
      },
      create: async () => {
        createCallCount++;
        return mockUser;
      },
    },
  },
}));

mock.module('bcrypt', () => ({
  default: {
    hash: async (_pw: string, _rounds: number) => '$2b$10$hashedpassword',
    compare: async (plain: string, _hash: string) => plain === 'StrongPass123!',
  },
  hash: async (_pw: string, _rounds: number) => '$2b$10$hashedpassword',
  compare: async (plain: string, _hash: string) => plain === 'StrongPass123!',
}));

// ── App import (after mocks) ──────────────────────────────────────────────────

import { createApp } from '../app';
const app = createApp();

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  it('201 — registers a new user and returns user without passwordHash', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Alice',
      email: 'alice@test.com',
      password: 'StrongPass123!',
      phone: '+237600000000',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('alice@test.com');
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('409 — rejects duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Copy',
      email: 'duplicate@test.com',
      password: 'StrongPass123!',
    });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/already in use/i);
  });

  it('422 — rejects password shorter than 8 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Bob',
      email: 'bob@test.com',
      password: '123',
    });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.details).toBeDefined();
  });

  it('422 — rejects invalid email format', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Bob',
      email: 'not-an-email',
      password: 'StrongPass123!',
    });
    expect(res.status).toBe(422);
  });
});

describe('POST /api/auth/login', () => {
  it('200 — returns JWT token and user on valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'duplicate@test.com',
      password: 'StrongPass123!',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.token).toBe('string');
    expect(res.body.data.token.split('.').length).toBe(3); // valid JWT has 3 parts
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('401 — rejects wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'duplicate@test.com',
      password: 'WrongPassword!',
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/invalid credentials/i);
  });

  it('401 — rejects non-existent email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@test.com',
      password: 'StrongPass123!',
    });
    expect(res.status).toBe(401);
  });

  it('422 — rejects missing password field', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'alice@test.com' });
    expect(res.status).toBe(422);
  });
});

describe('GET /api/auth/me', () => {
  it('401 — returns 401 with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('401 — returns 401 with malformed token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not.a.token');
    expect(res.status).toBe(401);
  });
});
