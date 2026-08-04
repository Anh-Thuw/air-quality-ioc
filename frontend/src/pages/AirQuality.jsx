import Topbar from "../components/Topbar";
import GrafanaPanel from "../components/GrafanaPanel";
import { DASHBOARDS } from "../config/panels.config";

export default function AirQuality() {
  const { uid, title, subtitle, panels } = DASHBOARDS.air;
  return (
    <>
      <Topbar title={title} subtitle={subtitle} />
      <div className="grid">
        {Object.entries(panels).map(([key, p]) => (
          <GrafanaPanel key={key} uid={uid} panelId={p.id} title={p.title} type={p.type} span={p.span} />
        ))}
      </div>
    </>
  );
}
