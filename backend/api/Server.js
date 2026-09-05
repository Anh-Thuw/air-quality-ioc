import "dotenv/config";
import express from "express";
import cors from "cors";

import dashboardRoutes from "./routes/dashboardRoutes.js";
import stationsRoutes from "./routes/stationsRoutes.js";
import mapRoutes from "./routes/mapRoutes.js";
import airQualityRoutes from "./routes/airQualityRoutes.js";
import pollutionRoutes from "./routes/pollutionRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";
import forecastRoutes from "./routes/forecastRoutes.js";
import systemRoutes from "./routes/systemRoutes.js";
import systemV1Routes from "./routes/systemV1Routes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { incrementRequestCount } from "./models/systemModel.js";

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(cors());
app.use(express.json());

// Dem so luong request phuc vu /api/system/metrics
app.use((req, res, next) => {
    incrementRequestCount();
    next();
});

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes); // POST /api/auth/login
app.use("/api/stations", stationsRoutes);
app.use("/api/map", mapRoutes);
app.use("/api/air-quality", airQualityRoutes);
app.use("/api/pollution", pollutionRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/forecast", forecastRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api", systemRoutes); // /api/health, /api/system/*
app.use("/api/v1/system", systemV1Routes); // nhom endpoint moi theo spec chi tiet

app.use((req, res) => {
    res.status(404).json({ error: "Khong tim thay endpoint nay" });
});

app.listen(PORT, () => {
    console.log(`✅ API dang chay tai http://localhost:${PORT}`);
});