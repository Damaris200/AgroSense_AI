// Runs before all test files via bunfig.toml preload.
// Sets required env vars before env.ts parses process.env.
process.env.JWT_SECRET = 'test-secret-key-for-auth-unit-tests-only!!';
process.env.DATABASE_URL = 'postgresql://agrosense:agrosense_dev@localhost:5433/auth_db';
process.env.NODE_ENV = 'test';
