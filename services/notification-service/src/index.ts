import { env } from './config/env';
import { consumer } from './config/kafka';
import { startRecommendationGeneratedConsumer } from './events/consumers/recommendation-generated.consumer';

async function main() {
  await consumer.connect();

  await startRecommendationGeneratedConsumer();

  console.log(`[notification-service] running [${env.nodeEnv}] — consuming recommendation.generated`);
}

main().catch((err) => {
  console.error('[notification-service] fatal startup error:', err);
  process.exit(1);
});
