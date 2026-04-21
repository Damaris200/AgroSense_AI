import { producer } from '../../config/kafka';
import type { WeatherFetchedEvent } from '../../models/weather.model';

const TOPIC = 'weather.fetched';

export async function publishWeatherFetched(event: WeatherFetchedEvent): Promise<void> {
  await producer.send({
    topic: TOPIC,
    messages: [
      {
        key:   event.farmId,
        value: JSON.stringify(event),
      },
    ],
  });
  console.log(`[weather-service] published ${TOPIC} for farmId=${event.farmId}`);
}
