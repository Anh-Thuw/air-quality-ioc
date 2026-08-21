import * as SystemV1Model from "../models/Systemv1model.js";


export async function overview(req, res) {
    try {
        const period = req.query.period || "24h";
        const data = await SystemV1Model.getOverview(period);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}


export async function logs(req, res) {
    try {
        const { page, limit, station_id, status } = req.query;

        const result = await SystemV1Model.getLogs({
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 5,
            station_id,
            status,
        });

        res.json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
}


export async function logById(req, res) {
    try {
        const log = await SystemV1Model.getLogById(req.params.id);

        if (!log) {
            return res.status(404).json({
                success: false,
                error: "Khong tim thay log"
            });
        }

        // Tạo mã riêng cho từng trạm dựa trên tên trạm
        if (log.station) {
            const stationCodes = {
                "Hoa Vang": "AQ-DN-HV",
                "Cam Le": "AQ-DN-CL",
                "Ngu Hanh Son": "AQ-DN-NHS",
                "Lien Chieu": "AQ-DN-LC",
                "Thanh Khe": "AQ-DN-TK",
                "Son Tra": "AQ-DN-ST",

                "Kham Duc": "AQ-QN-KD",
                "Tra My": "AQ-QN-TM",
                "Tien Phuoc": "AQ-QN-TP",
                "Dong Giang": "AQ-QN-DG",
                "Thanh My": "AQ-QN-TM2",
                "Que Son": "AQ-QN-QS",
                "Ha Lam": "AQ-QN-HL",
                "Quang Nam": "AQ-QN-QN",
                "Hoi An": "AQ-QN-HA"
            };

            log.station.code =
                stationCodes[log.station.name] || "AQ-DN-OTHER01";
        }

        res.json({
            success: true,
            data: log
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
}


export async function stationsStatus(req, res) {
    try {
        const data = await SystemV1Model.getStationsStatus();

        res.json({
            success: true,
            data
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
}