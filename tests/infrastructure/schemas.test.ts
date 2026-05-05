/**
 * Infrastructure test: verifies all service databases have their
 * expected tables after Prisma migrations have been applied.
 *
 * Prerequisites:
 *   1. `docker compose up -d postgres` is healthy.
 *   2. Each service has run `prisma migrate deploy` against its DB.
 *
 * To run: bun test tests/infrastructure/schemas.test.ts
 */

import { Client } from 'pg';
import { describe, it, expect } from 'bun:test';


const PG_PORT = Number(process.env.PG_PORT ?? '5433');

const BASE_CONN = {
  host: 'localhost',
  port: PG_PORT,
  user: 'agrosense',
  password: 'agrosense_dev',
};

const RUN_INFRA_TESTS = process.env.RUN_INFRA_TESTS === '1';
const describeInfra = RUN_INFRA_TESTS ? describe : describe.skip;

async function getTablesInDb(database: string): Promise<string[]> {
  const client = new Client({ ...BASE_CONN, database });
  await client.connect();
  try {
    const res = await client.query<{ table_name: string }>(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public'
         AND table_type = 'BASE TABLE'
       ORDER BY table_name`
    );
    return res.rows.map((r) => r.table_name);
  } finally {
    await client.end();
  }
}

async function getColumnsInTable(database: string, table: string): Promise<string[]> {
  const client = new Client({ ...BASE_CONN, database });
  await client.connect();
  try {
    const res = await client.query<{ column_name: string }>(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name   = $1
       ORDER BY ordinal_position`,
      [table]
    );
    return res.rows.map((r) => r.column_name);
  } finally {
    await client.end();
  }
}

// ── auth_db ────────────────────────────────────────────────────────────────────
describeInfra('auth_db schema', () => {
  it('has a users table', async () => {
    const tables = await getTablesInDb('auth_db');
    expect(tables).toContain('users');
  });

  it('users table has required columns', async () => {
    const cols = await getColumnsInTable('auth_db', 'users');
    for (const col of ['id', 'name', 'email', 'password_hash', 'role', 'created_at']) {
      expect(cols).toContain(col);
    }
  });
});

// ── farm_db ────────────────────────────────────────────────────────────────────
describeInfra('farm_db schema', () => {
  it('has a farms table', async () => {
    const tables = await getTablesInDb('farm_db');
    expect(tables).toContain('farms');
  });

  it('farms table has required columns', async () => {
    const cols = await getColumnsInTable('farm_db', 'farms');
    for (const col of ['id', 'user_id', 'name', 'location', 'crop_type', 'gps_lat', 'gps_lng', 'created_at']) {
      expect(cols).toContain(col);
    }
  });
});

// ── weather_db ─────────────────────────────────────────────────────────────────
describeInfra('weather_db schema', () => {
  it('has a weather_data table', async () => {
    const tables = await getTablesInDb('weather_db');
    expect(tables).toContain('weather_data');
  });

  it('weather_data table has required columns', async () => {
    const cols = await getColumnsInTable('weather_db', 'weather_data');
    for (const col of ['id', 'farm_id', 'temperature', 'humidity', 'rainfall', 'wind_speed', 'description', 'fetched_at']) {
      expect(cols).toContain(col);
    }
  });
});

// ── soil_db ────────────────────────────────────────────────────────────────────
describeInfra('soil_db schema', () => {
  it('has a soil_data table', async () => {
    const tables = await getTablesInDb('soil_db');
    expect(tables).toContain('soil_data');
  });

  it('soil_data table has required columns', async () => {
    const cols = await getColumnsInTable('soil_db', 'soil_data');
    for (const col of ['id', 'farm_id', 'ph', 'moisture', 'nitrogen', 'phosphorus', 'potassium', 'analyzed_at']) {
      expect(cols).toContain(col);
    }
  });
});

// ── notification_db ────────────────────────────────────────────────────────────
describeInfra('notification_db schema', () => {
  it('has a notifications table', async () => {
    const tables = await getTablesInDb('notification_db');
    expect(tables).toContain('notifications');
  });

  it('notifications table has required columns', async () => {
    const cols = await getColumnsInTable('notification_db', 'notifications');
    for (const col of ['id', 'user_id', 'farm_id', 'message', 'channel', 'sent_at']) {
      expect(cols).toContain(col);
    }
  });
});

// ── ai_db ──────────────────────────────────────────────────────────────────────
describeInfra('ai_db schema', () => {
  it('has a recommendations table', async () => {
    const tables = await getTablesInDb('ai_db');
    expect(tables).toContain('recommendations');
  });

  it('recommendations table has required columns', async () => {
    const cols = await getColumnsInTable('ai_db', 'recommendations');
    for (const col of ['id', 'farm_id', 'submission_id', 'content', 'model', 'generated_at']) {
      expect(cols).toContain(col);
    }
  });
});

// ── analytics_db ───────────────────────────────────────────────────────────────
describeInfra('analytics_db schema', () => {
  it('has an event_logs table', async () => {
    const tables = await getTablesInDb('analytics_db');
    expect(tables).toContain('event_logs');
  });

  it('event_logs table has required columns', async () => {
    const cols = await getColumnsInTable('analytics_db', 'event_logs');
    for (const col of ['id', 'event_type', 'submission_id', 'payload_json', 'logged_at']) {
      expect(cols).toContain(col);
    }
  });
});
