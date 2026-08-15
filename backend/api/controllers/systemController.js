import * as SystemModel from "../models/systemModel.js";

export async function health(req, res) {
    const database = await SystemModel.checkDatabaseHealth();
    res.json({ status: database === "healthy" ? "ok" : "degraded", database, timestamp: new Date().toISOString() });
}

export async function status(req, res) {
    const database = await SystemModel.checkDatabaseHealth();
    const collector = await SystemModel.getCollectorStatus();
    res.json({ api: "running", database, collector });
}

export function metrics(req, res) {
    res.json(SystemModel.getResourceMetrics());
}

export async function logs(req, res) {
    try {
        const { station_id, status: statusFilter, limit } = req.query;
        const rows = await SystemModel.getFetchLogs({
            station_id, status: statusFilter, limit: limit ? Number(limit) : 50,
        });
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function stationLogs(req, res) {
    try {
        const limit = req.query.limit ? Number(req.query.limit) : 50;
        res.json(await SystemModel.getStationLogs(req.params.id, limit));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}