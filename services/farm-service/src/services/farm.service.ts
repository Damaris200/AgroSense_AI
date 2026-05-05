import { prisma } from "../config/prisma";
import type { FarmSubmittedEvent, FarmSavedEvent } from "../models/farm.model";

export async function saveFarm(event: FarmSubmittedEvent): Promise<FarmSavedEvent> {
  const farm = await prisma.farm.create({
    data: {
      submissionId: event.submissionId,
      userId:       event.userId,
      userEmail:    event.userEmail ?? "",
      userName:     event.userName  ?? "",
      name:         event.name      ?? "",
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
    userEmail:    farm.userEmail,
    userName:     farm.userName,
    name:         farm.name,
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

export async function getFarmsByUserId(userId: string) {
  return prisma.farm.findMany({
    where:   { userId },
    orderBy: { createdAt: "desc" },
    take:    100,
  });
}
