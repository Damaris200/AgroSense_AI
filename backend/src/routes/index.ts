import { Router } from 'express';
import authRoutes from './auth.routes';
import farmRoutes from './farm.routes';
import observationRoutes from './observation.routes';
import weatherRoutes from './weather.routes';
import recommendationRoutes from './recommendation.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/farms', farmRoutes);
router.use('/observations', observationRoutes);
router.use('/', weatherRoutes);
router.use('/', recommendationRoutes);

export default router;
