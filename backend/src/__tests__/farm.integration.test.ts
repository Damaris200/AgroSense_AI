/**
 * Farm Integration Tests
 * Requires a running PostgreSQL instance and pushed schema.
 */
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import request from 'supertest';
import { prisma } from '../config/prisma';
import { createApp } from '../app';

const app = createApp();
const testEmail = `farm_test_${Date.now()}@test.com`;
const testPassword = 'StrongPass123!';
let authToken: string;
let createdFarmId: string;

beforeAll(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    console.warn('⚠ Database not available — skipping farm integration tests');
    process.exit(0);
  }

  await request(app).post('/api/v1/auth/register').send({ name: 'Farm Tester', email: testEmail, password: testPassword });
  const loginRes = await request(app).post('/api/v1/auth/login').send({ email: testEmail, password: testPassword });
  authToken = loginRes.body.data.token;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: testEmail } }).catch(() => {});
  await prisma.$disconnect().catch(() => {});
});

describe('POST /api/v1/farms', () => {
  it('creates a farm for the authenticated user', async () => {
    const res = await request(app)
      .post('/api/v1/farms')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Test Farm', latitude: 3.87, longitude: 11.52, size_ha: 2.5, soil_type: 'loamy' });
    expect(res.status).toBe(201);
    expect(res.body.data.farm.name).toBe('Test Farm');
    createdFarmId = res.body.data.farm.id;
  });

  it('returns 422 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/v1/farms')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Incomplete Farm' });
    expect(res.status).toBe(422);
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app).post('/api/v1/farms').send({ name: 'Farm' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/farms', () => {
  it('returns the list of farms for the user', async () => {
    const res = await request(app).get('/api/v1/farms').set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.farms)).toBe(true);
    expect(res.body.data.farms.length).toBeGreaterThan(0);
  });
});

describe('GET /api/v1/farms/:id', () => {
  it('returns a single farm by id', async () => {
    const res = await request(app).get(`/api/v1/farms/${createdFarmId}`).set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.farm.id).toBe(createdFarmId);
  });

  it('returns 404 for a non-existent farm', async () => {
    const res = await request(app).get('/api/v1/farms/00000000-0000-0000-0000-000000000000').set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/v1/farms/:id', () => {
  it('updates farm fields', async () => {
    const res = await request(app)
      .patch(`/api/v1/farms/${createdFarmId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Updated Farm', size_ha: 3.0 });
    expect(res.status).toBe(200);
    expect(res.body.data.farm.name).toBe('Updated Farm');
  });
});

describe('DELETE /api/v1/farms/:id', () => {
  it('deletes the farm', async () => {
    const res = await request(app).delete(`/api/v1/farms/${createdFarmId}`).set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Farm deleted');
  });
});
