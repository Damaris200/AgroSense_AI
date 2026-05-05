import { Router, type Request, type Response, type NextFunction } from 'express';
import { validateBody } from '../middleware/validate';
import { farmSubmissionSchema } from '../schemas/farm.schema';
import { publishEvent } from '../kafka/producer';
import { optionalAuth, requireAuth } from '../middleware/jwt';
import { env } from '../config/env';

const router = Router();

// POST /api/farm  — submit a farm for analysis (Kafka)
router.post(
  '/',
  optionalAuth as any,
  validateBody(farmSubmissionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cropType, location, gpsLat, gpsLng, name } = req.body as {
        cropType: string; location: string; gpsLat: number; gpsLng: number; name?: string;
      };
      const user = req.jwtUser;

      const event = {
        submissionId: crypto.randomUUID(),
        userId:       user?.sub   ?? 'anonymous',
        userEmail:    user?.email ?? '',
        userName:     user?.name  ?? '',
        name:         name ?? '',
        cropType,
        location,
        gpsLat,
        gpsLng,
        submittedAt: new Date().toISOString(),
      };

      await publishEvent('farm.submitted', event);

      res.status(202).json({
        success:      true,
        message:      'Farm submission received and queued for processing',
        submissionId: event.submissionId,
      });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/farm  — list farms for the authenticated user (proxied to farm-service)
router.get('/', requireAuth as any, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.jwtUser!.sub;
    const url    = `${env.farmServiceUrl}/api/farms?userId=${encodeURIComponent(userId)}`;
    const resp   = await fetch(url, { headers: { 'x-user-id': userId } });
    const json   = await resp.json() as unknown;
    res.status(resp.status).json(json);
  } catch (err) {
    next(err);
  }
});

export default router;
