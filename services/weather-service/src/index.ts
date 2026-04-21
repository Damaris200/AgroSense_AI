import { env } from './config/env';
import { producer, consumer } from './config/kafka';
import { startFarmSavedConsumer } from './events/consumers/farm-saved.consumer';

async function main() {
  await producer.connect();
  await consumer.connect();

  await startFarmSavedConsumer();

  console.log(`[weather-service] running [${env.nodeEnv}] — consuming farm.saved`);
}

main().catch((err) => {
  console.error('[weather-service] fatal startup error:', err);
  process.exit(1);
});
