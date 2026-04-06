import type { Response } from 'express';
import * as obsService from '../services/observation.service';
import type { AuthRequest } from '../middleware/auth.middleware';
import { ok, created, fail } from '../utils/response';

export async function create(req: AuthRequest, res: Response) {
  try {
    const observation = await obsService.createObservation(req.user!.id, req.body);
    created(res, { observation });
  } catch (err: unknown) {
    fail(res, err instanceof Error ? err.message : 'Failed to create observation');
  }
}

export async function listByFarm(req: AuthRequest, res: Response) {
  try {
    const observations = await obsService.getObservationsByFarm(req.params.farmId!);
    ok(res, { observations });
  } catch (err: unknown) {
    fail(res, err instanceof Error ? err.message : 'Failed to fetch observations', 500);
  }
}
