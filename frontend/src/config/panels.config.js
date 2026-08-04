export const GRAFANA_BASE_URL =
  import.meta.env.VITE_GRAFANA_BASE_URL || "https://smallcedar2829.grafana.net";

export const DASHBOARDS = {
  air: {
    uid: "ioc-air-quality-overview",
    slug: "1-tong-quan-chat-luong-khong-khi-ioc",
    datasourceUid: "fftoxp6w1qlfke", // TODO: xác nhận đúng UID datasource của dashboard này
    title: "Tổng quan Chất lượng Không khí",
    subtitle: "15 trạm quan trắc · khu vực Đà Nẵng – Quảng Nam",
    panels: {
      aqiUS: { id: "panel-1", title: "AQI (US) hiện tại", type: "stat" },
      aqiCN: { id: "panel-2", title: "AQI (CN) hiện tại", type: "stat" },
      mainPollutant: { id: "panel-3", title: "Chất gây ô nhiễm chính (US)", type: "stat" },
      aqiGauge: { id: "panel-4", title: "AQI (US) — mức độ", type: "chart" },
      aqiTrend: { id: "panel-5", title: "Xu hướng AQI theo thời gian", type: "chart", span: 2 },
      pm: { id: "panel-6", title: "Bụi mịn PM2.5 & PM10 (µg/m³)", type: "chart", span: 2 },
      gases: { id: "panel-7", title: "Khí ô nhiễm: O3, NO2, SO2, CO", type: "chart", span: 4 },
    },
  },

  weather: {
    uid: "ioc-weather-monitoring",
    slug: "2-giam-sat-thoi-tiet-ioc",
    datasourceUid: "fftoxp6w1qlfke",
    title: "Giám sát Thời tiết",
    subtitle: "Nhiệt độ, độ ẩm, áp suất, gió, mưa theo trạm",
    panels: {
      temperature: { id: "panel-1", title: "Nhiệt độ hiện tại (°C)", type: "stat" },
      humidity: { id: "panel-2", title: "Độ ẩm hiện tại (%)", type: "stat" },
      tempTrend: { id: "panel-3", title: "Xu hướng nhiệt độ", type: "chart", span: 2 },
      humidityPressure: { id: "panel-4", title: "Độ ẩm & Áp suất khí quyển", type: "chart", span: 4 },
      // TODO: kiểm tra thêm panel wind/rain nếu dashboard có, lấy đúng id-panel-x
    },
  },

  forecast: {
    uid: "ioc-ai-forecast",           // TODO: lấy đúng uid thật từ URL Grafana
    slug: "3-du-bao-aqi-bang-ai",     // TODO: lấy đúng slug thật từ URL Grafana
    datasourceUid: "fftoxp6w1qlfke",
    title: "Dự báo Chất lượng Không khí bằng AI",
    subtitle: "Mô hình time-series · cập nhật định kỳ",
    panels: {
      forecast: { id: "panel-1", title: "AQI dự báo", type: "stat" },
      accuracy: { id: "panel-2", title: "Accuracy", type: "stat" },
      rmse: { id: "panel-3", title: "RMSE", type: "stat" },
      mae: { id: "panel-4", title: "MAE", type: "stat" },
      chart: { id: "panel-5", title: "Biểu đồ dự báo — thực tế vs mô hình", type: "chart", span: 4 },
    },
  },

  system: {
    uid: "ioc-system-monitoring",
    slug: "4-giam-sat-he-thong-thu-thap-du-lieu-ioc", // TODO: xác nhận đúng slug qua Share embed
    datasourceUid: "fftoxp6w1qlfke",
    title: "Giám sát Hệ thống Thu thập Dữ liệu",
    subtitle: "Trạng thái collector & log gọi API",
    panels: {
      totalCalls: { id: "panel-1", title: "Tổng số lượt gọi API", type: "stat" },
      successRate: { id: "panel-2", title: "Tỷ lệ thành công (%)", type: "stat" },
      errorCount: { id: "panel-3", title: "Số lượt lỗi (failed)", type: "stat" },
      timeline: { id: "panel-4", title: "Lượt gọi API theo trạng thái theo thời gian", type: "chart", span: 4 },
      logTable: { id: "panel-5", title: "Nhật ký các lượt gọi API gần đây", type: "table", span: 4 },
    },
  },
};

export const NAV_ITEMS = [
  { key: "air", num: "01", path: "/air-quality", label: "Chất lượng Không khí", sub: "AQI · PM2.5/PM10 · khí độc" },
  { key: "weather", num: "02", path: "/weather", label: "Giám sát Thời tiết", sub: "Nhiệt độ · độ ẩm · gió · mưa" },
  { key: "forecast", num: "03", path: "/ai-forecast", label: "Dự báo AQI bằng AI", sub: "Model · độ chính xác" },
  { key: "system", num: "04", path: "/system", label: "Giám sát Collector", sub: "API · log · uptime" },
];