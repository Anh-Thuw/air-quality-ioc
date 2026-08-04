import { create } from "zustand";

// Danh sách trạm — nên thay bằng dữ liệu thật gọi từ backend API (GET /api/stations)
// thay vì hard-code, nhưng để mặc định "$__all" vẫn chạy đúng với biến $station của Grafana.
export const STATIONS = [
  "Cam Le", "Dong Giang", "Ha Lam", "Hoa Vang", "Hoi An", "Kham Duc",
  "Lien Chieu", "Ngu Hanh Son", "Quang Nam", "Que Son", "Son Tra",
  "Thanh Khe", "Thanh My", "Tien Phuoc", "Tra My",
];

export const useFilterStore = create((set, get) => ({
  selectedStations: ["$__all"], // giá trị đặc biệt của Grafana = chọn tất cả
  from: "now-24h",
  to: "now",
  refreshMs: 300000, // 5 phút — khớp "refresh": "5m" đã đặt trong dashboard JSON

  toggleAll: () =>
    set({ selectedStations: ["$__all"] }),

  toggleStation: (name) => {
    const cur = get().selectedStations.filter((s) => s !== "$__all");
    const next = cur.includes(name) ? cur.filter((s) => s !== name) : [...cur, name];
    set({ selectedStations: next.length ? next : ["$__all"] });
  },

  setTimeRange: (from, to) => set({ from, to }),
}));
