import type { Response } from 'express';
import * as recService from '../services/recommendation.service';
import * as weatherService from '../services/weather.service';
import * as farmService from '../services/farm.service';
import type { AuthRequest } from '../middleware/auth.middleware';
import { ok, created, fail, notFound } from '../utils/response';

export async function generate(req: AuthRequest, res: Response) {
  try {
    const farm = await farmService.getFarmById(req.params.farmId!, req.user!.id);
    if (!farm) { notFound(res, 'Farm not found'); return; }

    const weather = await weatherService.getCurrentWeather(farm.latitude, farm.longitude);
    const recommendation = await recService.generateRecommendation(
      farm.id,
      req.user!.id,
      weather,
      req.body.crop_type as string | undefined,
      req.body.observation_id as string | undefined,
    );
    created(res, { recommendation });
  } catch (err: unknown) {
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    fail(res, err instanceof Error ? err.message : 'Failed to generate recommendation', status);
  }
}

export async function listByFarm(req: AuthRequest, res: Response) {
  try {
    const recommendations = await recService.getRecommendationsByFarm(req.params.farmId!);
    ok(res, { recommendations });
  } catch (err: unknown) {
    fail(res, err instanceof Error ? err.message : 'Failed to fetch recommendations', 500);
  }
}
