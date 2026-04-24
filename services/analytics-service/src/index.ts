import { config } from "dotenv";
config();

import { startAnalyticsConsumer } from "./events/consumers/analytics.consumer";

const PORT = process.env.PORT ?? 4007;

console.log(`[analytics-service] starting on port ${PORT}`);

startAnalyticsConsumer()
  .then(() => {
    console.log(`[analytics] listening on: ${[
      "farm.submitted",
      "farm.saved", 
      "analysis.ready",
      "recommendation.generated"
    ].join(", ")}`);
  })
  .catch((err: unknown) => {
    console.error(`[analytics] fatal startup error:`, err);
    process.exit(1);
  });