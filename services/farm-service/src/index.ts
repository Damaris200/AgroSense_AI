import { config } from 'dotenv';
config();

import express from "express";
import farmRoutes from "./routes/farm.routes";
import { startFarmSubmittedConsumer } from "./events/consumers/farm-submitted.consumer";

const app = express();
app.use(express.json());
app.use("/api/farms", farmRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "farm-service" });
});

const PORT = process.env.PORT ?? 4002;

app.listen(PORT, async () => {
  console.log(`[farm-service] running on port ${PORT}`);
  await startFarmSubmittedConsumer();
  console.log(`[farm-service] listening for farm.submitted events`);
});