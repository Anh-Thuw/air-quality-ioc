import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Ticker from "./components/Ticker";
import AirQuality from "./pages/AirQuality";
import Weather from "./pages/Weather";
import AiForecast from "./pages/AiForecast";
import SystemMonitoring from "./pages/SystemMonitoring";
import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <Ticker />
      <div className="shell">
        <Sidebar />
        <main className="main">
          <Routes>
            <Route path="/" element={<Navigate to="/air-quality" replace />} />
            <Route path="/air-quality" element={<AirQuality />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/ai-forecast" element={<AiForecast />} />
            <Route path="/system" element={<SystemMonitoring />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
