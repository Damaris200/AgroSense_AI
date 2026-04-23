import { consumer } from '../../config/kafka';
import { recommendationGeneratedEventSchema } from '../../models/notification.model';
import { processRecommendation } from '../../services/notification.service';

const TOPIC = 'recommendation.generated';

export async function startRecommendationGeneratedConsumer(): Promise<void> {
  await consumer.subscribe({ topic: TOPIC, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const raw = message.value?.toString();
      if (!raw) return;

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        console.error(`[notification-service] malformed JSON on ${topic}[${partition}]`);
        return;
      }

      const result = recommendationGeneratedEventSchema.safeParse(parsed);
      if (!result.success) {
        console.error(`[notification-service] invalid ${TOPIC} schema:`, result.error.flatten());
        return;
      }

      try {
        await processRecommendation(result.data);
      } catch (err) {
        console.error(`[notification-service] error processing ${TOPIC}:`, err);
      }
    },
  });
}
