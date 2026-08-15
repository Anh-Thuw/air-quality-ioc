import { Router } from "express";
import * as SystemController from "../controllers/systemController.js";

const router = Router();
router.get("/health", SystemController.health);
router.get("/system/status", SystemController.status);
router.get("/system/metrics", SystemController.metrics);
router.get("/system/logs", SystemController.logs);

export default router;