import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT:            z.string().default('3006'),
  NODE_ENV:        z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL:    z.string().min(1, 'DATABASE_URL is required'),
  KAFKA_BROKERS:   z.string().default('localhost:9092'),
  KAFKA_CLIENT_ID: z.string().default('notification-service'),
  KAFKA_GROUP_ID:  z.string().default('notification-service-group'),
  SMTP_HOST:       z.string().default('smtp.ethereal.email'),
  SMTP_PORT:       z.string().default('587'),
  SMTP_USER:       z.string().min(1, 'SMTP_USER is required'),
  SMTP_PASS:       z.string().min(1, 'SMTP_PASS is required'),
  SMTP_FROM:       z.string().default('AgroSense AI <noreply@agrosense.ai>'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  port:          parseInt(parsed.data.PORT, 10),
  nodeEnv:       parsed.data.NODE_ENV,
  databaseUrl:   parsed.data.DATABASE_URL,
  kafkaBrokers:  parsed.data.KAFKA_BROKERS.split(','),
  kafkaClientId: parsed.data.KAFKA_CLIENT_ID,
  kafkaGroupId:  parsed.data.KAFKA_GROUP_ID,
  smtp: {
    host: parsed.data.SMTP_HOST,
    port: parseInt(parsed.data.SMTP_PORT, 10),
    user: parsed.data.SMTP_USER,
    pass: parsed.data.SMTP_PASS,
    from: parsed.data.SMTP_FROM,
  },
} as const;
