import pool from "../../config/db.js";

export async function getSettings() {
    const { rows } = await pool.query(`SELECT * FROM app_settings WHERE id = 1`);
    if (rows.length === 0) {
        // Phong truong hop chua chay migration 003 - tra ve gia tri mac dinh
        return { refreshIntervalMinutes: 60, aqiWarningThreshold: 100, forecastHours: 24 };
    }
    const r = rows[0];
    return {
        refreshIntervalMinutes: r.refresh_interval_minutes,
        aqiWarningThreshold: r.aqi_warning_threshold,
        forecastHours: r.forecast_hours,
    };
}

export async function updateSettings({ refreshIntervalMinutes, aqiWarningThreshold, forecastHours }) {
    const { rows } = await pool.query(
        `UPDATE app_settings SET
       refresh_interval_minutes = COALESCE($1, refresh_interval_minutes),
       aqi_warning_threshold = COALESCE($2, aqi_warning_threshold),
       forecast_hours = COALESCE($3, forecast_hours),
       updated_at = NOW()
     WHERE id = 1
     RETURNING *`,
        [refreshIntervalMinutes, aqiWarningThreshold, forecastHours]
    );
    const r = rows[0];
    return {
        refreshIntervalMinutes: r.refresh_interval_minutes,
        aqiWarningThreshold: r.aqi_warning_threshold,
        forecastHours: r.forecast_hours,
    };
}