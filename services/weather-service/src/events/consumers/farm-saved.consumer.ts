import { consumer } from '../../config/kafka';
import { farmSavedEventSchema } from '../../models/weather.model';
import { processFarmSaved } from '../../services/weather.service';
import { publishWeatherFetched } from '../producers/weather-fetched.producer';

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
        console.error(`[weather-service] malformed JSON on ${topic}[${partition}]`);
        return;
      }

      const result = farmSavedEventSchema.safeParse(parsed);
      if (!result.success) {
        console.error(`[weather-service] invalid ${TOPIC} schema:`, result.error.flatten());
        return;
      }

      try {
        const weatherFetchedEvent = await processFarmSaved(result.data);
        await publishWeatherFetched(weatherFetchedEvent);
      } catch (err) {
        console.error(`[weather-service] error processing ${TOPIC}:`, err);
      }
    },
  });
}
