import { Router, type Request, type Response, type NextFunction } from 'express';
import { requireAuth } from '../middleware/jwt';
import { env } from '../config/env';

const router = Router();

// GET /api/notifications — list notifications for the authenticated user
router.get('/', requireAuth as any, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.jwtUser!.sub;
    const url    = `${env.notificationSvcUrl}/api/notifications?userId=${encodeURIComponent(userId)}`;
    const resp   = await fetch(url, { headers: { 'x-user-id': userId } });
    const json   = await resp.json() as unknown;
    res.status(resp.status).json(json);
  } catch (err) {
    next(err);
  }
});

export default router;
