import { Router } from "express";
import * as SystemV1Controller from "../controllers/Systemv1controller.js";

const router = Router();
router.get("/overview", SystemV1Controller.overview);
router.get("/logs", SystemV1Controller.logs);
router.get("/logs/:id", SystemV1Controller.logById);
router.get("/stations/status", SystemV1Controller.stationsStatus);

export default router;