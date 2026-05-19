// Runs before all test files via bunfig.toml preload.
// Sets required env vars before env.ts parses process.env.
process.env.JWT_SECRET = 'test-secret-key-for-unit-tests-only-32ch';
process.env.NODE_ENV = 'test';
