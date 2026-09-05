import pool from "../../config/db.js";

export async function findUserByUsername(username) {
    const { rows } = await pool.query(
        `SELECT id, username, password_hash, role FROM dashboard_users WHERE username = $1`,
        [username]
    );
    return rows[0] || null;
}