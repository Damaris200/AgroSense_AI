import { producer } from "../../config/kafka";
import type { FarmSavedEvent } from "../../models/farm.model";

let connected = false;

export async function publishFarmSaved(event: FarmSavedEvent): Promise<void> {
  if (!connected) {
    await producer.connect();
    connected = true;
  }

  await producer.send({
    topic: "farm.saved",
    messages: [{ value: JSON.stringify(event) }],
  });

  console.log(`[farm-service] published farm.saved for farmId=${event.farmId}`);
}