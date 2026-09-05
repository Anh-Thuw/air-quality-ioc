import pool from "../../config/db.js";
import { getAqiLevelVN, getAqiBucket4, ACTIVE_THRESHOLD_MINUTES } from "../utils/aqiHelper.js";

export async function getOverview(req, res) {
  try {
    // Lay du lieu moi nhat (AQI + thoi tiet) cua tung tram bang LATERAL JOIN
    const { rows: stationRows } = await pool.query(`
      SELECT
        s.id, s.name, s.state,
        p.aqius, p.aqicn, p.mainus, p.fetched_at AS pollution_fetched_at,
        w.tp, w.hu, w.ws, w.wd, w.pr, w.heat_index
      FROM stations s
      LEFT JOIN LATERAL (
        SELECT aqius, aqicn, mainus, fetched_at FROM pollution_readings pr
        WHERE pr.station_id = s.id ORDER BY pr.ts_vn DESC LIMIT 1
      ) p ON true
      LEFT JOIN LATERAL (
        SELECT tp, hu, ws, wd, pr, heat_index FROM weather_readings wr
        WHERE wr.station_id = s.id ORDER BY wr.ts_vn DESC LIMIT 1
      ) w ON true
      ORDER BY s.name
    `);

    const now = Date.now();
    const isOnline = (fetchedAt) =>
      fetchedAt && now - new Date(fetchedAt).getTime() < ACTIVE_THRESHOLD_MINUTES * 60000;

    const enriched = stationRows.map((r) => ({
      id: r.id,
      name: r.name,
      state: r.state,
      aqius: r.aqius,
      aqicn: r.aqicn,
      temperature: r.tp,
      humidity: r.hu,
      windSpeed: r.ws,
      windDirection: r.wd,
      pressure: r.pr,
      heatIndex: r.heat_index,
      mainPollutant: r.mainus,
      online: isOnline(r.pollution_fetched_at),
      updatedAt: r.pollution_fetched_at,
      latitude: r.latitude,
      longitude: r.longitude,
    }));

    // --- summary ---
    const onlineStations = enriched.filter((s) => s.online).length;
    const totalStations = enriched.length;
    const validAqiUs = enriched.filter((s) => s.aqius != null).map((s) => s.aqius);
    const validAqiCn = enriched.filter((s) => s.aqicn != null).map((s) => s.aqicn);
    const validTemp = enriched.filter((s) => s.temperature != null).map((s) => s.temperature);

    const avg = (arr) => (arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null);
    const averageAqiUs = avg(validAqiUs);
    const averageAqiCn = avg(validAqiCn);
    const averageTemperature = avg(validTemp);

    // --- statusDistribution (4 nhom) ---
    const statusDistribution = { good: 0, moderate: 0, sensitive: 0, unhealthy: 0, total: totalStations };
    enriched.forEach((s) => {
      const bucket = getAqiBucket4(s.aqius);
      if (bucket !== "unknown") statusDistribution[bucket]++;
    });

    // --- lay them toa do cho map (query rieng vi query tren khong join stations lat/lng) ---
    const { rows: coordRows } = await pool.query(`SELECT id, latitude, longitude FROM stations`);
    const coordMap = Object.fromEntries(coordRows.map((r) => [r.id, r]));

    const map = enriched.map((s) => ({
      id: s.id,
      name: s.name,
      lat: Number(coordMap[s.id]?.latitude),
      lng: Number(coordMap[s.id]?.longitude),
      aqius: s.aqius,
      aqicn: s.aqicn,
      temperature: s.temperature,
      humidity: s.humidity,
      windSpeed: s.windSpeed,
      windDirection: s.windDirection,
      pressure: s.pressure,
      heatIndex: s.heatIndex,
      mainPollutant: s.mainPollutant,
      online: s.online,
      updatedAt: s.updatedAt,
    }));

    const trend = enriched.map((s) => ({ stationId: s.id, stationName: s.name, aqius: s.aqius }));

    const lastUpdated = enriched.reduce((latest, s) => {
      if (!s.updatedAt) return latest;
      return !latest || new Date(s.updatedAt) > new Date(latest) ? s.updatedAt : latest;
    }, null);

    res.json({
      summary: {
        totalStations,
        onlineStations,
        offlineStations: totalStations - onlineStations,
        onlineRate: totalStations ? Math.round((onlineStations / totalStations) * 1000) / 10 : 0,
        averageAqiUs,
        averageAqiCn,
        averageTemperature,
        aqiUsLevel: getAqiLevelVN(averageAqiUs),
        aqiCnLevel: getAqiLevelVN(averageAqiCn),
      },
      stations: enriched.map(({ latitude, longitude, ...rest }) => rest),
      map,
      trend,
      statusDistribution,
      meta: {
        lastUpdated,
        timezone: "Asia/Ho_Chi_Minh",
        totalStations,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}