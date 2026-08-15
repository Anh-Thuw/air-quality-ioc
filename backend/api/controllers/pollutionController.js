import * as PollutionModel from "../models/pollutionModel.js";

export async function getLatest(req, res) {
    try {
        res.json(await PollutionModel.getLatestAll());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function getStationHistory(req, res) {
    try {
        const { pollutant, hours, from, to } = req.query;
        res.json(await PollutionModel.getStationPollutionHistory(req.params.id, {
            pollutant, hours: hours ? Number(hours) : undefined, from, to,
        }));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}