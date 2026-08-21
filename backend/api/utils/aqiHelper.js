
export function getAqiLevelAndColor(aqius) {
    if (aqius == null) return { level: "unknown", color: "#999999" };
    if (aqius <= 50) return { level: "good", color: "#00E400" };
    if (aqius <= 100) return { level: "moderate", color: "#FFFF00" };
    if (aqius <= 150) return { level: "unhealthy_sensitive", color: "#FF7E00" };
    if (aqius <= 200) return { level: "unhealthy", color: "#FF0000" };
    if (aqius <= 300) return { level: "very_unhealthy", color: "#8F3F97" };
    return { level: "hazardous", color: "#7E0023" };
}

export function getAqiLevelVN(aqius) {
    if (aqius == null) return "Không rõ";
    if (aqius <= 50) return "Tốt";
    if (aqius <= 100) return "Trung bình";
    if (aqius <= 150) return "Nhạy cảm";
    if (aqius <= 200) return "Có hại";
    if (aqius <= 300) return "Rất có hại";
    return "Nguy hiểm";
}

export function getAqiBucket4(aqius) {
    if (aqius == null) return "unknown";
    if (aqius <= 50) return "good";
    if (aqius <= 100) return "moderate";
    if (aqius <= 150) return "sensitive";
    return "unhealthy";
}


export function getPollutantLabel(code) {
    const map = { p1: "PM10", p2: "PM2.5", o3: "O3", n2: "NO2", s2: "SO2", co: "CO" };
    return map[code] || code;
}

export const ACTIVE_THRESHOLD_MINUTES = 120;