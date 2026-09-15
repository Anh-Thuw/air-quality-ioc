import pool from "../../config/db.js";

export async function getSettings() {
    const { rows } = await pool.query(`SELECT * FROM app_settings WHERE id = 1`);
    if (rows.length === 0) {
        return { refreshIntervalMinutes: 60, aqiWarningThreshold: 100, forecastHours: 24, publicApiUrl: null };
    }
    const r = rows[0];
    return {
        refreshIntervalMinutes: r.refresh_interval_minutes,
        aqiWarningThreshold: r.aqi_warning_threshold,
        forecastHours: r.forecast_hours,
        publicApiUrl: r.public_api_url,
    };
}

export async function updateSettings({ refreshIntervalMinutes, aqiWarningThreshold, forecastHours, publicApiUrl }) {
    const { rows } = await pool.query(
        `UPDATE app_settings SET
       refresh_interval_minutes = COALESCE($1, refresh_interval_minutes),
       aqi_warning_threshold = COALESCE($2, aqi_warning_threshold),
       forecast_hours = COALESCE($3, forecast_hours),
       public_api_url = COALESCE($4, public_api_url),
       updated_at = NOW()
     WHERE id = 1
     RETURNING *`,
        [refreshIntervalMinutes, aqiWarningThreshold, forecastHours, publicApiUrl]
    );
    const r = rows[0];
    return {
        refreshIntervalMinutes: r.refresh_interval_minutes,
        aqiWarningThreshold: r.aqi_warning_threshold,
        forecastHours: r.forecast_hours,
        publicApiUrl: r.public_api_url,
    };
}