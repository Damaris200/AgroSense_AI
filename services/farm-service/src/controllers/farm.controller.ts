import type { Request, Response, NextFunction } from 'express';
import { getFarmById, getFarmsByUserId } from '../services/farm.service';

export async function listFarms(req: Request, res: Response, next: NextFunction) {
  try {
    const userId =
      (req.query.userId as string) ||
      (req.headers['x-user-id'] as string) ||
      'anonymous';
    const farms = await getFarmsByUserId(userId);
    res.json({ success: true, data: farms });
  } catch (err) {
    next(err);
  }
}

export async function getFarm(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      res.status(400).json({ success: false, error: 'Missing farm id' });
      return;
    }
    const farm = await getFarmById(id);
    if (!farm) {
      res.status(404).json({ success: false, error: 'Farm not found' });
      return;
    }
    res.json({ success: true, data: farm });
  } catch (err) {
    next(err);
  }
}
