import { Kafka, Partitioners, logLevel } from "kafkajs";

const brokers = (process.env.KAFKA_BROKERS ?? "kafka:29092").split(",");

export const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID ?? "farm-service",
  brokers,
  logLevel: logLevel.ERROR,
});

export const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});

export const consumer = kafka.consumer({
  groupId: process.env.KAFKA_GROUP_ID ?? "farm-service-group",
});