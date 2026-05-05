import { config } from 'dotenv';
config();

import { env } from './config/env';
import { producer, consumer } from './config/kafka';
import { startFarmSavedConsumer } from './events/consumers/farm-saved.consumer';
import { listWeatherRecords } from './controllers/weather.controller';

// ── Bun native HTTP server ─────────────────────────────────────────────────────
const server = Bun.serve({
  port: env.port,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', service: 'weather-service' });
    }

    if (url.pathname === '/api/weather' && req.method === 'GET') {
      return listWeatherRecords(req);
    }

    return new Response('Not Found', { status: 404 });
  },
});

console.log(`[weather-service] HTTP server running on port ${server.port}`);

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
