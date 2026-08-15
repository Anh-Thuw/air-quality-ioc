import { Router } from "express";
import { getLatest } from "../controllers/pollutionController.js";

const router = Router();
router.get("/latest", getLatest);

export default router;