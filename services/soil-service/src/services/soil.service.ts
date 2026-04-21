import { prisma } from '../config/prisma';
import type { FarmSavedEvent, SoilAnalyzedEvent } from '../models/soil.model';

interface SoilReading {
  ph:         number;
  moisture:   number;
  nitrogen:   number;
  phosphorus: number;
  potassium:  number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function randBetween(min: number, max: number): number {
  return round2(min + Math.random() * (max - min));
}

// Simulates realistic soil readings for a given crop type
export function simulateSoilData(_cropType: string): SoilReading {
  return {
    ph:         randBetween(5.5, 7.5),
    moisture:   randBetween(20, 80),
    nitrogen:   randBetween(50, 250),
    phosphorus: randBetween(10, 100),
    potassium:  randBetween(80, 350),
  };
}

export function buildSoilAnalyzedEvent(
  farmEvent: FarmSavedEvent,
  soilRecord: { id: string; ph: number; moisture: number; nitrogen: number; phosphorus: number; potassium: number; analyzedAt: Date },
): SoilAnalyzedEvent {
  return {
    submissionId: farmEvent.submissionId,
    farmId:       farmEvent.farmId,
    userId:       farmEvent.userId,
    soilDataId:   soilRecord.id,
    ph:           soilRecord.ph,
    moisture:     soilRecord.moisture,
    nitrogen:     soilRecord.nitrogen,
    phosphorus:   soilRecord.phosphorus,
    potassium:    soilRecord.potassium,
    analyzedAt:   soilRecord.analyzedAt.toISOString(),
  };
}

export async function processFarmSaved(event: FarmSavedEvent): Promise<SoilAnalyzedEvent> {
  const reading = simulateSoilData(event.cropType);

  const soilRecord = await prisma.soilData.create({
    data: {
      farmId:     event.farmId,
      ph:         reading.ph,
      moisture:   reading.moisture,
      nitrogen:   reading.nitrogen,
      phosphorus: reading.phosphorus,
      potassium:  reading.potassium,
    },
  });

  return buildSoilAnalyzedEvent(event, soilRecord);
}
