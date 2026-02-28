/**
 * Tonight's Best — ranks DSO targets for current observing session.
 * Iterates the catalog, computes alt/az, scores each, returns top N.
 */

import type { AstroObject } from "@/types";
import type {
  WeatherCondition,
  MoonCondition,
  DsoTypeCategory,
} from "./observation_scorer";
import { calculateObservationScore } from "./observation_scorer";
import type { EquipmentProfile } from "./equipment_profiles";
import { computeRaDecToAltAz } from "@/lib/astro_utils";
import {
  convertHMSToDecimalDegrees,
  convertDMSToDecimalDegrees,
} from "@/lib/math_utils";
import { toIsoStringInLocalTime } from "@/lib/date_utils";

export interface RankedTarget {
  object: AstroObject;
  score: number;
  altitudeDeg: number;
  azimuthDeg: number;
  recommendation: string;
}

export interface RankOptions {
  /** Maximum number of results (default 20) */
  limit?: number;
  /** Minimum altitude to include (default 10) */
  minAltitudeDeg?: number;
  /** Minimum score to include (default 0) */
  minScore?: number;
}

function parseObjectMagnitude(mag: string | number | null): number | null {
  if (mag === null || mag === undefined) return null;
  const num = typeof mag === "string" ? parseFloat(mag) : mag;
  return isNaN(num) ? null : num;
}

function parseAngularSize(sizeStr?: string): number | null {
  if (!sizeStr) return null;
  const match = sizeStr.match(/^([\d.]+)/);
  return match ? parseFloat(match[1]) : null;
}

/**
 * Rank DSO targets for tonight based on current conditions.
 * Objects below minAltitude are excluded.
 */
export function rankTargetsForTonight(
  objects: AstroObject[],
  lat: number,
  lon: number,
  timezone: string | undefined,
  weather: WeatherCondition,
  moon: MoonCondition,
  equipment: EquipmentProfile,
  options: RankOptions = {}
): RankedTarget[] {
  const { limit = 20, minAltitudeDeg = 10, minScore = 0 } = options;
  const now = new Date();
  const dateStr = toIsoStringInLocalTime(now);

  const ranked: RankedTarget[] = [];

  for (const obj of objects) {
    // Skip objects without coordinates
    if (!obj.ra || !obj.dec) continue;

    const raDecimal = convertHMSToDecimalDegrees(obj.ra);
    const decDecimal = convertDMSToDecimalDegrees(obj.dec);
    if (isNaN(raDecimal) || isNaN(decDecimal)) continue;

    const altAz = computeRaDecToAltAz(
      lat,
      lon,
      raDecimal,
      decDecimal,
      dateStr,
      timezone
    );
    if (!altAz || altAz.alt < minAltitudeDeg) continue;

    const magnitude = parseObjectMagnitude(obj.magnitude);

    const score = calculateObservationScore(
      {
        magnitude,
        angularSizeArcmin: parseAngularSize(obj.size),
        typeCategory: (obj.typeCategory || "other") as DsoTypeCategory,
      },
      { altitudeDeg: altAz.alt, azimuthDeg: altAz.az },
      moon,
      weather,
      equipment
    );

    if (score.overall < minScore) continue;

    ranked.push({
      object: obj,
      score: score.overall,
      altitudeDeg: Math.round(altAz.alt * 10) / 10,
      azimuthDeg: Math.round(altAz.az * 10) / 10,
      recommendation: score.recommendation,
    });
  }

  // Sort by score descending
  ranked.sort((a, b) => b.score - a.score);

  return ranked.slice(0, limit);
}
