import { Kafka } from 'kafkajs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const kafka = new Kafka({ brokers: (process.env.KAFKA_BROKERS ?? 'kafka:29092').split(',') });
const soilConsumer = kafka.consumer({ groupId: 'farm-service-soil-group' });

export async function startSoilAnalyzedConsumer(): Promise<void> {
  await soilConsumer.connect();
  await soilConsumer.subscribe({ topic: 'soil.analyzed', fromBeginning: false });
  await soilConsumer.run({
    eachMessage: async ({ message }) => {
      const raw = message.value?.toString();
      if (!raw) return;
      try {
        const data = JSON.parse(raw);
        const farmId = data.farmId ?? data.farm_id;
        if (!farmId) return;
        await prisma.farm.update({
          where: { id: farmId },
          data: { status: 'completed' },
        });
        console.log(`[farm-service] marked farm ${farmId} as completed`);
      } catch (err) {
        console.error('[farm-service] error processing soil.analyzed:', err);
      }
    },
  });
}
