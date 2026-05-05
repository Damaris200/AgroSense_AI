import { Router } from 'express';
import { env } from '../config/env';
import { requireAuth } from '../middleware/jwt';

const router = Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const farmId = req.query.farmId as string | undefined;
    if (!farmId) {
      res.status(400).json({ success: false, error: 'farmId query param required' });
      return;
    }
    const url = `${env.weatherServiceUrl}/api/weather?farmId=${encodeURIComponent(farmId)}`;
    const upstream = await fetch(url);
    res.status(upstream.status).json(await upstream.json());
  } catch (err) {
    next(err);
  }
});

export default router;
