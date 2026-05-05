import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "agrosense-test",
  brokers: ["localhost:9092"],
});

const TEST_TOPIC = "agrosense.test";
const TEST_MESSAGE = "hello from agrosense";

const RUN_INFRA_TESTS = process.env.RUN_INFRA_TESTS === "1";

async function runTest() {
  const producer = kafka.producer();
  const consumer = kafka.consumer({ groupId: "agrosense-test-group" });

  await producer.connect();
  await consumer.connect();

  await consumer.subscribe({ topic: TEST_TOPIC, fromBeginning: true });

  let received = "";

  await consumer.run({
    eachMessage: async ({ message }) => {
      received = message.value?.toString() ?? "";
    },
  });

  await producer.send({
    topic: TEST_TOPIC,
    messages: [{ value: TEST_MESSAGE }],
  });

  // Wait 3 seconds for the consumer to receive it
  await new Promise((r) => setTimeout(r, 3000));

  await producer.disconnect();
  await consumer.disconnect();

  if (received === TEST_MESSAGE) {
    console.log(" Kafka test passed — message received:", received);
    process.exit(0);
  } else {
    console.error(" Kafka test failed — nothing received");
    process.exit(1);
  }
}

if (!RUN_INFRA_TESTS) {
  console.log("Skipping Kafka infrastructure test; set RUN_INFRA_TESTS=1 to run it.");
} else {
  runTest().catch((err) => {
    console.error(" Kafka test error:", err.message);
    process.exit(1);
  });
}