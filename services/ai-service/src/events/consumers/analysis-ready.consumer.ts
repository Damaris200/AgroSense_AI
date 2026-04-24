import { consumer } from "../../config/kafka";
import { generateRecommendation } from "../../services/gemini.service";
import { publishRecommendation } from "../producers/recommendation.producer";
import { prisma } from "../../config/prisma";
import type { AnalysisReadyEvent } from "../../models/recommendation.model";

export async function startAnalysisReadyConsumer(): Promise<void> {
  await consumer.connect();
  await consumer.subscribe({ topic: "analysis.ready", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const raw = message.value?.toString();
      if (!raw) return;

      let data: AnalysisReadyEvent;
      try {
        data = JSON.parse(raw);
      } catch {
        console.error("[ai-service] malformed JSON on analysis.ready");
        return;
      }

      console.log(`[ai-service] received analysis.ready for submissionId=${data.submissionId}`);

      try {
        // Call Gemini
        const recommendation = await generateRecommendation({
          cropType: data.cropType,
          location: data.location,
          weather: data.weather,
          soil: data.soil,
        });

        // Save to ai_db
        await prisma.recommendation.create({
          data: {
            farmId: data.farmId,
            submissionId: data.submissionId,
            content: recommendation,
            model: "gemini-2.0-flash-lite",
          },
        });

        console.log(`[ai-service] saved recommendation for farmId=${data.farmId}`);

        // Publish downstream
        await publishRecommendation({
          submissionId: data.submissionId,
          farmId: data.farmId,
          cropType: data.cropType,
          location: data.location,
          recommendation,
          model: "gemini-1.5-flash",
          generatedAt: new Date().toISOString(),
        });

      } catch (err) {
        console.error("[ai-service] error processing analysis.ready:", err);
      }
    },
  });
}