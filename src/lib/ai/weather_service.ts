/**
 * Weather and moon data service for observation scoring.
 * Fetches data from Open-Meteo API (same pattern as AstroWeather.tsx)
 * and computes moon conditions via suncalc.
 */

import axios from "axios";
import SunCalc from "suncalc";

import type { WeatherCondition, MoonCondition } from "./observation_scorer";
import {
  getProfileByName,
  type EquipmentProfile,
} from "./equipment_profiles";

// ---- Open-Meteo response shape ----

interface OpenMeteoHourly {
  cloudcover: number[];
  windspeed_10m: number[];
  relative_humidity_2m: number[];
}

interface OpenMeteoResponse {
  hourly: OpenMeteoHourly;
}

// ---- Weather fetching ----

/**
 * Fetch current weather conditions from Open-Meteo.
 * Returns data for the current hour.
 * @param proxyUrl - optional CORS proxy URL (same pattern as AstroWeather.tsx)
 */
export async function fetchCurrentWeather(
  lat: number,
  lon: number,
  proxyUrl?: string
): Promise<WeatherCondition> {
  let apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=cloudcover,windspeed_10m,relative_humidity_2m&forecast_days=1&timezone=auto`;

  if (proxyUrl) {
    apiUrl = `${proxyUrl}?target=${encodeURIComponent(apiUrl)}`;
  }

  const response = await axios.get<OpenMeteoResponse>(apiUrl);
  const hourly = response.data.hourly;
  const currentHour = new Date().getHours();

  return {
    cloudCoverPercent: hourly.cloudcover[currentHour] ?? 50,
    humidityPercent: hourly.relative_humidity_2m[currentHour] ?? 50,
    windSpeedKmh: hourly.windspeed_10m[currentHour] ?? 0,
  };
}

// ---- Moon condition ----

/**
 * Compute current moon conditions using suncalc.
 * Pure calculation — no API call.
 */
export function getCurrentMoonCondition(
  lat: number,
  lon: number,
  date: Date = new Date()
): MoonCondition {
  const illumination = SunCalc.getMoonIllumination(date);
  const position = SunCalc.getMoonPosition(date, lat, lon);

  // suncalc returns altitude in radians
  const altitudeDeg = position.altitude * (180 / Math.PI);

  return {
    illumination: illumination.fraction,
    altitudeDeg: Math.round(altitudeDeg * 10) / 10,
  };
}

// ---- Equipment resolution ----

/**
 * Resolve equipment profile from device type name.
 * Maps ConnectionContext.typeNameDwarf to an EquipmentProfile.
 */
export function resolveEquipmentProfile(
  typeNameDwarf: string
): EquipmentProfile | undefined {
  // ConnectionContext stores names like "DWARF II", "DWARF 3", "Dwarf" (default)
  if (typeNameDwarf.includes("3")) return getProfileByName("DWARF 3");
  if (typeNameDwarf.includes("II") || typeNameDwarf.includes("2"))
    return getProfileByName("DWARF II");
  // Unknown device type
  return undefined;
}
