import { Router } from 'express';
import * as ctrl from '../controllers/weather.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);
router.get('/farms/:farmId/weather', ctrl.getWeatherForFarm);
router.get('/farms/:farmId/weather/history', ctrl.getWeatherHistory);

export default router;
