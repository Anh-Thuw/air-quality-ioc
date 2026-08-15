import * as StationsModel from "../models/stationsModel.js";
import { getAqiLevelAndColor } from "../utils/aqiHelper.js";

export async function listStations(req, res) {
    try {
        const { city, status } = req.query;
        const stations = await StationsModel.getAllStations({ city, status });
        res.json(stations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function listMapStations(req, res) {
    try {
        const stations = await StationsModel.getMapStations();
        const withColor = stations.map((s) => {
            const { level, color } = getAqiLevelAndColor(s.aqius);
            return { ...s, aqiLevel: level, color };
        });
        res.json(withColor);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function getStation(req, res) {
    try {
        const station = await StationsModel.getStationById(req.params.id);
        if (!station) return res.status(404).json({ error: "Khong tim thay tram" });
        res.json(station);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function getStationOverview(req, res) {
    try {
        const data = await StationsModel.getStationOverview(req.params.id);
        if (!data) return res.status(404).json({ error: "Khong tim thay tram" });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function createStation(req, res) {
    try {
        const { name, city, state, country, latitude, longitude } = req.body;
        if (!name) return res.status(400).json({ error: "Thieu truong 'name'" });
        const station = await StationsModel.createStation({ name, city, state, country, latitude, longitude });
        res.status(201).json(station);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function updateStation(req, res) {
    try {
        const station = await StationsModel.updateStation(req.params.id, req.body);
        if (!station) return res.status(404).json({ error: "Khong tim thay tram" });
        res.json(station);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function deleteStation(req, res) {
    try {
        const deleted = await StationsModel.deleteStation(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Khong tim thay tram" });
        res.json({ success: true, message: "Da xoa tram va du lieu lien quan" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}