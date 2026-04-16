/**
 * Infrastructure test: verifies the PostgreSQL container is healthy
 * and all 7 service databases have been created by the init script.
 *
 * Prerequisites: `docker compose up -d postgres` must be healthy.
 * Credentials mirror docker-compose.yml (agrosense / agrosense_dev).
 */

import { Client } from 'pg';
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';

const REQUIRED_DATABASES = [
  'auth_db',
  'farm_db',
  'weather_db',
  'soil_db',
  'ai_db',
  'notification_db',
  'analytics_db',
];

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'agrosense',
  password: 'agrosense_dev',
  database: 'postgres',
});

describe('PostgreSQL infrastructure', () => {
  beforeAll(async () => {
    await client.connect();
  });

  afterAll(async () => {
    await client.end();
  });

  it('connects successfully to the postgres instance', async () => {
    const result = await client.query('SELECT 1 AS connected');
    expect(result.rows[0].connected).toBe(1);
  });

  it('has all 7 required service databases', async () => {
    const result = await client.query<{ datname: string }>(
      `SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname`
    );
    const existingDbs = result.rows.map((r) => r.datname);

    for (const db of REQUIRED_DATABASES) {
      expect(existingDbs).toContain(db);
    }
  });
});
