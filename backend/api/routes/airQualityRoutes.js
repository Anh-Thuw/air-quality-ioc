import { Router } from "express";
import * as AQController from "../controllers/airQualityController.js";

const router = Router();
router.get("/latest", AQController.getLatest);
router.get("/history", AQController.getHistory);
router.get("/statistics", AQController.getStatistics);
router.get("/ranking", AQController.getRanking);

export default router;