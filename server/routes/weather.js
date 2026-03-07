import { Router } from "express";

const router = Router();

/**
 * GET /api/weather?city=...
 * Returns mock or real weather (use free Open-Meteo API)
 */
router.get("/", async (req, res) => {
  const city = (req.query.city || "").trim();
  if (!city) {
    return res.status(400).json({ error: "city query required" });
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const geoRes = await fetch(url);
    const geoData = await geoRes.json();
    const loc = geoData.results?.[0];
    if (!loc) {
      return res.json({
        city,
        tempC: 20,
        condition: "Unknown",
      });
    }

    const lat = loc.latitude;
    const lon = loc.longitude;
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
    const wRes = await fetch(weatherUrl);
    const wData = await wRes.json();
    const current = wData.current;
    const code = current?.weather_code ?? 0;
    const conditionMap = {
      0: "Clear",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Foggy",
      61: "Light rain",
      63: "Rain",
      65: "Heavy rain",
      71: "Light snow",
      73: "Snow",
      75: "Heavy snow",
      80: "Showers",
      95: "Thunderstorm",
    };

    res.json({
      city: loc.name,
      tempC: Math.round(current?.temperature_2m ?? 20),
      condition: conditionMap[code] || "Unknown",
    });
  } catch (err) {
    console.error("[weather]", err);
    res.json({
      city,
      tempC: 20,
      condition: "Unknown",
    });
  }
});

export default router;
