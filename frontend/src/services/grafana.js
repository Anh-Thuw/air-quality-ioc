import { GRAFANA_BASE_URL } from "../config/panels.config";

export function buildPanelUrl({
  uid,
  slug,
  panelId,
  datasourceUid,
  stations = ["$__all"],
  from = "now-24h",
  to = "now",
}) {
  const params = new URLSearchParams({
    orgId: "1",
    panelId: String(panelId),
    theme: "dark",
    timezone: "browser",
    refresh: "5m",
    from,
    to,
  });

  if (datasourceUid) {
    params.append("var-DS_POSTGRESQL", datasourceUid);
  }

  stations.forEach((station) => {
    params.append("var-station", station);
  });

  return `${GRAFANA_BASE_URL}/d-solo/${uid}/${slug}?${params.toString()}`;
}