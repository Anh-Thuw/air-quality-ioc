import { useEffect, useState } from "react";

// Nguồn dữ liệu thật: nên trỏ về backend/api/routes -> GET /api/system/summary
// (query bảng api_fetch_logs + stations, giống 3 stat panel của dashboard 4).
// Tạm thời có fallback tĩnh để UI luôn có nội dung khi API chưa sẵn sàng.
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const FALLBACK = {
  activeStations: 15,
  successRate: 98.2,
  errorsLastHour: 2,
  avgAqi: 54,
  lastSync: "2 phút trước",
  forecastAccuracy: 91.4,
};

export default function Ticker() {
  const [data, setData] = useState(FALLBACK);

  useEffect(() => {
    if (!API_BASE) return;
    fetch(`${API_BASE}/system/summary`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {}); // giữ fallback nếu API lỗi
  }, []);

  const items = [
    <span key="1"><b>{data.activeStations}</b> trạm hoạt động</span>,
    <span key="2">tỷ lệ thành công API <b>{data.successRate}%</b></span>,
    <span key="3" style={data.errorsLastHour > 0 ? { color: "var(--aqi-moderate)" } : {}}>
      <b>{data.errorsLastHour}</b> trạm lỗi trong giờ qua
    </span>,
    <span key="4">AQI trung bình vùng <b>{data.avgAqi}</b></span>,
    <span key="5">cập nhật lần cuối <b>{data.lastSync}</b></span>,
    <span key="6">mô hình dự báo AI · độ chính xác <b>{data.forecastAccuracy}%</b></span>,
  ];

  return (
    <div style={{
      height: 30, background: "var(--bg-raise)", borderBottom: "1px solid var(--border-soft)",
      display: "flex", alignItems: "center", overflow: "hidden", whiteSpace: "nowrap",
      fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-dim)",
    }}>
      <div style={{ display: "flex", gap: 28, padding: "0 20px" }}>
        {items.map((it, i) => <div key={i}>{it}</div>)}
      </div>
    </div>
  );
}
