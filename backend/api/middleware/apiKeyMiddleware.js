// Middleware bat buoc API Key cho cac request cong khai (nguoi ngoai goi vao).
// Khac voi JWT (verifyToken) danh cho admin - day la lop bao ve rieng cho nguoi duoc CHIA SE key.
//
// Cach nguoi dung goi: gan header "x-api-key: ak_live_xxxx" vao moi request.

import * as ApiKeyModel from "../models/apiKeyModel.js";

// Cac duong dan KHONG can API Key:
// - /api/health: kiem tra song/chet
// - /api/auth/login: dang nhap admin, dung JWT rieng
// - /api/admin/keys: quan ly key, da bao ve bang JWT (verifyToken) rieng
// - /api/settings: trang AdminDashboard goi bang JWT (khong gan x-api-key), PUT cung da co verifyToken rieng
const EXEMPT_PREFIXES = ["/api/health", "/api/auth/login", "/api/admin/keys", "/api/settings"];

// Bat/tat yeu cau API Key qua bien moi truong REQUIRE_API_KEY (true/false).
// Mac dinh la "false" (khong bat buoc) - de bat lai sau nay chi can doi .env, khong can sua code.
const REQUIRE_API_KEY = process.env.REQUIRE_API_KEY === "true";

export async function verifyApiKey(req, res, next) {
    if (!REQUIRE_API_KEY) return next(); // Dang tat - cho phep tat ca request di qua

    if (EXEMPT_PREFIXES.some((prefix) => req.path.startsWith(prefix))) {
        return next();
    }

    const apiKey = req.headers["x-api-key"];
    if (!apiKey) {
        return res.status(401).json({
            error: "Thieu API Key. Vui long gan header 'x-api-key' vao request. Lien he admin de duoc cap key.",
        });
    }

    try {
        const keyInfo = await ApiKeyModel.validateApiKey(apiKey);
        if (!keyInfo) {
            return res.status(401).json({ error: "API Key khong hop le hoac da bi thu hoi." });
        }

        req.apiKeyInfo = keyInfo; // gan thong tin key vao request, dung duoc o cac buoc sau neu can
        ApiKeyModel.touchApiKeyUsage(keyInfo.id); // ghi nhan luot goi, khong can cho ket qua

        next();
    } catch (err) {
        res.status(500).json({ error: "Loi kiem tra API Key: " + err.message });
    }
}