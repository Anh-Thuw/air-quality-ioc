import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../config/panels.config";

const styles = {
  sidebar: {
    width: 248, flex: "none", background: "var(--bg-raise)",
    borderRight: "1px solid var(--border-soft)", display: "flex",
    flexDirection: "column", padding: "20px 14px",
  },
  brand: { padding: "2px 8px 22px", borderBottom: "1px solid var(--border-soft)", marginBottom: 16 },
  glyph: {
    width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg, var(--cyan), #1789A0)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "var(--mono)", fontWeight: 700, fontSize: 12, color: "#00171C",
  },
  navItem: (active) => ({
    display: "flex", gap: 10, padding: "10px 10px", borderRadius: 8, cursor: "pointer",
    color: active ? "var(--cyan)" : "var(--text-dim)", textDecoration: "none",
    background: active ? "var(--cyan-dim)" : "transparent",
    border: `1px solid ${active ? "rgba(45,212,232,.25)" : "transparent"}`,
    marginBottom: 3,
  }),
  legendChip: (color) => ({ width: 10, height: 10, borderRadius: 3, background: color, flex: "none" }),
};

const AQI_LEGEND = [
  ["var(--aqi-good)", "0–50 · Tốt"],
  ["var(--aqi-moderate)", "51–100 · Trung bình"],
  ["var(--aqi-sensitive)", "101–150 · Nhạy cảm"],
  ["var(--aqi-unhealthy)", "151–200 · Có hại"],
  ["var(--aqi-very)", "201–300 · Rất có hại"],
];

export default function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={styles.glyph}>IOC</div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Không khí & Thời tiết</div>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--mono)", paddingLeft: 34 }}>
          Đà Nẵng · Quảng Nam
        </div>
      </div>

      <nav>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.key} to={item.path} style={({ isActive }) => styles.navItem(isActive)}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600, opacity: 0.8, paddingTop: 1 }}>
              {item.num}
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.35 }}>{item.label}</div>
              <div style={{ fontSize: 10.5, color: "var(--text-faint)", marginTop: 2 }}>{item.sub}</div>
            </div>
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--border-soft)" }}>
        <div style={{ fontSize: 10.5, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8, fontWeight: 600 }}>
          Thang AQI (US)
        </div>
        {AQI_LEGEND.map(([color, label]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--text-dim)", padding: "3px 0" }}>
            <span style={styles.legendChip(color)} /> {label}
          </div>
        ))}
      </div>
    </aside>
  );
}
