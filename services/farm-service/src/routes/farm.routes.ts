import { Router } from "express";
import { countFarms, getFarmById, getFarmsByUserId } from "../services/farm.service";

const router = Router();

// GET /api/farms?userId=<id>  — list all farms for a user
router.get("/", async (req, res, next) => {
  try {
    const userId =
      (req.query.userId as string) ||
      (req.headers["x-user-id"] as string) ||
      "anonymous";
    const farms = await getFarmsByUserId(userId);
    res.json({ success: true, data: farms });
  } catch (err) {
    next(err);
  }
});

// GET /api/farms/admin/stats — basic farm stats
router.get("/admin/stats", async (_req, res, next) => {
  try {
    const totalFarms = await countFarms();
    res.json({ success: true, data: { totalFarms } });
  } catch (err) {
    next(err);
  }
});

// GET /api/farms/:id  — get a single farm by id
router.get("/:id", async (req, res, next) => {
  try {
    const farm = await getFarmById(req.params.id);
    if (!farm) {
      res.status(404).json({ success: false, message: "Farm not found" });
      return;
    }
    res.json({ success: true, data: farm });
  } catch (err) {
    next(err);
  }
});

export default router;
