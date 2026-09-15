
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import AirQuality from "./pages/AirQuality";
import Weather from "./pages/Weather";
import AiForecast from "./pages/AiForecast";
import SystemMonitoring from "./pages/SystemMonitoring";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";

// Khung layout chung (Sidebar + Topbar) - chi ap dung cho cac trang chinh,
// KHONG ap dung cho trang Login de giao dien dang nhap gon gang hon.
function Layout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Topbar />
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang dang nhap - khong co Sidebar/Topbar */}
        <Route path="/login" element={<Login />} />

        {/* Trang quan tri - khong co Sidebar/Topbar, tu kiem tra dang nhap ben trong component */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Cac trang chinh - co Layout (Sidebar + Topbar) */}
        <Route path="/" element={<Navigate to="/air-quality" replace />} />
        <Route
          path="/air-quality"
          element={
            <Layout>
              <AirQuality />
            </Layout>
          }
        />
        <Route
          path="/weather"
          element={
            <Layout>
              <Weather />
            </Layout>
          }
        />
        <Route
          path="/forecast"
          element={
            <Layout>
              <AiForecast />
            </Layout>
          }
        />
        <Route
          path="/system"
          element={
            <Layout>
              <SystemMonitoring />
            </Layout>
          }
        />

        {/* Bat ky duong dan nao khac khong khop -> quay ve trang chinh */}
        <Route path="*" element={<Navigate to="/air-quality" replace />} />
      </Routes>
    </BrowserRouter>
  );
}