import pool from "../../config/db.js";
import os from "os";

let requestCount = 0;
export function incrementRequestCount() { requestCount++; }
export function getRequestCount() { return requestCount; }

export async function checkDatabaseHealth() {
    try {
        await pool.query("SELECT 1");
        return "healthy";
    } catch {
        return "unhealthy";
    }
}

export async function getCollectorStatus() {
    const { rows } = await pool.query(
        `SELECT status, called_at FROM api_fetch_logs ORDER BY fetched_at DESC LIMIT 1`
    );
    if (rows.length === 0) return { status: "unknown", lastRun: null };

    const lastRun = new Date(rows[0].called_at);
    const minutesAgo = (Date.now() - lastRun.getTime()) / 60000;
    return {
        status: minutesAgo < 90 ? "running" : "stale", // qua 90 phut khong chay -> nghi ngo bi dung
        lastRun: rows[0].called_at,
        lastStatus: rows[0].status,
    };
}

export async function getFetchLogs({ station_id, status, limit = 50 }) {
    const params = [];
    const conditions = [];
    if (station_id) { params.push(station_id); conditions.push(`station_id = $${params.length}`); }
    if (status) { params.push(status); conditions.push(`status = $${params.length}`); }
    params.push(limit);
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const { rows } = await pool.query(
        `SELECT id, station_id, called_at, status, fetched_at
     FROM api_fetch_logs ${where}
     ORDER BY fetched_at DESC LIMIT $${params.length}`,
        params
    );
    return rows;
}

export async function getStationLogs(stationId, limit = 50) {
    const { rows } = await pool.query(
        `SELECT id, called_at, status, fetched_at
     FROM api_fetch_logs WHERE station_id = $1
     ORDER BY fetched_at DESC LIMIT $2`,
        [stationId, limit]
    );
    return rows;
}

export function getResourceMetrics() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const cpus = os.cpus();
    const avgLoad = os.loadavg()[0]; // load trung binh 1 phut 

    return {
        cpuUsage: `${(avgLoad * 100 / cpus.length).toFixed(1)}%`,
        memoryUsage: `${(usedMem / totalMem * 100).toFixed(1)}%`,
        networkIO: "N/A",
        requestCount: getRequestCount(),
    };
}