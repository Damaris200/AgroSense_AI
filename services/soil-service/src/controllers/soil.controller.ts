import { prisma } from '../config/prisma';
import { ValidationError } from '../errors';
import { handleError } from '../middleware/error.middleware';

export async function listSoilRecords(req: Request): Promise<Response> {
  const farmId = new URL(req.url).searchParams.get('farmId');

  if (!farmId) {
    return handleError(new ValidationError('farmId query param required'));
  }

  try {
    const records = await prisma.soilData.findMany({
      where:   { farmId },
      orderBy: { analyzedAt: 'desc' },
      take:    10,
    });

    return Response.json({ success: true, data: records });
  } catch (err) {
    console.error('[soil-service] GET /api/soil error:', err);
    return handleError(err);
  }
}