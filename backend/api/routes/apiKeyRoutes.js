import { Router } from "express";
import * as ApiKeyController from "../controllers/apiKeyController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = Router();

// Tat ca thao tac quan ly key deu can dang nhap admin (JWT) - khong dung API Key o day
router.get("/", verifyToken, ApiKeyController.listKeys);
router.post("/", verifyToken, ApiKeyController.createKey);
router.patch("/:id/revoke", verifyToken, ApiKeyController.revokeKey);
router.patch("/:id/unrevoke", verifyToken, ApiKeyController.unrevokeKey);
router.delete("/:id", verifyToken, ApiKeyController.deleteKey);

export default router;