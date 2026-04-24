import { config } from "dotenv";
config();

import { startOrchestratorConsumer } from "./events/consumers/orchestrator.consumer";

const PORT = process.env.PORT ?? 4005;

console.log(`[orchestrator-service] starting on port ${PORT}`);

startOrchestratorConsumer()
  .then(() => {
    console.log(`[orchestrator] listening on: farm.saved, weather.fetched, soil.analyzed`);
  })
  .catch((err) => {
    console.error(`[orchestrator] fatal startup error:`, err);
    process.exit(1);
  });