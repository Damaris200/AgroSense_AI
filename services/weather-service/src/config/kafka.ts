import { Kafka, logLevel } from 'kafkajs';
import { env } from './env';

export const kafka = new Kafka({
  clientId: env.kafkaClientId,
  brokers:  env.kafkaBrokers,
  logLevel: env.nodeEnv === 'production' ? logLevel.WARN : logLevel.ERROR,
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({
  groupId:           env.kafkaGroupId,
  sessionTimeout:    30000,
  heartbeatInterval: 3000,
  rebalanceTimeout:  60000,
});
