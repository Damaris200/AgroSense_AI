/**
 * Unit tests for the validateBody middleware.
 *
 * A minimal Express app is created inline — no real gateway boot required.
 * Run: bun test tests/middleware/validate.test.ts
 */

import { describe, it, expect } from 'bun:test';
import express, { type Request, type Response } from 'express';
import request from 'supertest';
import { z } from 'zod';
import { validateBody } from '../../src/middleware/validate';

// ── Minimal test schema ───────────────────────────────────────────────────────

const testSchema = z
  .object({
    name: z.string().min(1, 'name is required'),
    age: z.number({ invalid_type_error: 'age must be a number' }),
  })
  .strict();

// ── Minimal Express app ───────────────────────────────────────────────────────

function buildApp() {
  const app = express();
  app.use(express.json());

  app.post('/test', validateBody(testSchema), (_req: Request, res: Response) => {
    res.status(200).json({ ok: true, data: _req.body });
  });

  return app;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('validateBody middleware', () => {
  const app = buildApp();

  it('passes a valid body through and calls next()', async () => {
    const res = await request(app)
      .post('/test')
      .send({ name: 'Alice', age: 30 })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toEqual({ name: 'Alice', age: 30 });
  });

  it('returns 400 when a required field is missing', async () => {
    const res = await request(app)
      .post('/test')
      .send({ name: 'Alice' })   // missing age
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ValidationError');
    expect(Array.isArray(res.body.details)).toBe(true);
    expect(res.body.details.length).toBeGreaterThan(0);
  });

  it('returns 400 when a field has the wrong type', async () => {
    const res = await request(app)
      .post('/test')
      .send({ name: 'Alice', age: 'not-a-number' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ValidationError');
    const ageError = res.body.details.find(
      (d: { path: string; message: string }) => d.path === 'age'
    );
    expect(ageError).toBeDefined();
    expect(typeof ageError.message).toBe('string');
  });

  it('returns 400 for unknown extra fields (.strict())', async () => {
    const res = await request(app)
      .post('/test')
      .send({ name: 'Alice', age: 30, extra: 'unwanted' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ValidationError');
  });

  it('returns 400 for an empty body', async () => {
    const res = await request(app)
      .post('/test')
      .send({})
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ValidationError');
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  it('does NOT call next() on validation failure (handler body is never reached)', async () => {
    const res = await request(app)
      .post('/test')
      .send({ name: 'Alice' }) // missing age
      .set('Content-Type', 'application/json');

    // If next() had been called, the handler would set ok:true
    expect(res.body.ok).toBeUndefined();
  });
});
