import * as ApiKeyModel from "../models/apiKeyModel.js";

export async function createKey(req, res) {
    try {
        const { label, owner } = req.body;
        const key = await ApiKeyModel.createApiKey({ label, owner });
        res.status(201).json(key);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function listKeys(req, res) {
    try {
        const keys = await ApiKeyModel.listApiKeys();
        res.json(keys);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function revokeKey(req, res) {
    try {
        const result = await ApiKeyModel.revokeApiKey(req.params.id);
        if (!result) return res.status(404).json({ error: "Khong tim thay key" });
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function unrevokeKey(req, res) {
    try {
        const result = await ApiKeyModel.unrevokeApiKey(req.params.id);
        if (!result) return res.status(404).json({ error: "Khong tim thay key" });
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function deleteKey(req, res) {
    try {
        const deleted = await ApiKeyModel.deleteApiKey(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Khong tim thay key" });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}