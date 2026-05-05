import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../services/auth.service';

const router = Router();

router.post('/register', validateBody(registerSchema), ctrl.register);
router.post('/login',    validateBody(loginSchema),    ctrl.login);
router.get('/me',        requireAuth,                  ctrl.me);
router.put('/profile',   requireAuth,                  ctrl.updateProfile);

export default router;
