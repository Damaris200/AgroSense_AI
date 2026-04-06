import type { Response } from 'express';
import * as farmService from '../services/farm.service';
import type { AuthRequest } from '../middleware/auth.middleware';
import { ok, created, notFound, fail } from '../utils/response';

export async function create(req: AuthRequest, res: Response) {
  try {
    const farm = await farmService.createFarm(req.user!.id, req.body);
    created(res, { farm });
  } catch (err: unknown) {
    fail(res, err instanceof Error ? err.message : 'Failed to create farm');
  }
}

export async function list(req: AuthRequest, res: Response) {
  try {
    const farms = await farmService.getFarmsByUser(req.user!.id);
    ok(res, { farms });
  } catch (err: unknown) {
    fail(res, err instanceof Error ? err.message : 'Failed to fetch farms', 500);
  }
}

export async function getOne(req: AuthRequest, res: Response) {
  try {
    const farm = await farmService.getFarmById(req.params.id!, req.user!.id);
    if (!farm) { notFound(res, 'Farm not found'); return; }
    ok(res, { farm });
  } catch (err: unknown) {
    fail(res, err instanceof Error ? err.message : 'Failed to fetch farm', 500);
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const farm = await farmService.updateFarm(req.params.id!, req.user!.id, req.body);
    if (!farm) { notFound(res, 'Farm not found'); return; }
    ok(res, { farm });
  } catch (err: unknown) {
    fail(res, err instanceof Error ? err.message : 'Failed to update farm');
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const deleted = await farmService.deleteFarm(req.params.id!, req.user!.id);
    if (!deleted) { notFound(res, 'Farm not found'); return; }
    ok(res, { message: 'Farm deleted' });
  } catch (err: unknown) {
    fail(res, err instanceof Error ? err.message : 'Failed to delete farm', 500);
  }
}
