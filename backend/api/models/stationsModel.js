import pool from "../../config/db.js";
import { ACTIVE_THRESHOLD_MINUTES } from "../utils/aqiHelper.js";

// Lay danh sach tram kem AQI hien tai
export async function getAllStations({ city, status } = {}) {
    const params = [];
    let whereCity = "";
    if (city) {
        params.push(city);
        whereCity = `WHERE s.city = $${params.length}`;
    }

    const { rows } = await pool.query(
        `SELECT s.id, s.name, s.city, s.state, s.country, s.latitude, s.longitude,
            p.aqius, p.mainus, p.fetched_at,
            CASE WHEN p.fetched_at > NOW() - INTERVAL '${ACTIVE_THRESHOLD_MINUTES} minutes'
                 THEN 'active' ELSE 'inactive' END AS status
     FROM stations s
     LEFT JOIN LATERAL (
       SELECT aqius, mainus, fetched_at FROM pollution_readings pr
       WHERE pr.station_id = s.id ORDER BY pr.ts_vn DESC LIMIT 1
     ) p ON true
     ${whereCity}
     ORDER BY s.name`,
        params
    );

    if (status) return rows.filter((r) => r.status === status);
    return rows;
}

export async function getMapStations() {
    const { rows } = await pool.query(
        `SELECT s.id, s.name, s.latitude, s.longitude,
            p.aqius, p.fetched_at,
            CASE WHEN p.fetched_at > NOW() - INTERVAL '${ACTIVE_THRESHOLD_MINUTES} minutes'
                 THEN 'active' ELSE 'inactive' END AS status
     FROM stations s
     LEFT JOIN LATERAL (
       SELECT aqius, fetched_at FROM pollution_readings pr
       WHERE pr.station_id = s.id ORDER BY pr.ts_vn DESC LIMIT 1
     ) p ON true
     ORDER BY s.name`
    );
    return rows;
}

export async function getStationById(id) {
    const { rows } = await pool.query(`SELECT * FROM stations WHERE id = $1`, [id]);
    return rows[0] || null;
}

export async function getStationOverview(id) {
    const station = await getStationById(id);
    if (!station) return null;

    const { rows: pollutionRows } = await pool.query(
        `SELECT ts, aqius, mainus, aqicn, maincn, p1, p2, o3, n2, s2, co
     FROM pollution_readings WHERE station_id = $1 ORDER BY ts_vn DESC LIMIT 1`,
        [id]
    );
    const { rows: weatherRows } = await pool.query(
        `SELECT ts, tp, pr, hu, ws, wd, ic, heat_index
     FROM weather_readings WHERE station_id = $1 ORDER BY ts_vn DESC LIMIT 1`,
        [id]
    );

    return {
        station,
        current: {
            pollution: pollutionRows[0] || null,
            weather: weatherRows[0] || null,
        },
    };
}

export async function createStation({ name, city, state, country, latitude, longitude }) {
    const { rows } = await pool.query(
        `INSERT INTO stations (name, city, state, country, latitude, longitude)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [name, city, state, country, latitude, longitude]
    );
    return rows[0];
}

export async function updateStation(id, fields) {
    const allowed = ["name", "city", "state", "country", "latitude", "longitude"];
    const sets = [];
    const params = [];
    for (const key of allowed) {
        if (fields[key] !== undefined) {
            params.push(fields[key]);
            sets.push(`${key} = $${params.length}`);
        }
    }
    if (sets.length === 0) return getStationById(id);

    params.push(id);
    const { rows } = await pool.query(
        `UPDATE stations SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`,
        params
    );
    return rows[0] || null;
}

export async function deleteStation(id) {
    // Xoa du lieu lien quan truoc (cascade thu cong vi schema goc khong khai bao ON DELETE CASCADE)
    await pool.query(`DELETE FROM pollution_readings WHERE station_id = $1`, [id]);
    await pool.query(`DELETE FROM weather_readings WHERE station_id = $1`, [id]);
    await pool.query(`DELETE FROM forecasts WHERE station_id = $1`, [id]);
    await pool.query(`UPDATE api_fetch_logs SET station_id = NULL WHERE station_id = $1`, [id]);
    const { rowCount } = await pool.query(`DELETE FROM stations WHERE id = $1`, [id]);
    return rowCount > 0;
}