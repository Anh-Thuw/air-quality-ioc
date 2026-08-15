import pool from "../../config/db.js";

export async function getLatestAll() {
    const { rows } = await pool.query(
        `SELECT DISTINCT ON (station_id) station_id, ts, aqius, aqicn, mainus, maincn
     FROM pollution_readings
     ORDER BY station_id, ts_vn DESC`
    );
    return rows;
}

export async function getHistory({ from, to, station_id }) {
    const params = [];
    const conditions = [];
    if (from) { params.push(from); conditions.push(`ts_vn >= $${params.length}`); }
    if (to) { params.push(to); conditions.push(`ts_vn <= $${params.length}`); }

    if (station_id) {
        params.push(station_id);
        conditions.push(`station_id = $${params.length}`);
        const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
        const { rows } = await pool.query(
            `SELECT ts_vn AS ts, aqius FROM pollution_readings ${where} ORDER BY ts_vn ASC`,
            params
        );
        return rows;
    }

    // Khong chi dinh tram -> tra ve AQI trung binh toan he thong theo tung moc thoi gian
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const { rows } = await pool.query(
        `SELECT ts_vn AS ts, ROUND(AVG(aqius)) AS aqius
     FROM pollution_readings ${where}
     GROUP BY ts_vn ORDER BY ts_vn ASC`,
        params
    );
    return rows;
}

export async function getStationHistory(stationId, hours = 24) {
    const { rows } = await pool.query(
        `SELECT ts_vn AS ts, aqius, aqicn FROM pollution_readings
     WHERE station_id = $1 AND ts_vn >= NOW() - ($2 || ' hours')::interval
     ORDER BY ts_vn ASC`,
        [stationId, hours]
    );
    return rows;
}

export async function getStatistics({ from, to, station_id }, threshold = 100) {
    const params = [];
    const conditions = [];
    if (from) { params.push(from); conditions.push(`ts_vn >= $${params.length}`); }
    if (to) { params.push(to); conditions.push(`ts_vn <= $${params.length}`); }
    if (station_id) { params.push(station_id); conditions.push(`station_id = $${params.length}`); }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const { rows } = await pool.query(
        `SELECT
       ROUND(AVG(aqius)) AS "avgAqi",
       MAX(aqius) AS "maxAqi",
       MIN(aqius) AS "minAqi",
       COUNT(*) FILTER (WHERE aqius > ${threshold}) AS "exceedCount",
       COUNT(*) FILTER (WHERE aqius <= 50) AS good,
       COUNT(*) FILTER (WHERE aqius > 50 AND aqius <= 100) AS moderate,
       COUNT(*) FILTER (WHERE aqius > 100 AND aqius <= 150) AS unhealthy_sensitive,
       COUNT(*) FILTER (WHERE aqius > 150 AND aqius <= 200) AS unhealthy,
       COUNT(*) FILTER (WHERE aqius > 200) AS very_unhealthy_plus
     FROM pollution_readings ${where}`,
        params
    );

    const r = rows[0];
    return {
        avgAqi: r.avgAqi ? Number(r.avgAqi) : null,
        maxAqi: r.maxAqi,
        minAqi: r.minAqi,
        exceedCount: Number(r.exceedCount),
        distribution: {
            good: Number(r.good),
            moderate: Number(r.moderate),
            unhealthy_sensitive: Number(r.unhealthy_sensitive),
            unhealthy: Number(r.unhealthy),
            very_unhealthy_plus: Number(r.very_unhealthy_plus),
        },
    };
}

export async function getRanking(order = "asc") {
    const sortDir = order === "desc" ? "DESC" : "ASC";
    const { rows } = await pool.query(
        `SELECT s.id AS station_id, s.name, p.aqius
     FROM stations s
     LEFT JOIN LATERAL (
       SELECT aqius FROM pollution_readings pr WHERE pr.station_id = s.id ORDER BY pr.ts_vn DESC LIMIT 1
     ) p ON true
     ORDER BY p.aqius ${sortDir} NULLS LAST`
    );
    return rows.map((r, i) => ({ rank: i + 1, ...r }));
}