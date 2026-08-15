import pool from "../../config/db.js";

export async function getLatestAll() {
    const { rows } = await pool.query(
        `SELECT DISTINCT ON (station_id) station_id, ts, p1, p2, o3, n2, s2, co
     FROM pollution_readings ORDER BY station_id, ts_vn DESC`
    );
    return rows;
}

const ALLOWED_POLLUTANTS = ["p1", "p2", "o3", "n2", "s2", "co"];

export async function getStationPollutionHistory(stationId, { pollutant, hours, from, to }) {
    const params = [stationId];
    let timeCondition;
    if (from && to) {
        params.push(from, to);
        timeCondition = `ts_vn BETWEEN $2 AND $3`;
    } else {
        params.push(hours || 24);
        timeCondition = `ts_vn >= NOW() - ($2 || ' hours')::interval`;
    }

    const cols = pollutant && ALLOWED_POLLUTANTS.includes(pollutant)
        ? pollutant
        : ALLOWED_POLLUTANTS.join(", ");

    const { rows } = await pool.query(
        `SELECT ts_vn AS ts, ${cols} FROM pollution_readings
     WHERE station_id = $1 AND ${timeCondition}
     ORDER BY ts_vn ASC`,
        params
    );
    return rows;
}