import { Router, type Request, type Response, type NextFunction } from 'express';
import { requireAuth } from '../middleware/jwt';
import { env } from '../config/env';

const router = Router();

function toTime(value: string | Date) {
  return new Date(value).getTime();
}

function buildRecentActivity(params: {
  farms: Array<{ id: string; name: string; cropType: string; location: string; createdAt: string }>;
  recommendations: Array<{ id: string; content: string; generatedAt: string }>;
  notifications: Array<{ id: string; message: string; channel: string; sentAt: string }>;
}) {
  const activity: Array<{ id: string; type: 'farm' | 'recommendation' | 'notification'; text: string; timestamp: string }> = [];

  for (const farm of params.farms) {
    const label = farm.name || farm.cropType || farm.location || 'Farm';
    activity.push({
      id: `farm-${farm.id}`,
      type: 'farm',
      text: `Farm "${label}" submitted for analysis.`,
      timestamp: farm.createdAt,
    });
  }

  for (const rec of params.recommendations) {
    const text = rec.content.length > 140 ? `${rec.content.slice(0, 140)}...` : rec.content;
    activity.push({
      id: `rec-${rec.id}`,
      type: 'recommendation',
      text,
      timestamp: rec.generatedAt,
    });
  }

  for (const notif of params.notifications) {
    activity.push({
      id: `notif-${notif.id}`,
      type: 'notification',
      text: `Notification sent via ${notif.channel}.`,
      timestamp: notif.sentAt,
    });
  }

  return activity
    .sort((a, b) => toTime(b.timestamp) - toTime(a.timestamp))
    .slice(0, 6);
}

// GET /api/overview — user dashboard aggregates
router.get('/', requireAuth as any, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.jwtUser!.sub;

    const [farmsResp, recsResp, notifResp] = await Promise.all([
      fetch(`${env.farmServiceUrl}/api/farms?userId=${encodeURIComponent(userId)}`, { headers: { 'x-user-id': userId } }),
      fetch(`${env.aiServiceUrl}/api/recommendations?userId=${encodeURIComponent(userId)}`, { headers: { 'x-user-id': userId } }),
      fetch(`${env.notificationSvcUrl}/api/notifications?userId=${encodeURIComponent(userId)}`, { headers: { 'x-user-id': userId } }),
    ]);

    const farmsJson = await farmsResp.json() as { data?: Array<{ id: string; name: string; cropType: string; location: string; createdAt: string }> };
    const recsJson = await recsResp.json() as { data?: Array<{ id: string; content: string; generatedAt: string }> };
    const notifJson = await notifResp.json() as { data?: Array<{ id: string; message: string; channel: string; sentAt: string }> };

    const farms = farmsJson.data ?? [];
    const recommendations = recsJson.data ?? [];
    const notifications = notifJson.data ?? [];

    const recentActivity = buildRecentActivity({ farms, recommendations, notifications });

    res.json({
      success: true,
      data: {
        stats: {
          farmsRegistered: farms.length,
          analysesRun: recommendations.length,
          recommendations: recommendations.length,
          notificationsSent: notifications.length,
        },
        recentActivity,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
