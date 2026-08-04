import { useState } from "react";
import { STATIONS, useFilterStore } from "../store/useFilterStore";

const TIME_RANGES = [
  { label: "6 giờ qua", from: "now-6h" },
  { label: "24 giờ qua", from: "now-24h" },
  { label: "7 ngày qua", from: "now-7d" },
];

export default function Topbar({ title, subtitle }) {
  const { selectedStations, toggleAll, toggleStation, from, setTimeRange } = useFilterStore();
  const [openStations, setOpenStations] = useState(false);
  const [openTime, setOpenTime] = useState(false);

  const stationLabel = selectedStations.includes("$__all")
    ? "Tất cả"
    : selectedStations.length === 1
    ? selectedStations[0]
    : `${selectedStations.length} trạm`;

  const timeLabel = TIME_RANGES.find((t) => t.from === from)?.label || from;

  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 20, marginBottom: 22, flexWrap: "wrap" }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.01em" }}>{title}</div>
        <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginTop: 4 }}>{subtitle}</div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", position: "relative" }}>
        {/* Station filter */}
        <div style={{ position: "relative" }}>
          <button className="pill-btn" onClick={() => setOpenStations((v) => !v)} style={pillStyle}>
            Trạm quan trắc&nbsp;<b>{stationLabel}</b>
          </button>
          {openStations && (
            <div style={popStyle}>
              <label style={optStyle}>
                <input type="checkbox" checked={selectedStations.includes("$__all")} onChange={toggleAll} />
                Tất cả trạm
              </label>
              {STATIONS.map((s) => (
                <label key={s} style={optStyle}>
                  <input
                    type="checkbox"
                    checked={selectedStations.includes(s)}
                    onChange={() => toggleStation(s)}
                  />
                  {s}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Time range filter */}
        <div style={{ position: "relative" }}>
          <button className="pill-btn" onClick={() => setOpenTime((v) => !v)} style={pillStyle}>
            Khoảng thời gian&nbsp;<b>{timeLabel}</b>
          </button>
          {openTime && (
            <div style={{ ...popStyle, width: 160 }}>
              {TIME_RANGES.map((t) => (
                <div
                  key={t.from}
                  style={optStyle}
                  onClick={() => {
                    setTimeRange(t.from, "now");
                    setOpenTime(false);
                  }}
                >
                  {t.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ ...pillStyle, color: "var(--cyan)", borderColor: "rgba(45,212,232,.25)" }}>
          Tự động làm mới · 5m
        </div>
      </div>
    </div>
  );
}

const pillStyle = {
  display: "flex", alignItems: "center", gap: 7, background: "var(--panel)",
  border: "1px solid var(--border)", padding: "8px 12px", borderRadius: 8,
  fontSize: 12, color: "var(--text-dim)", cursor: "pointer",
};
const popStyle = {
  position: "absolute", top: "calc(100% + 6px)", right: 0, width: 220,
  background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 10,
  padding: 10, zIndex: 20, maxHeight: 260, overflowY: "auto",
  boxShadow: "0 12px 30px rgba(0,0,0,.5)",
};
const optStyle = {
  display: "flex", alignItems: "center", gap: 8, padding: "6px 8px",
  borderRadius: 6, fontSize: 12, cursor: "pointer", color: "var(--text-dim)",
};
