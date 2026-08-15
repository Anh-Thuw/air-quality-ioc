import * as SettingsModel from "../models/settingsModel.js";

export async function getSettings(req, res) {
    try {
        res.json(await SettingsModel.getSettings());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function updateSettings(req, res) {
    try {
        const { refreshIntervalMinutes, aqiWarningThreshold, forecastHours } = req.body;
        res.json(await SettingsModel.updateSettings({ refreshIntervalMinutes, aqiWarningThreshold, forecastHours }));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}