import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getSettings);
router.put("/", verifyToken, updateSettings);

export default router;