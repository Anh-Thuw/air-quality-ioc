import "dotenv/config";
import pool from "../../config/db.js";
import { fetchStationData } from "../services/iqairService.js";
import { toVNTimestamp } from "../utils/timeUtils.js";

// Danh sach tram da biet (tu ket qua quet luoi truoc do o Da Nang + Quang Nam cu)
const KNOWN_STATIONS = [
  { name: "Hoa Vang", lat: 15.98764, lon: 108.13893 },
  { name: "Cam Le", lat: 16.01771, lon: 108.20381 },
  { name: "Ngu Hanh Son", lat: 16.01618, lon: 108.25335 },
  { name: "Lien Chieu", lat: 16.07272, lon: 108.15815 },
  { name: "Thanh Khe", lat: 16.0706, lon: 108.19102 },
  { name: "Son Tra", lat: 16.06068, lon: 108.23256 },
  { name: "Kham Duc", lat: 15.44508, lon: 107.79337 },
  { name: "Tra My", lat: 15.33965, lon: 108.22065 },
  { name: "Tien Phuoc", lat: 15.48819, lon: 108.30736 },
  { name: "Dong Giang", lat: 15.58224, lon: 108.11422 },
  { name: "Thanh My", lat: 15.74889, lon: 107.83678 },
  { name: "Que Son", lat: 15.67356, lon: 108.2201 },
  { name: "Ha Lam", lat: 15.73871, lon: 108.35062 },
  { name: "Quang Nam", lat: 15.88853, lon: 108.25447 },
  { name: "Hoi An", lat: 15.87944, lon: 108.335 },
];

const DELAY_MS = 13000; // 13s giua moi lan goi - an toan duoi gioi han 5 request/phut cua goi Community

async function upsertStation(client, station) {
  const res = await client.query(
    `INSERT INTO stations (name, city, state, country, latitude, longitude)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (name) DO UPDATE SET
       city = EXCLUDED.city,
       state = EXCLUDED.state,
       country = EXCLUDED.country,
       latitude = EXCLUDED.latitude,
       longitude = EXCLUDED.longitude
     RETURNING id`,
    [station.name, station.city, station.state, station.country, station.lat, station.lon]
  );
  return res.rows[0].id;
}

async function insertPollutionReading(client, stationId, pollution) {
  await client.query(
    `INSERT INTO pollution_readings
       (station_id, ts, ts_vn, aqius, mainus, aqicn, maincn, p1, p2, o3, n2, s2, co)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [
      stationId,
      pollution.ts,
      toVNTimestamp(pollution.ts),
      pollution.aqius,
      pollution.mainus,
      pollution.aqicn,
      pollution.maincn,
      pollution.p1,
      pollution.p2,
      pollution.o3,
      pollution.n2,
      pollution.s2,
      pollution.co,
    ]
  );
}

async function insertWeatherReading(client, stationId, weather) {
  await client.query(
    `INSERT INTO weather_readings
       (station_id, ts, ts_vn, tp, pr, hu, ws, wd, ic, heat_index)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      stationId,
      weather.ts,
      toVNTimestamp(weather.ts),
      weather.tp,
      weather.pr,
      weather.hu,
      weather.ws,
      weather.wd,
      weather.ic,
      weather.heatIndex,
    ]
  );
}

async function logFetch(client, stationId, status, calledAtVN) {
  await client.query(
    `INSERT INTO api_fetch_logs (station_id, called_at, status) VALUES ($1, $2, $3)`,
    [stationId, calledAtVN, status]
  );
}

async function processStation(client, stationInput) {
  const calledAtVN = toVNTimestamp(new Date().toISOString()); // Gio VN chinh xac luc goi API nay
  const result = await fetchStationData(stationInput);

  if (result.status !== "success") {
    console.log(`✘ ${stationInput.name}: ${result.error}`);
    await logFetch(client, null, result.error || "error", calledAtVN);
    return;
  }

  const stationId = await upsertStation(client, {
    name: stationInput.name,
    city: result.city,
    state: result.state,
    country: result.country,
    lat: result.location.coordinates[1],
    lon: result.location.coordinates[0],
  });

  await insertPollutionReading(client, stationId, result.pollution);
  await insertWeatherReading(client, stationId, result.weather);
  await logFetch(client, stationId, "success", calledAtVN);

  console.log(
    `✔ [Gio chay VN: ${calledAtVN}] ${stationInput.name}: AQI(US)=${result.pollution.aqius}, Nhiet do=${result.weather.tp}°C, Do am=${result.weather.hu}%`
  );
}

(async () => {
  const client = await pool.connect();
  try {
    console.log("Dang lay du lieu AQI va ghi vao Supabase Postgres...\n");
    for (const station of KNOWN_STATIONS) {
      await processStation(client, station);
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
    console.log("\n✅ Hoan tat toan bo.");
  } catch (err) {
    console.error("Loi trong qua trinh chay:", err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();