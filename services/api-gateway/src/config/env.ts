import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT:        z.string().default('4000'),
  NODE_ENV:    z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_SECRET:  z.string().min(1, 'JWT_SECRET is required'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  port:                parseInt(parsed.data.PORT, 10),
  nodeEnv:             parsed.data.NODE_ENV,
  corsOrigin:          parsed.data.CORS_ORIGIN,
  jwtSecret:           parsed.data.JWT_SECRET,
  authServiceUrl:      process.env.AUTH_SERVICE_URL         ?? 'http://localhost:4001',
  farmServiceUrl:      process.env.FARM_SERVICE_URL         ?? 'http://localhost:4002',
  weatherServiceUrl:   process.env.WEATHER_SERVICE_URL      ?? 'http://localhost:3003',
  soilServiceUrl:      process.env.SOIL_SERVICE_URL         ?? 'http://localhost:3004',
  aiServiceUrl:        process.env.AI_SERVICE_URL           ?? 'http://localhost:4006',
  notificationSvcUrl:  process.env.NOTIFICATION_SERVICE_URL ?? 'http://localhost:3006',
} as const;
