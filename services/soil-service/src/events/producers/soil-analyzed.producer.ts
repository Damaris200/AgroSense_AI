import { producer } from '../../config/kafka';
import type { SoilAnalyzedEvent } from '../../models/soil.model';

const TOPIC = 'soil.analyzed';

export async function publishSoilAnalyzed(event: SoilAnalyzedEvent): Promise<void> {
  await producer.send({
    topic: TOPIC,
    messages: [
      {
        key:   event.farmId,
        value: JSON.stringify(event),
      },
    ],
  });
  console.log(`[soil-service] published ${TOPIC} for farmId=${event.farmId}`);
}
