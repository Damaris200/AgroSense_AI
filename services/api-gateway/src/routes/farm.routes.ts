import { Router } from "express";
import { validateBody } from "../middleware/validate";
import { farmSubmissionSchema } from "../schemas/farm.schema";
import { publishEvent } from "../kafka/producer";

const router = Router();

router.post("/", validateBody(farmSubmissionSchema), async (req, res, next) => {
  try {
    const { cropType, location, gpsLat, gpsLng } = req.body;

    const event = {
      submissionId: crypto.randomUUID(),
      cropType,
      location,
      gpsLat,
      gpsLng,
      submittedAt: new Date().toISOString(),
    };

    await publishEvent("farm.submitted", event);

    res.status(202).json({
      success: true,
      message: "Farm submission received and queued for processing",
      submissionId: event.submissionId,
    });
  } catch (err) {
    next(err);
  }
});

export default router;