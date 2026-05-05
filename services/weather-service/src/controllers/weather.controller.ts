import { prisma } from '../config/prisma';
import { ValidationError } from '../errors';
import { handleError } from '../middleware/error.middleware';

export async function listWeatherRecords(req: Request): Promise<Response> {
  const farmId = new URL(req.url).searchParams.get('farmId');

  if (!farmId) {
    return handleError(new ValidationError('farmId query param required'));
  }

  try {
    const records = await prisma.weatherData.findMany({
      where:   { farmId },
      orderBy: { fetchedAt: 'desc' },
      take:    10,
    });

    return Response.json({ success: true, data: records });
  } catch (err) {
    console.error('[weather-service] GET /api/weather error:', err);
    return handleError(err);
  }
}