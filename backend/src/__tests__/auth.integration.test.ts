/**
 * Auth Integration Tests
 * Requires a running PostgreSQL instance: docker compose -f docker-compose.dev.yml up -d
 * Requires the schema to be pushed: bun run prisma:push
 */
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import request from 'supertest';
import { prisma } from '../config/prisma';
import { createApp } from '../app';

const app = createApp();

const testUser = {
  name: 'Test Farmer',
  email: `farmer_${Date.now()}@test.com`,
  password: 'StrongPass123!',
};

let authToken: string;

beforeAll(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    console.warn('⚠ Database not available — skipping auth integration tests');
    process.exit(0);
  }
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: testUser.email } }).catch(() => {});
  await prisma.$disconnect().catch(() => {});
});

describe('POST /api/v1/auth/register', () => {
  it('registers a new user and returns 201', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('returns 409 when email is already taken', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);
    expect(res.status).toBe(409);
  });

  it('returns 422 for invalid payload (short password)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...testUser, email: 'new@test.com', password: '123' });
    expect(res.status).toBe(422);
    expect(res.body.details).toBeDefined();
  });
});

describe('POST /api/v1/auth/login', () => {
  it('returns a JWT token on valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(typeof res.body.data.token).toBe('string');
    authToken = res.body.data.token;
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: 'wrongpass' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/auth/me', () => {
  it('returns current user with valid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });
});
