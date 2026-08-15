import { Router } from "express";
import * as StationsController from "../controllers/stationsController.js";
import * as AQController from "../controllers/airQualityController.js";
import * as PollutionController from "../controllers/pollutionController.js";
import * as WeatherController from "../controllers/weatherController.js";
import * as ForecastController from "../controllers/forecastController.js";
import * as SystemController from "../controllers/systemController.js";

const router = Router();

router.get("/", StationsController.listStations);
router.post("/", StationsController.createStation);
router.get("/:id", StationsController.getStation);
router.put("/:id", StationsController.updateStation);
router.delete("/:id", StationsController.deleteStation);
router.get("/:id/overview", StationsController.getStationOverview);

router.get("/:id/air-quality/history", AQController.getStationHistory);
router.get("/:id/pollution/history", PollutionController.getStationHistory);
router.get("/:id/weather/history", WeatherController.getStationHistory);
router.get("/:id/logs", SystemController.stationLogs);

export default router;