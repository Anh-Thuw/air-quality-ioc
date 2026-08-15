import { Router } from "express";
import * as WeatherController from "../controllers/weatherController.js";

const router = Router();
router.get("/latest", WeatherController.getLatest);
router.get("/station/:id/latest", WeatherController.getStationLatest);
router.get("/history", WeatherController.getHistory);
router.get("/statistics", WeatherController.getStatistics);

export default router;