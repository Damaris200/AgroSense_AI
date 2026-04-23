import { Router } from "express";
import { getFarmById } from "../services/farm.service";

const router = Router();

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