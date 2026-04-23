import { Kafka, Partitioners } from "kafkajs";

const kafka = new Kafka({
  clientId: "api-gateway",
  brokers: [process.env.KAFKA_BROKERS ?? "localhost:9092"],
});

const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});

let connected = false;

export async function getProducer() {
  if (!connected) {
    await producer.connect();
    connected = true;
    console.log("[api-gateway] Kafka producer connected");
  }
  return producer;
}

export async function publishEvent(topic: string, payload: object) {
  const p = await getProducer();
  await p.send({
    topic,
    messages: [{ value: JSON.stringify(payload) }],
  });
  console.log(`[api-gateway] published to ${topic}:`, payload);
}