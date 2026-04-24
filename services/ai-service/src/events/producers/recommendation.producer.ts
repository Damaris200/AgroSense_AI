import { producer } from "../../config/kafka";
import type { RecommendationGeneratedEvent } from "../../models/recommendation.model";

let connected = false;

export async function publishRecommendation(
  payload: RecommendationGeneratedEvent
): Promise<void> {
  if (!connected) {
    await producer.connect();
    connected = true;
  }
  await producer.send({
    topic: "recommendation.generated",
    messages: [{ value: JSON.stringify(payload) }],
  });
  console.log(`[ai-service] published recommendation.generated for farmId=${payload.farmId}`);
}