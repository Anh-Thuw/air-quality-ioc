import pool from "../../config/db.js";

export async function getLatestAll() {
    const { rows } = await pool.query(
        `SELECT DISTINCT ON (station_id) station_id, model_name, forecast_for, predicted_aqius, predicted_pm25, confidence
     FROM forecasts ORDER BY station_id, created_at DESC`
    );
    return rows;
}

export async function getStationForecast(stationId, hours = 24) {
    const { rows } = await pool.query(
        `SELECT forecast_for, predicted_aqius, predicted_pm25, confidence, model_name
     FROM forecasts
     WHERE station_id = $1 AND forecast_for BETWEEN NOW() AND NOW() + ($2 || ' hours')::interval
     ORDER BY forecast_for ASC`,
        [stationId, hours]
    );
    return rows;
}

// So sanh du bao voi thuc te - ghep theo station_id + gio (lam tron ve gio de khop timestamp)
export async function getForecastHistory({ station_id, from, to }) {
    const params = [];
    const conditions = ["date_trunc('hour', f.forecast_for) = date_trunc('hour', p.ts_vn)"];
    if (station_id) { params.push(station_id); conditions.push(`f.station_id = $${params.length}`); }
    if (from) { params.push(from); conditions.push(`f.forecast_for >= $${params.length}`); }
    if (to) { params.push(to); conditions.push(`f.forecast_for <= $${params.length}`); }

    const { rows } = await pool.query(
        `SELECT f.forecast_for AS ts, p.aqius AS actual_aqius, f.predicted_aqius
     FROM forecasts f
     JOIN pollution_readings p ON p.station_id = f.station_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY f.forecast_for ASC`,
        params
    );
    return rows;
}

export async function getAccuracy({ model_name, station_id }) {
    const params = [];
    const conditions = ["date_trunc('hour', f.forecast_for) = date_trunc('hour', p.ts_vn)"];
    if (model_name) { params.push(model_name); conditions.push(`f.model_name = $${params.length}`); }
    if (station_id) { params.push(station_id); conditions.push(`f.station_id = $${params.length}`); }

    const { rows } = await pool.query(
        `SELECT p.aqius AS actual, f.predicted_aqius AS predicted
     FROM forecasts f
     JOIN pollution_readings p ON p.station_id = f.station_id
     WHERE ${conditions.join(" AND ")}`,
        params
    );

    if (rows.length === 0) return { mae: null, rmse: null, r2: null, sampleSize: 0 };

    const n = rows.length;
    const errors = rows.map((r) => r.actual - r.predicted);
    const mae = errors.reduce((s, e) => s + Math.abs(e), 0) / n;
    const rmse = Math.sqrt(errors.reduce((s, e) => s + e * e, 0) / n);

    const meanActual = rows.reduce((s, r) => s + r.actual, 0) / n;
    const ssTot = rows.reduce((s, r) => s + (r.actual - meanActual) ** 2, 0);
    const ssRes = errors.reduce((s, e) => s + e * e, 0);
    const r2 = ssTot === 0 ? null : 1 - ssRes / ssTot;

    return {
        mae: Number(mae.toFixed(2)),
        rmse: Number(rmse.toFixed(2)),
        r2: r2 === null ? null : Number(r2.toFixed(3)),
        sampleSize: n,
    };
}

// Du bao don gian (hoi quy tuyen tinh tren lich su gan nhat).
export async function predictAndSave({ station_id, model_name = "LinearRegression_api", hours = 6 }) {
    const { rows: history } = await pool.query(
        `SELECT ts_vn, aqius FROM pollution_readings
     WHERE station_id = $1 AND aqius IS NOT NULL
     ORDER BY ts_vn DESC LIMIT 48`,
        [station_id]
    );

    if (history.length < 5) {
        throw new Error("Khong du du lieu lich su de du bao (can toi thieu 5 diem)");
    }

    const points = history.reverse().map((r, i) => ({ x: i, y: r.aqius }));
    const n = points.length;
    const sumX = points.reduce((s, p) => s + p.x, 0);
    const sumY = points.reduce((s, p) => s + p.y, 0);
    const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
    const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
    const a = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - a * sumX) / n;

    const lastTime = new Date(history[history.length - 1].ts_vn);
    const created = [];

    for (let h = 1; h <= hours; h++) {
        const x = n - 1 + h;
        const predictedAqius = Math.max(0, Math.round(a * x + b));
        const forecastFor = new Date(lastTime.getTime() + h * 3600 * 1000);

        const { rows } = await pool.query(
            `INSERT INTO forecasts (station_id, model_name, forecast_for, predicted_aqius, confidence)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, station_id, forecast_for, predicted_aqius, predicted_pm25, confidence`,
            [station_id, model_name, forecastFor, predictedAqius, 0.5]
        );
        created.push(rows[0]);
    }

    return created[0]; // tra ve ban ghi dau tien theo dung mo ta API (co the doi sang tra ve ca mang neu can)
}