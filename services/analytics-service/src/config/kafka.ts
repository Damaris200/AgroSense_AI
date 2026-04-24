import { Kafka, Partitioners, logLevel } from "kafkajs";

const brokers = (process.env.KAFKA_BROKERS ?? "localhost:9092").split(",");

export const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID ?? "analytics-service",
  brokers,
  logLevel: logLevel.ERROR,
  retry: { initialRetryTime: 300, retries: 10 },
});

export const consumer = kafka.consumer({
  groupId: process.env.KAFKA_GROUP_ID ?? "analytics-service-group",
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
});