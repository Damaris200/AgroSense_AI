import { consumer } from '../../config/kafka';
import { farmSavedEventSchema } from '../../models/soil.model';
import { processFarmSaved } from '../../services/soil.service';
import { publishSoilAnalyzed } from '../producers/soil-analyzed.producer';

const TOPIC = 'farm.saved';

export async function startFarmSavedConsumer(): Promise<void> {
  await consumer.subscribe({ topic: TOPIC, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const raw = message.value?.toString();
      if (!raw) return;

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        console.error(`[soil-service] malformed JSON on ${topic}[${partition}]`);
        return;
      }

      const result = farmSavedEventSchema.safeParse(parsed);
      if (!result.success) {
        console.error(`[soil-service] invalid ${TOPIC} schema:`, result.error.flatten());
        return;
      }

      try {
        const soilAnalyzedEvent = await processFarmSaved(result.data);
        await publishSoilAnalyzed(soilAnalyzedEvent);
      } catch (err) {
        console.error(`[soil-service] error processing ${TOPIC}:`, err);
      }
    },
  });
}
