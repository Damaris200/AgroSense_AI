import { producer } from "../../config/kafka";

let connected = false;

export async function publishAnalysisReady(payload: object): Promise<void> {
  if (!connected) {
    await producer.connect();
    connected = true;
  }
  await producer.send({
    topic: "analysis.ready",
    messages: [{ value: JSON.stringify(payload) }],
  });
  console.log(`[orchestrator] published analysis.ready:`, payload);
}