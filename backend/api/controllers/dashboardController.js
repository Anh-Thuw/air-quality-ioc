import pool from "../../config/db.js";

export async function getOverview(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM stations) AS "totalStations",
        (SELECT COUNT(*) FROM (
           SELECT DISTINCT ON (station_id) station_id, fetched_at FROM pollution_readings
           ORDER BY station_id, ts_vn DESC
         ) t WHERE t.fetched_at > NOW() - INTERVAL '120 minutes') AS "activeStations",
        (SELECT ROUND(AVG(aqius)) FROM (
           SELECT DISTINCT ON (station_id) station_id, aqius FROM pollution_readings ORDER BY station_id, ts_vn DESC
         ) t) AS "averageAqi",
        (SELECT ROUND(AVG(p2)::numeric,1) FROM (
           SELECT DISTINCT ON (station_id) station_id, p2 FROM pollution_readings ORDER BY station_id, ts_vn DESC
         ) t) AS "averagePm25",
        (SELECT MAX(fetched_at) FROM pollution_readings) AS "lastUpdated"
    `);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}