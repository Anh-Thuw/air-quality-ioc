import { Router } from "express";
import * as ForecastController from "../controllers/forecastController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/latest", ForecastController.getLatest);
router.get("/station/:id", ForecastController.getStationForecast);
router.get("/history", ForecastController.getHistory);
router.get("/accuracy", ForecastController.getAccuracy);

// Chay du bao moi va ghi vao DB - can token
router.post("/predict", verifyToken, ForecastController.predict);

export default router;