/**
 * Hook that aggregates weather, moon, and equipment data for observation scoring.
 * Provides all inputs needed by calculateObservationScore().
 */

import { useContext, useEffect, useRef, useState } from "react";

import { ConnectionContext } from "@/stores/ConnectionContext";
import { getProxyUrl } from "@/lib/get_proxy_url";
import type { WeatherCondition, MoonCondition } from "@/lib/ai/observation_scorer";
import type { EquipmentProfile } from "@/lib/ai/equipment_profiles";
import {
  fetchCurrentWeather,
  getCurrentMoonCondition,
  resolveEquipmentProfile,
} from "@/lib/ai/weather_service";

export interface ObservationData {
  weather: WeatherCondition | null;
  moon: MoonCondition | null;
  equipment: EquipmentProfile | null;
  loading: boolean;
  error: string | null;
}

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function useObservationData(): ObservationData {
  const connectionCtx = useContext(ConnectionContext);
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  const [moon, setMoon] = useState<MoonCondition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<number>(0);

  const lat = connectionCtx.latitude;
  const lon = connectionCtx.longitude;
  const deviceName = connectionCtx.typeNameDwarf;

  // Resolve equipment profile (synchronous)
  const equipment = deviceName ? resolveEquipmentProfile(deviceName) ?? null : null;

  useEffect(() => {
    if (lat == null || lon == null) return;

    const now = Date.now();
    if (now - lastFetchRef.current < CACHE_TTL_MS && weather !== null) return;

    setLoading(true);
    setError(null);

    // Moon condition is synchronous (suncalc)
    const moonData = getCurrentMoonCondition(lat, lon);
    setMoon(moonData);

    // Weather is async (API call)
    const proxyUrl = connectionCtx.proxyIP
      ? getProxyUrl(connectionCtx) || undefined
      : undefined;

    fetchCurrentWeather(lat, lon, proxyUrl)
      .then((data) => {
        setWeather(data);
        lastFetchRef.current = Date.now();
      })
      .catch((err) => {
        console.error("Failed to fetch weather data:", err);
        setError("Failed to fetch weather data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [lat, lon]);

  return { weather, moon, equipment, loading, error };
}
