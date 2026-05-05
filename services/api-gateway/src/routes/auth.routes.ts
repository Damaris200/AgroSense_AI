import { Router, type Request, type Response, type NextFunction } from 'express';
import { env } from '../config/env';

const router = Router();

async function forward(
  req: Request,
  res: Response,
  next: NextFunction,
  path: string,
) {
  try {
    const url  = `${env.authServiceUrl}${path}`;
    const init: RequestInit = {
      method:  req.method,
      headers: {
        'Content-Type':  'application/json',
        'Authorization': req.headers.authorization ?? '',
      },
    };
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      init.body = JSON.stringify(req.body);
    }
    const resp = await fetch(url, init);
    const json = await resp.json() as unknown;
    res.status(resp.status).json(json);
  } catch (err) {
    next(err);
  }
}

router.post('/register', (req, res, next) => forward(req, res, next, '/api/auth/register'));
router.post('/login',    (req, res, next) => forward(req, res, next, '/api/auth/login'));
router.get('/me',        (req, res, next) => forward(req, res, next, '/api/auth/me'));
router.put('/profile',   (req, res, next) => forward(req, res, next, '/api/auth/profile'));

export default router;
