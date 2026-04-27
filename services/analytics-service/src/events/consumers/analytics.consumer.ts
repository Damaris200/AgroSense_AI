import { consumer } from "../../config/kafka";
import { prisma } from "../../config/prisma";

const TOPICS = [
  "farm.submitted",
  "farm.saved",
  "analysis.ready",
  "recommendation.generated",
];

export async function startAnalyticsConsumer(): Promise<void> {
  await consumer.connect();
  await consumer.subscribe({ topics: TOPICS, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const raw = message.value?.toString();
      if (!raw) return;

      let payload: any;
      try {
        payload = JSON.parse(raw);
      } catch {
        console.error(`[analytics] malformed JSON on ${topic}`);
        return;
      }

      try {
        await prisma.eventLog.create({
          data: {
            eventType: topic,
            submissionId: payload.submissionId ?? "unknown",
            payloadJson: payload,
          },
        });
        console.log(`[analytics] logged event: ${topic} for submissionId=${payload.submissionId ?? "unknown"}`);
      } catch (err) {
        console.error(`[analytics] failed to log event ${topic}:`, err);
      }
    },
  });
}