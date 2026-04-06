import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from '../controllers/recommendation.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';

const router = Router();

const generateSchema = z.object({
  crop_type: z.string().optional(),
});

router.use(requireAuth);
router.post('/farms/:farmId/recommendations', validateBody(generateSchema), ctrl.generate);
router.get('/farms/:farmId/recommendations', ctrl.listByFarm);

export default router;
