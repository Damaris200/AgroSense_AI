import { env } from './config/env';
import { consumer } from './config/kafka';
import { startRecommendationGeneratedConsumer } from './events/consumers/recommendation-generated.consumer';
import { listNotifications } from './controllers/notification.controller';

// ── Bun native HTTP server — no express dependency required ────────────────────
const server = Bun.serve({
  port: env.port,
  async fetch(req: Request) {
    const url = new URL(req.url);

    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', service: 'notification-service' });
    }

    if (url.pathname === '/api/notifications' && req.method === 'GET') {
      return listNotifications(req);
    }

    return new Response('Not Found', { status: 404 });
  },
});

console.log(`[notification-service] HTTP server running on port ${server.port}`);

async function main() {
  await consumer.connect();
  await startRecommendationGeneratedConsumer();
  console.log(`[notification-service] running [${env.nodeEnv}] — consuming recommendation.generated`);
}

main().catch((err) => {
  console.error('[notification-service] fatal startup error:', err);
  process.exit(1);
});
