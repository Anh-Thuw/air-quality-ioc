import * as WeatherModel from "../models/weatherModel.js";

export async function getLatest(req, res) {
    try {
        res.json(await WeatherModel.getLatestAll());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function getStationLatest(req, res) {
    try {
        const data = await WeatherModel.getStationLatest(req.params.id);
        if (!data) return res.status(404).json({ error: "Khong co du lieu thoi tiet cho tram nay" });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function getHistory(req, res) {
    try {
        const { station_id, from, to } = req.query;
        res.json(await WeatherModel.getHistory({ station_id, from, to }));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function getStationHistory(req, res) {
    try {
        const { hours, from, to } = req.query;
        res.json(await WeatherModel.getStationHistory(req.params.id, {
            hours: hours ? Number(hours) : undefined, from, to,
        }));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function getStatistics(req, res) {
    try {
        const { from, to, station_id } = req.query;
        res.json(await WeatherModel.getStatistics({ from, to, station_id }));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}