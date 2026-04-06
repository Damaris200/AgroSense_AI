import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from '../controllers/farm.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';

const router = Router();

const createSchema = z.object({
  name: z.string().min(1).max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  size_ha: z.number().positive(),
  soil_type: z.string().optional(),
});

const updateSchema = createSchema.partial();

router.use(requireAuth);
router.post('/', validateBody(createSchema), ctrl.create);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.patch('/:id', validateBody(updateSchema), ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;
