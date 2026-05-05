import { Router, type Request, type Response, type NextFunction } from 'express';
import { requireAuth } from '../middleware/jwt';
import { env } from '../config/env';

type HealthStatus = 'healthy' | 'degraded' | 'down';

const router = Router();

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.jwtUser) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }
  if (req.jwtUser.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Admin access required' });
    return;
  }
  next();
}

async function forwardJson(req: Request, path: string, baseUrl: string) {
  const url = `${baseUrl}${path}`;
  const init: RequestInit = {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': req.headers.authorization ?? '',
    },
  };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = JSON.stringify(req.body);
  }
  const resp = await fetch(url, init);
  const json = await resp.json() as unknown;
  return { status: resp.status, json };
}

async function fetchHealth(name: string, url: string): Promise<{ name: string; status: HealthStatus; note?: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);
  try {
    const resp = await fetch(`${url}/health`, { signal: controller.signal });
    if (!resp.ok) {
      return { name, status: 'degraded', note: `status ${resp.status}` };
    }
    return { name, status: 'healthy' };
  } catch (err) {
    const note = err instanceof Error ? err.message : 'unreachable';
    return { name, status: 'down', note };
  } finally {
    clearTimeout(timeout);
  }
}

// GET /api/admin/users
router.get('/users', requireAuth as any, requireAdmin, async (req, res, next) => {
  try {
    const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    const { status, json } = await forwardJson(req, `/api/auth/admin/users${query}`, env.authServiceUrl);
    res.status(status).json(json);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/users/:id/active
router.patch('/users/:id/active', requireAuth as any, requireAdmin, async (req, res, next) => {
  try {
    const { status, json } = await forwardJson(
      req,
      `/api/auth/admin/users/${encodeURIComponent(req.params.id)}/active`,
      env.authServiceUrl,
    );
    res.status(status).json(json);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/notifications
router.get('/notifications', requireAuth as any, requireAdmin, async (req, res, next) => {
  try {
    const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    const notificationsResp = await fetch(`${env.notificationSvcUrl}/api/admin/notifications${query}`);
    const notificationsJson = await notificationsResp.json() as { success?: boolean; data?: Array<{ userId: string; farmId: string; message: string; channel: string; sentAt: string; id: string }>; error?: string };

    if (!notificationsResp.ok || !notificationsJson.data) {
      res.status(notificationsResp.status).json(notificationsJson);
      return;
    }

    const userIds = Array.from(new Set(notificationsJson.data.map((n) => n.userId)));
    const usersResp = await fetch(`${env.authServiceUrl}/api/auth/admin/users?ids=${encodeURIComponent(userIds.join(','))}`, {
      headers: { 'Authorization': req.headers.authorization ?? '' },
    });
    const usersJson = await usersResp.json() as { success?: boolean; data?: { users?: Array<{ id: string; email: string; name: string }> }; error?: string };

    const users = usersJson.data?.users ?? [];
    const userMap = new Map(users.map((u) => [u.id, u] as const));

    const data = notificationsJson.data.map((notif) => {
      const user = userMap.get(notif.userId);
      return {
        id: notif.id,
        userId: notif.userId,
        farmId: notif.farmId,
        message: notif.message,
        channel: notif.channel,
        sentAt: notif.sentAt,
        recipient: user?.email ?? notif.userId,
        status: 'sent',
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/overview
router.get('/overview', requireAuth as any, requireAdmin, async (_req, res, next) => {
  try {
    const [
      userStatsResp,
      farmStatsResp,
      notificationStatsResp,
      analyticsStatsResp,
      recentEventsResp,
      health,
    ] = await Promise.all([
      fetch(`${env.authServiceUrl}/api/auth/admin/users/stats`, { headers: { Authorization: _req.headers.authorization ?? '' } }),
      fetch(`${env.farmServiceUrl}/api/farms/admin/stats`),
      fetch(`${env.notificationSvcUrl}/api/admin/notifications/stats`),
      fetch(`${env.analyticsServiceUrl}/api/admin/analytics/stats`),
      fetch(`${env.analyticsServiceUrl}/api/admin/analytics/recent?limit=5`),
      Promise.all([
        fetchHealth('API Gateway', 'http://localhost:4000'),
        fetchHealth('Auth Service', env.authServiceUrl),
        fetchHealth('Farm Service', env.farmServiceUrl),
        fetchHealth('Weather Service', env.weatherServiceUrl),
        fetchHealth('Soil Service', env.soilServiceUrl),
        fetchHealth('Orchestrator Service', 'http://localhost:4005'),
        fetchHealth('AI Service', env.aiServiceUrl),
        fetchHealth('Notification Service', env.notificationSvcUrl),
        fetchHealth('Analytics Service', env.analyticsServiceUrl),
      ]),
    ]);

    const userStatsJson = await userStatsResp.json();
    const farmStatsJson = await farmStatsResp.json();
    const notificationStatsJson = await notificationStatsResp.json();
    const analyticsStatsJson = await analyticsStatsResp.json();
    const recentEventsJson = await recentEventsResp.json();

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers: userStatsJson?.data?.stats?.totalUsers ?? 0,
          totalFarms: farmStatsJson?.data?.totalFarms ?? 0,
          notificationsSent: notificationStatsJson?.data?.totalNotifications ?? 0,
          eventsProcessed: analyticsStatsJson?.data?.totalEvents ?? 0,
        },
        services: health,
        recentEvents: recentEventsJson?.data ?? [],
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
