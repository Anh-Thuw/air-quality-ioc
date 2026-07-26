// Goi IQAir API (endpoint nearest_city) va tra ve du lieu day du 

const BASE_URL = "https://api.airvisual.com/v2/nearest_city";

export async function fetchStationData(station) {
  const apiKey = process.env.IQAIR_API_KEY;
  if (!apiKey) throw new Error("Chua thiet lap bien moi truong IQAIR_API_KEY");

  const url = `${BASE_URL}?lat=${station.lat}&lon=${station.lon}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (json.status !== "success") {
      return {
        name: station.name,
        status: "error",
        error: json.data?.message || json.status,
      };
    }

    const { data } = json;
    const pollution = data.current.pollution;
    const weather = data.current.weather;

    return {
      name: station.name,
      status: "success",
      city: data.city,
      state: data.state,
      country: data.country,
      location: data.location, // { coordinates: [lon, lat] }
      pollution: {
        ts: pollution.ts,
        aqius: pollution.aqius,
        mainus: pollution.mainus,
        aqicn: pollution.aqicn,
        maincn: pollution.maincn,
        p1: pollution.p1?.conc ?? null,
        p2: pollution.p2?.conc ?? null,
        o3: pollution.o3?.conc ?? null,
        n2: pollution.n2?.conc ?? null,
        s2: pollution.s2?.conc ?? null,
        co: pollution.co?.conc ?? null,
      },
      weather: {
        ts: weather.ts,
        tp: weather.tp,
        pr: weather.pr,
        hu: weather.hu,
        ws: weather.ws,
        wd: weather.wd,
        ic: weather.ic,
        heatIndex: weather.heatIndex ?? null,
      },
    };
  } catch (err) {
    return { name: station.name, status: "error", error: err.message };
  }
}