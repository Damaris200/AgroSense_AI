import type { Response } from 'express';
import * as weatherService from '../services/weather.service';
import * as farmService from '../services/farm.service';
import type { AuthRequest } from '../middleware/auth.middleware';
import { ok, fail, notFound } from '../utils/response';

export async function getWeatherForFarm(req: AuthRequest, res: Response) {
  try {
    const farm = await farmService.getFarmById(req.params.farmId!, req.user!.id);
    if (!farm) { notFound(res, 'Farm not found'); return; }

    const weather = await weatherService.fetchAndSaveWeather(farm.id, farm.latitude, farm.longitude);
    ok(res, { weather });
  } catch (err: unknown) {
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    fail(res, err instanceof Error ? err.message : 'Failed to fetch weather', status);
  }
}

export async function getWeatherHistory(req: AuthRequest, res: Response) {
  try {
    const farm = await farmService.getFarmById(req.params.farmId!, req.user!.id);
    if (!farm) { notFound(res, 'Farm not found'); return; }

    const history = await weatherService.getWeatherHistory(farm.id);
    ok(res, { history });
  } catch (err: unknown) {
    fail(res, err instanceof Error ? err.message : 'Failed to fetch weather history', 500);
  }
}
