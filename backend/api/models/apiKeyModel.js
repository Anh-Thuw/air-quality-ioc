import crypto from "crypto";
import pool from "../../config/db.js";

// Sinh key ngau nhien, an toan, dang: ak_live_<48 ky tu hex>
function generateKeyValue() {
    return "ak_live_" + crypto.randomBytes(24).toString("hex");
}

export async function createApiKey({ label, owner }) {
    const keyValue = generateKeyValue();
    const { rows } = await pool.query(
        `INSERT INTO api_keys (key_value, label, owner)
     VALUES ($1, $2, $3)
     RETURNING id, key_value, label, owner, is_revoked, created_at`,
        [keyValue, label || null, owner || null]
    );
    return rows[0];
}

export async function listApiKeys() {
    const { rows } = await pool.query(
        `SELECT id, key_value, label, owner, is_revoked, request_count, last_used_at, created_at
     FROM api_keys ORDER BY created_at DESC`
    );
    return rows;
}

export async function revokeApiKey(id) {
    const { rows } = await pool.query(
        `UPDATE api_keys SET is_revoked = true WHERE id = $1 RETURNING id, is_revoked`,
        [id]
    );
    return rows[0] || null;
}

export async function unrevokeApiKey(id) {
    const { rows } = await pool.query(
        `UPDATE api_keys SET is_revoked = false WHERE id = $1 RETURNING id, is_revoked`,
        [id]
    );
    return rows[0] || null;
}

export async function deleteApiKey(id) {
    const { rowCount } = await pool.query(`DELETE FROM api_keys WHERE id = $1`, [id]);
    return rowCount > 0;
}

// Kiem tra key co hop le khong (ton tai va chua bi thu hoi)
export async function validateApiKey(keyValue) {
    const { rows } = await pool.query(
        `SELECT id, label, owner, is_revoked FROM api_keys WHERE key_value = $1`,
        [keyValue]
    );
    const record = rows[0];
    if (!record || record.is_revoked) return null;
    return record;
}

// Ghi nhan luot goi (fire-and-forget, khong can await chan request)
export function touchApiKeyUsage(id) {
    pool
        .query(
            `UPDATE api_keys SET request_count = request_count + 1, last_used_at = NOW() WHERE id = $1`,
            [id]
        )
        .catch((err) => console.error("Loi cap nhat luot dung api_key:", err.message));
}