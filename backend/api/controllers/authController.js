import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import * as AuthModel from "../models/authModel.js";

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRES_IN = "8h"; // token het han sau 8 tieng, can dang nhap lai

export async function login(req, res) {
    try {
        if (!JWT_SECRET) {
            return res.status(500).json({ error: "Server chua cau hinh JWT_SECRET" });
        }

        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Thieu username hoac password" });
        }

        const user = await AuthModel.findUserByUsername(username);
        if (!user) return res.status(401).json({ error: "Sai username hoac password" });

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) return res.status(401).json({ error: "Sai username hoac password" });

        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRES_IN }
        );

        res.json({
            token,
            expiresIn: TOKEN_EXPIRES_IN,
            user: { id: user.id, username: user.username, role: user.role },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}