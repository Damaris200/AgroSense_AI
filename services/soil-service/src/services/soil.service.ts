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

// Maps farmer observations to realistic soil readings
export function deriveSoilData(color: string, texture: string, moisture: string): SoilReading {
  // Base pH by color
  const phBase: Record<string, number> = {
    red: 5.2, brown: 6.2, black: 6.8, grey: 6.0, yellow: 5.5,
  };
  // Nitrogen boosted by organic matter (black > brown > others)
  const nBase: Record<string, number> = {
    red: 60, brown: 120, black: 200, grey: 90, yellow: 70,
  };
  // Texture affects phosphorus and potassium retention
  const pBase: Record<string, number> = {
    sandy: 18, loamy: 55, clayey: 80, silty: 65,
  };
  const kBase: Record<string, number> = {
    sandy: 90, loamy: 180, clayey: 280, silty: 220,
  };
  // Moisture affects moisture% reading
  const moistureVal: Record<string, number> = {
    dry: 18, moist: 52, wet: 78,
  };
  // pH adjustment by texture
  const phTexAdj: Record<string, number> = {
    sandy: -0.3, loamy: 0, clayey: 0.2, silty: 0.1,
  };

  const c = color    ?? 'brown';
  const t = texture  ?? 'loamy';
  const m = moisture ?? 'moist';

  return {
    ph:         round2((phBase[c] ?? 6.2) + (phTexAdj[t] ?? 0)),
    moisture:   round2(moistureVal[m] ?? 52),
    nitrogen:   round2(nBase[c] ?? 120),
    phosphorus: round2(pBase[t] ?? 55),
    potassium:  round2(kBase[t] ?? 180),
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
    userEmail:    farmEvent.userEmail ?? '',
    userName:     farmEvent.userName  ?? '',
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
  const { prisma } = await import('../config/prisma');
  const reading = deriveSoilData(event.soilColor, event.soilTexture, event.soilMoisture);

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
