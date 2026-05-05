import { config } from 'dotenv';
config();

import { startAnalysisReadyConsumer } from './events/consumers/analysis-ready.consumer';
import { prisma } from './config/prisma';

const PORT = Number(process.env.PORT ?? 4006);

// ── Bun native HTTP server — no express dependency required ────────────────────
const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', service: 'ai-service' });
    }

    if (url.pathname === '/api/recommendations' && req.method === 'GET') {
      const userId = url.searchParams.get('userId')
        ?? req.headers.get('x-user-id')
        ?? 'anonymous';
      try {
        const recommendations = await prisma.recommendation.findMany({
          where:   { userId },
          orderBy: { generatedAt: 'desc' },
          take:    50,
        });
        return Response.json({ success: true, data: recommendations });
      } catch (err) {
        console.error('[ai-service] GET /api/recommendations error:', err);
        return Response.json(
          { success: false, error: 'Failed to fetch recommendations' },
          { status: 500 },
        );
      }
    }

    return new Response('Not Found', { status: 404 });
  },
});

console.log(`[ai-service] HTTP server running on port ${server.port}`);

startAnalysisReadyConsumer()
  .then(() => console.log('[ai-service] Kafka consumer started — listening on: analysis.ready'))
  .catch((err: unknown) => {
    console.error('[ai-service] Kafka consumer startup error:', err);
  });
