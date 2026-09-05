// Cach dung trong route: router.post("/", verifyToken, controllerFunction)

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization; // dang: "Bearer <token>"

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Thieu token - can dang nhap truoc (POST /api/auth/login)" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Token khong hop le hoac da het han" });
    }
}