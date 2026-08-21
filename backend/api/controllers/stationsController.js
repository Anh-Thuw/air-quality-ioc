import * as StationsModel from "../models/stationsModel.js";
import pool from "../../config/db.js";
import {
    getAqiLevelAndColor,
    getAqiLevelVN,
    getPollutantLabel,
    ACTIVE_THRESHOLD_MINUTES,
} from "../utils/aqiHelper.js";

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
        const stationId = req.params.id;
        const { rows: stationRows } = await pool.query(
            `SELECT id, name, city, state AS province, country, latitude, longitude FROM stations WHERE id = $1`,
            [stationId]
        );
        if (stationRows.length === 0) return res.status(404).json({ error: "Khong tim thay tram" });
        const station = stationRows[0];

        const { rows: pollutionRows } = await pool.query(
            `SELECT ts, aqius, aqicn, mainus, p1, p2, o3, n2, s2, co, fetched_at
       FROM pollution_readings WHERE station_id = $1 ORDER BY ts_vn DESC LIMIT 1`,
            [stationId]
        );
        const { rows: weatherRows } = await pool.query(
            `SELECT tp, hu, ws, fetched_at FROM weather_readings WHERE station_id = $1 ORDER BY ts_vn DESC LIMIT 1`,
            [stationId]
        );

        const pollution = pollutionRows[0] || null;
        const weather = weatherRows[0] || null;

        const now = Date.now();
        const isOnline = pollution?.fetched_at &&
            now - new Date(pollution.fetched_at).getTime() < ACTIVE_THRESHOLD_MINUTES * 60000;

        const { color } = getAqiLevelAndColor(pollution?.aqius);

        res.json({
            station: {
                id: station.id,
                name: station.name,
                city: station.city,
                province: station.province,
                country: station.country,
                latitude: station.latitude,
                longitude: station.longitude,
                status: isOnline ? "ONLINE" : "OFFLINE",
                lastUpdated: pollution?.fetched_at || null,
            },
            aqi: {
                value: pollution?.aqius ?? null,
                category: getAqiLevelVN(pollution?.aqius).toUpperCase(), // spec vi du: "TRUNG BÌNH" (viet hoa)
                color,
                mainPollutant: getPollutantLabel(pollution?.mainus),
            },
            weather: {
                temperature: weather?.tp ?? null,
                humidity: weather?.hu ?? null,
                windSpeed: weather?.ws ?? null,
                uvIndex: null, // IQAir goi Community khong tra ve UV Index - luon null cho toi khi doi nguon/nang goi
            },
            pollutants: {
                PM25: { value: pollution?.p2 ?? null, unit: "µg/m³" },
                PM10: { value: pollution?.p1 ?? null, unit: "µg/m³" },
                NO2: { value: pollution?.n2 ?? null, unit: "ppb" },
                SO2: { value: pollution?.s2 ?? null, unit: "ppb" },
                CO: { value: pollution?.co ?? null, unit: "ppm" },
                O3: { value: pollution?.o3 ?? null, unit: "ppb" },
                // Luu y: gia tri hien tai da so la null vi goi IQAir Community khong tra chi tiet tung chat.
                // Cau truc van giu day du de khop dung shape API - se tu dong co gia tri that neu nang goi/doi nguon du lieu.
            },
        });
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