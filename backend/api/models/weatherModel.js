import pool from "../../config/db.js";

export async function getLatestAll() {
    const { rows } = await pool.query(
        `SELECT DISTINCT ON (station_id) station_id, ts, tp, pr, hu, ws, wd, ic, heat_index
     FROM weather_readings ORDER BY station_id, ts_vn DESC`
    );
    return rows;
}

export async function getStationLatest(stationId) {
    const { rows } = await pool.query(
        `SELECT ts, tp, pr, hu, ws, wd, ic, heat_index
     FROM weather_readings WHERE station_id = $1 ORDER BY ts_vn DESC LIMIT 1`,
        [stationId]
    );
    return rows[0] || null;
}

export async function getHistory({ station_id, from, to }) {
    const params = [];
    const conditions = [];
    if (station_id) { params.push(station_id); conditions.push(`station_id = $${params.length}`); }
    if (from) { params.push(from); conditions.push(`ts_vn >= $${params.length}`); }
    if (to) { params.push(to); conditions.push(`ts_vn <= $${params.length}`); }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const { rows } = await pool.query(
        `SELECT ts_vn AS ts, station_id, tp, hu, ws, wd, pr
     FROM weather_readings ${where} ORDER BY ts_vn ASC`,
        params
    );
    return rows;
}

export async function getStationHistory(stationId, { hours, from, to }) {
    const params = [stationId];
    let timeCondition;
    if (from && to) {
        params.push(from, to);
        timeCondition = `ts_vn BETWEEN $2 AND $3`;
    } else {
        params.push(hours || 24);
        timeCondition = `ts_vn >= NOW() - ($2 || ' hours')::interval`;
    }

    const { rows } = await pool.query(
        `SELECT ts_vn AS ts, tp, hu, pr, ws, wd, heat_index
     FROM weather_readings WHERE station_id = $1 AND ${timeCondition}
     ORDER BY ts_vn ASC`,
        params
    );
    return rows;
}

export async function getStatistics({ from, to, station_id }) {
    const params = [];
    const conditions = [];
    if (from) { params.push(from); conditions.push(`ts_vn >= $${params.length}`); }
    if (to) { params.push(to); conditions.push(`ts_vn <= $${params.length}`); }
    if (station_id) { params.push(station_id); conditions.push(`station_id = $${params.length}`); }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const { rows } = await pool.query(
        `SELECT ROUND(AVG(tp)::numeric,1) AS "avgTemp", MAX(tp) AS "maxTemp",
            ROUND(AVG(hu)::numeric,1) AS "avgHumidity", ROUND(AVG(ws)::numeric,2) AS "avgWindSpeed"
     FROM weather_readings ${where}`,
        params
    );
    return rows[0];
}