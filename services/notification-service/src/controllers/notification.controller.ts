import { prisma } from '../config/prisma';
import { handleError } from '../middleware/error.middleware';

export async function listNotifications(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId')
    ?? req.headers.get('x-user-id')
    ?? 'anonymous';

  try {
    const notifications = await prisma.notification.findMany({
      where:   { userId },
      orderBy: { sentAt: 'desc' },
      take:    50,
    });

    return Response.json({ success: true, data: notifications });
  } catch (err) {
    console.error('[notification-service] GET /api/notifications error:', err);
    return handleError(err);
  }
}

export async function listAllNotifications(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get('limit') ?? 100);

  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { sentAt: 'desc' },
      take: limit,
    });
    return Response.json({ success: true, data: notifications });
  } catch (err) {
    console.error('[notification-service] GET /api/admin/notifications error:', err);
    return handleError(err);
  }
}

export async function getNotificationStats(): Promise<Response> {
  try {
    const totalNotifications = await prisma.notification.count();
    return Response.json({ success: true, data: { totalNotifications } });
  } catch (err) {
    console.error('[notification-service] GET /api/admin/notifications/stats error:', err);
    return handleError(err);
  }
}