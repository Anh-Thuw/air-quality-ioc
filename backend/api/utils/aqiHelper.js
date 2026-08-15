export function getAqiLevelAndColor(aqius) {
    if (aqius == null) return { level: "unknown", color: "#999999" };
    if (aqius <= 50) return { level: "good", color: "#00e400" };
    if (aqius <= 100) return { level: "moderate", color: "#ffff00" };
    if (aqius <= 150) return { level: "unhealthy_sensitive", color: "#ff7e00" };
    if (aqius <= 200) return { level: "unhealthy", color: "#ff0000" };
    if (aqius <= 300) return { level: "very_unhealthy", color: "#8f3f97" };
    return { level: "hazardous", color: "#7e0023" };
}


export const ACTIVE_THRESHOLD_MINUTES = 120;