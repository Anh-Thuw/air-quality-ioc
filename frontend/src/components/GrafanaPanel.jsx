import { useEffect, useState } from "react";
import { buildPanelUrl } from "../services/grafana";
import { useFilterStore } from "../store/useFilterStore";

/**
 * Card bọc 1 panel Grafana thật (iframe d-solo).
 * type: "chart" | "table" -> render iframe cao hơn.
 * type: "stat" -> vẫn dùng iframe (Grafana tự vẽ số + sparkline nền),
 *   card sẽ thấp hơn qua CSS min-height.
 */
export default function GrafanaPanel({ uid, panelId, title, type = "chart", span }) {
  const { selectedStations, from, to } = useFilterStore();
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [uid, panelId, selectedStations, from, to]);

  const src = buildPanelUrl({ uid, panelId, stations: selectedStations, from, to });
  const height = type === "table" ? 260 : type === "stat" ? 110 : 190;

  return (
    <div className={`card ${span ? `span-${span}` : ""}`}>
      <div className="card-head">
        <span className="card-title">{title.toUpperCase()}</span>
        <span className="badge">panel {panelId}</span>
      </div>
      <div className="chart-slot" style={{ minHeight: height }}>
        {!failed && (
          <iframe
            src={src}
            title={title}
            loading="lazy"
            onError={() => setFailed(true)}
          />
        )}
        {failed && (
          <div className="fallback">
            Không tải được panel — kiểm tra đăng nhập Grafana hoặc cấu hình embedding
          </div>
        )}
      </div>
    </div>
  );
}
