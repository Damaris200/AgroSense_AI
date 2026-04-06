import { prisma } from '../config/prisma';
import type { Farm } from '@prisma/client';
import type { CreateFarmDto, UpdateFarmDto } from '../models/farm.model';

export async function createFarm(userId: string, dto: CreateFarmDto): Promise<Farm> {
  return prisma.farm.create({
    data: {
      userId,
      name: dto.name,
      latitude: dto.latitude,
      longitude: dto.longitude,
      sizeHa: dto.size_ha,
      soilType: dto.soil_type ?? null,
    },
  });
}

export async function getFarmsByUser(userId: string): Promise<Farm[]> {
  return prisma.farm.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getFarmById(id: string, userId: string): Promise<Farm | null> {
  return prisma.farm.findFirst({ where: { id, userId } });
}

export async function updateFarm(id: string, userId: string, dto: UpdateFarmDto): Promise<Farm | null> {
  const farm = await prisma.farm.findFirst({ where: { id, userId } });
  if (!farm) return null;

  return prisma.farm.update({
    where: { id },
    data: {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.latitude !== undefined && { latitude: dto.latitude }),
      ...(dto.longitude !== undefined && { longitude: dto.longitude }),
      ...(dto.size_ha !== undefined && { sizeHa: dto.size_ha }),
      ...(dto.soil_type !== undefined && { soilType: dto.soil_type }),
    },
  });
}

export async function deleteFarm(id: string, userId: string): Promise<boolean> {
  const farm = await prisma.farm.findFirst({ where: { id, userId } });
  if (!farm) return false;
  await prisma.farm.delete({ where: { id } });
  return true;
}
