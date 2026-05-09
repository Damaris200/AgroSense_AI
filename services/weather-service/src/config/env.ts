import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT:             z.string().default('3003'),
  NODE_ENV:         z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL:     z.string().min(1, 'DATABASE_URL is required'),
  KAFKA_BROKERS:    z.string().default('localhost:9092'),
  KAFKA_CLIENT_ID:  z.string().default('weather-service'),
  KAFKA_GROUP_ID:   z.string().default('weather-service-group'),
  TOMORROW_API_KEY: z.string().min(1, 'TOMORROW_API_KEY is required'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  port:            parseInt(parsed.data.PORT, 10),
  nodeEnv:         parsed.data.NODE_ENV,
  databaseUrl:     parsed.data.DATABASE_URL,
  kafkaBrokers:    parsed.data.KAFKA_BROKERS.split(','),
  kafkaClientId:   parsed.data.KAFKA_CLIENT_ID,
  kafkaGroupId:    parsed.data.KAFKA_GROUP_ID,
  tomorrowApiKey:  parsed.data.TOMORROW_API_KEY,
} as const;
