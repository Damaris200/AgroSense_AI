import { prisma } from "../config/prisma";
import type { FarmSubmittedEvent, FarmSavedEvent } from "../models/farm.model";

export async function saveFarm(event: FarmSubmittedEvent): Promise<FarmSavedEvent> {
  const farm = await prisma.farm.create({
    data: {
      submissionId: event.submissionId,
      userId:       event.userId,
      cropType:     event.cropType,
      location:     event.location,
      gpsLat:       event.gpsLat,
      gpsLng:       event.gpsLng,
    },
  });

  return {
    submissionId: farm.submissionId,
    farmId:       farm.id,
    userId:       farm.userId,
    cropType:     farm.cropType,
    location:     farm.location,
    gpsLat:       farm.gpsLat,
    gpsLng:       farm.gpsLng,
    savedAt:      farm.createdAt.toISOString(),
  };
}

export async function getFarmById(id: string) {
  return prisma.farm.findUnique({ where: { id } });
}