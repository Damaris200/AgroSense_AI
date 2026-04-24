import { config } from "dotenv";
config();

import { startAnalysisReadyConsumer } from "./events/consumers/analysis-ready.consumer";

const PORT = process.env.PORT ?? 4006;

console.log(`[ai-service] starting on port ${PORT}`);

startAnalysisReadyConsumer()
  .then(() => {
    console.log(`[ai-service] listening on: analysis.ready`);
  })
  .catch((err: unknown) => {
    console.error(`[ai-service] fatal startup error:`, err);
    process.exit(1);
  });