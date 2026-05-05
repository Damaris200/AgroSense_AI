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