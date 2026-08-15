import { Router } from "express";
import { listMapStations } from "../controllers/stationsController.js";

const router = Router();
router.get("/stations", listMapStations);

export default router;