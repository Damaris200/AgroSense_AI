import { consumer } from "../../config/kafka";
import { farmSubmittedEventSchema } from "../../models/farm.model";
import { saveFarm } from "../../services/farm.service";
import { publishFarmSaved } from "../producers/farm-saved.producer";

const TOPIC = "farm.submitted";

export async function startFarmSubmittedConsumer(): Promise<void> {
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const raw = message.value?.toString();
      if (!raw) return;

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        console.error(`[farm-service] malformed JSON on ${topic}[${partition}]`);
        return;
      }

      const result = farmSubmittedEventSchema.safeParse(parsed);
      if (!result.success) {
        console.error(`[farm-service] invalid ${TOPIC} schema:`, result.error.flatten());
        return;
      }

      try {
        const farmSavedEvent = await saveFarm(result.data);
        await publishFarmSaved(farmSavedEvent);
      } catch (err) {
        console.error(`[farm-service] error processing ${TOPIC}:`, err);
      }
    },
  });
}