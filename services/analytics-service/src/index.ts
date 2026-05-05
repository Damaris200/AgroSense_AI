import { config } from "dotenv";
config();

import { startAnalyticsConsumer } from "./events/consumers/analytics.consumer";
import { getRecentEvents, getEventStats } from "./services/analytics.service";

const PORT = Number(process.env.PORT ?? 4007);

// ── Bun native HTTP server ────────────────────────────────────────────────────
const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', service: 'analytics-service' });
    }

    if (url.pathname === '/api/admin/analytics/recent' && req.method === 'GET') {
      const limit = Number(url.searchParams.get('limit') ?? 20);
      try {
        const events = await getRecentEvents(limit);
        return Response.json({ success: true, data: events });
      } catch (err) {
        console.error('[analytics-service] GET /api/admin/analytics/recent error:', err);
        return Response.json({ success: false, error: 'Failed to fetch events' }, { status: 500 });
      }
    }

    if (url.pathname === '/api/admin/analytics/stats' && req.method === 'GET') {
      try {
        const stats = await getEventStats();
        return Response.json({ success: true, data: stats });
      } catch (err) {
        console.error('[analytics-service] GET /api/admin/analytics/stats error:', err);
        return Response.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
});

console.log(`[analytics-service] HTTP server running on port ${server.port}`);

startAnalyticsConsumer()
  .then(() => {
    console.log(`[analytics] listening on: farm.submitted, farm.saved, analysis.ready, recommendation.generated`);
  })
  .catch((err: unknown) => {
    console.error(`[analytics] fatal startup error:`, err);
    process.exit(1);
  });
