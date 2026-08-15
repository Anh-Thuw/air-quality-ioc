import { Router } from "express";
import * as ForecastController from "../controllers/forecastController.js";

const router = Router();
router.get("/latest", ForecastController.getLatest);
router.get("/station/:id", ForecastController.getStationForecast);
router.get("/history", ForecastController.getHistory);
router.get("/accuracy", ForecastController.getAccuracy);
router.post("/predict", ForecastController.predict);

export default router;