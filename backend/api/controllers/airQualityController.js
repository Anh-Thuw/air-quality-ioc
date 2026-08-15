import * as AQModel from "../models/airQualityModel.js";

export async function getLatest(req, res) {
    try {
        res.json(await AQModel.getLatestAll());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function getHistory(req, res) {
    try {
        const { from, to, station_id } = req.query;
        res.json(await AQModel.getHistory({ from, to, station_id }));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function getStationHistory(req, res) {
    try {
        const hours = req.query.hours ? Number(req.query.hours) : 24;
        res.json(await AQModel.getStationHistory(req.params.id, hours));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function getStatistics(req, res) {
    try {
        const { from, to, station_id } = req.query;
        res.json(await AQModel.getStatistics({ from, to, station_id }));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function getRanking(req, res) {
    try {
        const order = req.query.order === "desc" ? "desc" : "asc";
        res.json(await AQModel.getRanking(order));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}