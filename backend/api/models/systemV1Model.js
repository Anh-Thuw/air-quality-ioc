import pool from "../../config/db.js";
import { ACTIVE_THRESHOLD_MINUTES } from "../utils/aqiHelper.js";

export async function getOverview(period = "24h") {
    const hours = period === "7d" ? 24 * 7 : 24;

    const { rows: totalRows } = await pool.query(
        `SELECT
       (SELECT COUNT(*) FROM api_fetch_logs WHERE called_at >= NOW() - ($1 || ' hours')::interval) AS total_calls,
       (SELECT COUNT(*) FROM api_fetch_logs WHERE called_at >= NOW() - ($1 || ' hours')::interval AND status = 'success') AS success_calls,
       (SELECT COUNT(*) FROM api_fetch_logs WHERE called_at >= NOW() - ($1 || ' hours')::interval AND status != 'success') AS error_calls,
       (SELECT COUNT(*) FROM pollution_readings) + (SELECT COUNT(*) FROM weather_readings) AS total_records`,
        [hours]
    );
    const t = totalRows[0];

    // Uoc luong dung luong (MB) tu kich thuoc thuc te cac bang chinh trong Postgres
    const { rows: sizeRows } = await pool.query(`
    SELECT ROUND(
      (pg_total_relation_size('pollution_readings') +
       pg_total_relation_size('weather_readings') +
       pg_total_relation_size('forecasts') +
       pg_total_relation_size('api_fetch_logs')) / 1024.0 / 1024.0, 2
    ) AS storage_mb
  `);

    const { rows: stationStatusRows } = await pool.query(`
    SELECT s.id, p.fetched_at
    FROM stations s
    LEFT JOIN LATERAL (
      SELECT fetched_at FROM pollution_readings pr WHERE pr.station_id = s.id ORDER BY pr.ts_vn DESC LIMIT 1
    ) p ON true
  `);
    const now = Date.now();
    const online = stationStatusRows.filter(
        (r) => r.fetched_at && now - new Date(r.fetched_at).getTime() < ACTIVE_THRESHOLD_MINUTES * 60000
    ).length;
    const total = stationStatusRows.length;

    const totalCalls = Number(t.total_calls);
    const successCalls = Number(t.success_calls);

    return {
        successRate: totalCalls > 0 ? Math.round((successCalls / totalCalls) * 1000) / 10 : null,
        totalRecords: Number(t.total_records),
        storageMb: Number(sizeRows[0].storage_mb),
        stations: {
            online,
            offline: total - online,
            total,
            onlineRate: total ? Math.round((online / total) * 1000) / 10 : 0,
        },
        apiErrors: Number(t.error_calls),
        period,
        updatedAt: new Date().toISOString(),
    };
}

export async function getLogs({ page = 1, limit = 5, station_id, status } = {}) {
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];
    if (station_id) { params.push(station_id); conditions.push(`l.station_id = $${params.length}`); }
    if (status) { params.push(status); conditions.push(`l.status = $${params.length}`); }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const { rows: countRows } = await pool.query(
        `SELECT COUNT(*) FROM api_fetch_logs l ${where}`,
        params
    );
    const total = Number(countRows[0].count);

    params.push(limit, offset);
    const { rows } = await pool.query(
        `SELECT l.id, l.station_id, s.name AS station_name, l.called_at, l.fetched_at, l.status
     FROM api_fetch_logs l
     LEFT JOIN stations s ON s.id = l.station_id
     ${where}
     ORDER BY l.fetched_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params
    );

    const data = rows.map((r) => ({
        id: r.id,
        station: r.station_id
            ? { id: r.station_id, name: r.station_name }
            : null,
        calledAt: r.called_at,
        fetchedAt: r.fetched_at,
        status: r.status,
    }));

    return {
        data,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getLogById(id) {
    const { rows } = await pool.query(
        `SELECT l.id, l.station_id, s.name AS station_name, s.city, l.called_at, l.fetched_at, l.status
     FROM api_fetch_logs l
     LEFT JOIN stations s ON s.id = l.station_id
     WHERE l.id = $1`,
        [id]
    );
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
        id: r.id,
        station: r.station_id
            ? { id: r.station_id, name: r.station_name, city: r.city }
            : null,
        calledAt: r.called_at,
        fetchedAt: r.fetched_at,
        status: r.status,
    };
}

export async function getStationsStatus() {
    const { rows } = await pool.query(`
    SELECT s.id, s.name, s.city, p.aqius, p.fetched_at
    FROM stations s
    LEFT JOIN LATERAL (
      SELECT aqius, fetched_at FROM pollution_readings pr WHERE pr.station_id = s.id ORDER BY pr.ts_vn DESC LIMIT 1
    ) p ON true
    ORDER BY s.name
  `);

    const now = Date.now();
    const stations = rows.map((r) => {
        const online = r.fetched_at && now - new Date(r.fetched_at).getTime() < ACTIVE_THRESHOLD_MINUTES * 60000;
        return {
            id: r.id,
            name: r.name,
            city: r.city,
            status: online ? "online" : "offline",
            aqi: online ? r.aqius : null,
            updatedAt: r.fetched_at,
        };
    });

    const online = stations.filter((s) => s.status === "online").length;
    const total = stations.length;

    return {
        summary: {
            total,
            online,
            offline: total - online,
            onlineRate: total ? Math.round((online / total) * 1000) / 10 : 0,
        },
        stations,
    };
}