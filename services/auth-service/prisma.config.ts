import { defineConfig } from 'prisma/config';

// Prisma CLI config (used by Prisma Development Kit / migrations).
// Keep this file minimal so it typechecks without extra runtime dependencies.
export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {},
});
