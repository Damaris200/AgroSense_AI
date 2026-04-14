import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT:         z.string().default('4001'),
  NODE_ENV:     z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET:   z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  CORS_ORIGIN:  z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  port:         parseInt(parsed.data.PORT, 10),
  nodeEnv:      parsed.data.NODE_ENV,
  databaseUrl:  parsed.data.DATABASE_URL,
  jwtSecret:    parsed.data.JWT_SECRET,
  jwtExpiresIn: parsed.data.JWT_EXPIRES_IN,
  corsOrigin:   parsed.data.CORS_ORIGIN,
} as const;
