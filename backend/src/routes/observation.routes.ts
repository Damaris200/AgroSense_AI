import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from '../controllers/observation.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';

const router = Router({ mergeParams: true });

const createSchema = z.object({
  farm_id: z.string().uuid(),
  crop_id: z.string().uuid().optional(),
  soil_moisture: z.number().min(0).max(100).optional(),
  temperature_c: z.number().optional(),
  notes: z.string().max(1000).optional(),
  observed_at: z.string().datetime().optional(),
});

router.use(requireAuth);
router.post('/', validateBody(createSchema), ctrl.create);
router.get('/farms/:farmId/observations', ctrl.listByFarm);

export default router;
