// npm install jsonwebtoken bcryptjs
//node api/createAdminUser.js admin huy123@

import "dotenv/config";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";

const [, , username, password] = process.argv;

if (!username || !password) {
    console.error("Cach dung: node api/createAdminUser.js <username> <password>");
    process.exit(1);
}

(async () => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const { rows } = await pool.query(
            `INSERT INTO dashboard_users (username, password_hash, role)
       VALUES ($1, $2, 'admin')
       ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
       RETURNING id, username, role, created_at`,
            [username, passwordHash]
        );
        console.log("✅ Da tao/cap nhat tai khoan:", rows[0]);
    } catch (err) {
        console.error("Loi:", err.message);
    } finally {
        await pool.end();
    }
})();