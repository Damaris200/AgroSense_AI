import { prisma } from '../config/prisma';
import type { Observation } from '@prisma/client';
import { publish } from '../events/publisher';
import { STREAMS } from '../events/types';
import type { CreateObservationDto } from '../models/observation.model';

export async function createObservation(userId: string, dto: CreateObservationDto): Promise<Observation> {
  const obs = await prisma.observation.create({
    data: {
      farmId: dto.farm_id,
      cropId: dto.crop_id ?? null,
      soilMoisture: dto.soil_moisture ?? null,
      temperatureC: dto.temperature_c ?? null,
      notes: dto.notes ?? null,
      observedAt: dto.observed_at ? new Date(dto.observed_at) : new Date(),
    },
  });

  // Publish to Redis Stream asynchronously — fire and forget
  publish(STREAMS.FARM_OBSERVATIONS, {
    type: 'farm.observation',
    farmId: obs.farmId,
    userId,
    soilMoisture: obs.soilMoisture ? Number(obs.soilMoisture) : undefined,
    timestamp: obs.observedAt.toISOString(),
  }).catch((err) => console.error('Failed to publish observation event:', err));

  return obs;
}

export async function getObservationsByFarm(farmId: string): Promise<Observation[]> {
  return prisma.observation.findMany({
    where: { farmId },
    orderBy: { observedAt: 'desc' },
    take: 100,
  });
}
