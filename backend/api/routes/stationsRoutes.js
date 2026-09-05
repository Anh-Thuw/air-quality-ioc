import { Router } from "express";
import * as StationsController from "../controllers/stationsController.js";
import * as AQController from "../controllers/airQualityController.js";
import * as PollutionController from "../controllers/pollutionController.js";
import * as WeatherController from "../controllers/weatherController.js";
import * as SystemController from "../controllers/systemController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = Router();

// Doc du lieu - khong can token
router.get("/", StationsController.listStations);
router.get("/:id", StationsController.getStation);
router.get("/:id/overview", StationsController.getStationOverview);
router.get("/:id/air-quality/history", AQController.getStationHistory);
router.get("/:id/pollution/history", PollutionController.getStationHistory);
router.get("/:id/weather/history", WeatherController.getStationHistory);
router.get("/:id/logs", SystemController.stationLogs);

// Ghi/sua/xoa du lieu - BAT BUOC co token hop le (dang nhap qua POST /api/auth/login)
router.post("/", verifyToken, StationsController.createStation);
router.put("/:id", verifyToken, StationsController.updateStation);
router.delete("/:id", verifyToken, StationsController.deleteStation);

export default router;