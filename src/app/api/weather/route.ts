import { NextRequest, NextResponse } from "next/server";

/**
 * Weather for "What to wear today?"
 * Uses Open-Meteo (no API key): geocoding + forecast
 */

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

function weatherCodeToCondition(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Partly cloudy";
  if (code <= 49) return "Fog";
  if (code <= 59) return "Drizzle";
  if (code <= 69) return "Rain";
  if (code <= 79) return "Snow";
  if (code <= 84) return "Rain showers";
  if (code <= 94) return "Snow showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city")?.trim();
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  let latitude: number;
  let longitude: number;
  let cityName = city ?? "Your area";

  if (lat != null && lon != null) {
    latitude = Number(lat);
    longitude = Number(lon);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return NextResponse.json(
        { error: "Invalid lat/lon" },
        { status: 400 }
      );
    }
  } else if (city) {
    const geoRes = await fetch(
      `${GEO_URL}?name=${encodeURIComponent(city)}&count=1`
    );
    const geoData = await geoRes.json();
    const first = geoData.results?.[0];
    if (!first) {
      return NextResponse.json(
        { error: "City not found" },
        { status: 404 }
      );
    }
    latitude = first.latitude;
    longitude = first.longitude;
    cityName = first.name ?? city;
  } else {
    return NextResponse.json(
      { error: "Provide city= or lat= and lon=" },
      { status: 400 }
    );
  }

  const weatherRes = await fetch(
    `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
  );
  const weatherData = await weatherRes.json();
  const current = weatherData.current;
  if (!current) {
    return NextResponse.json(
      { error: "Weather data unavailable" },
      { status: 502 }
    );
  }

  const tempC = Math.round(Number(current.temperature_2m) ?? 0);
  const condition = weatherCodeToCondition(Number(current.weather_code) ?? 0);

  return NextResponse.json({
    tempC,
    condition,
    city: cityName,
  });
}
