/**
 * Hook that aggregates weather, moon, and equipment data for observation scoring.
 * Provides all inputs needed by calculateObservationScore().
 */

import { useContext, useEffect, useRef, useState, useCallback } from "react";

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
  refresh: () => void;
}

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function useObservationData(): ObservationData {
  const connectionCtx = useContext(ConnectionContext);
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  const [moon, setMoon] = useState<MoonCondition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<number>(0);
  const lastLocationRef = useRef<string>("");

  const lat = connectionCtx.latitude;
  const lon = connectionCtx.longitude;
  const deviceName = connectionCtx.typeNameDwarf;

  // Resolve equipment profile (synchronous)
  const equipment = deviceName ? resolveEquipmentProfile(deviceName) ?? null : null;

  const fetchData = useCallback((latitude: number, longitude: number, force = false) => {
    const locationKey = `${latitude},${longitude}`;
    const locationChanged = locationKey !== lastLocationRef.current;
    const now = Date.now();

    // Skip if cache is still valid for the same location
    if (!force && !locationChanged && now - lastFetchRef.current < CACHE_TTL_MS && weather !== null) {
      return;
    }

    // Invalidate cache on location change
    if (locationChanged) {
      lastLocationRef.current = locationKey;
    }

    setLoading(true);
    setError(null);

    // Moon condition is synchronous (suncalc)
    const moonData = getCurrentMoonCondition(latitude, longitude);
    setMoon(moonData);

    // Weather is async (API call)
    const proxyUrl = connectionCtx.proxyIP
      ? getProxyUrl(connectionCtx) || undefined
      : undefined;

    const controller = new AbortController();

    fetchCurrentWeather(latitude, longitude, proxyUrl)
      .then((data) => {
        if (!controller.signal.aborted) {
          setWeather(data);
          lastFetchRef.current = Date.now();
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error("Failed to fetch weather data:", err);
          setError("Failed to fetch weather data");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return controller;
  }, [weather, connectionCtx.proxyIP]);

  useEffect(() => {
    if (lat == null || lon == null) return;

    const controller = fetchData(lat, lon);

    // Cleanup: abort in-flight request on unmount or re-render
    return () => {
      controller?.abort();
    };
  }, [lat, lon, fetchData]);

  const refresh = useCallback(() => {
    if (lat != null && lon != null) {
      fetchData(lat, lon, true);
    }
  }, [lat, lon, fetchData]);

  return { weather, moon, equipment, loading, error, refresh };
}
