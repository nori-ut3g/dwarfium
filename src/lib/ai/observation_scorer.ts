/**
 * Observation scorer: rates target × conditions → 0-100 score.
 * Pure functions, no external API calls.
 */

import type { EquipmentProfile } from "./equipment_profiles";

// ---- Input types ----

// Known categories from data/objectTypes.js
export type DsoTypeCategory =
  | "galaxies"
  | "nebulae"
  | "clusters"
  | "stars"
  | "moon_planets"
  | "asteroids"
  | "comet"
  | "duplicate"
  | "nonexistent"
  | "other"
  | "mosaic";

export interface TargetInfo {
  /** Visual magnitude (null if unknown) */
  magnitude: number | null;
  /** Angular size in arcminutes (null if point source) */
  angularSizeArcmin: number | null;
  /** DSO type category */
  typeCategory: DsoTypeCategory;
}

export interface TargetPosition {
  /** Altitude above horizon in degrees */
  altitudeDeg: number;
  /** Azimuth in degrees */
  azimuthDeg: number;
}

export interface MoonCondition {
  /** Moon illumination fraction 0.0 - 1.0 */
  illumination: number;
  /** Moon altitude in degrees (negative = below horizon) */
  altitudeDeg: number;
}

export interface WeatherCondition {
  /** Cloud cover percentage 0-100 */
  cloudCoverPercent: number;
  /** Relative humidity percentage 0-100 */
  humidityPercent: number;
  /** Wind speed in km/h */
  windSpeedKmh: number;
}

// ---- Output types ----

export type RecommendationCode =
  | "excellent"
  | "good_weather_issue"
  | "good_moon_issue"
  | "good_low_alt"
  | "good"
  | "challenging"
  | "below_horizon"
  | "poor_weather"
  | "marginal"
  | "too_faint"
  | "poor";

export interface ObservationScore {
  /** Overall score 0-100 */
  overall: number;
  factors: {
    /** Target altitude score 0-100 */
    altitude: number;
    /** Moon impact score 0-100 (100 = no impact) */
    moonImpact: number;
    /** Weather conditions score 0-100 */
    weather: number;
    /** Target difficulty score 0-100 (100 = easy target) */
    targetDifficulty: number;
  };
  /** Short recommendation text (English) */
  recommendation: string;
  /** Stable code for i18n lookup */
  recommendationCode: RecommendationCode;
}

// ---- Scoring weights ----

const WEIGHTS = {
  altitude: 0.30,
  moonImpact: 0.20,
  weather: 0.30,
  targetDifficulty: 0.20,
};

// ---- Scoring functions ----

/**
 * Score based on target altitude.
 * Higher altitude = less atmospheric extinction = better.
 */
export function scoreAltitude(altitudeDeg: number): number {
  if (altitudeDeg <= 0) return 0;
  if (altitudeDeg >= 70) return 100;

  // Optimal range: 40-70 degrees
  if (altitudeDeg >= 40) return 85 + (altitudeDeg - 40) * (15 / 30);

  // Usable range: 15-40 degrees
  if (altitudeDeg >= 15) return 30 + (altitudeDeg - 15) * (55 / 25);

  // Low altitude: 0-15 degrees — poor due to atmospheric extinction
  return (altitudeDeg / 15) * 30;
}

/**
 * Score the impact of moonlight on observations.
 * Depends on moon illumination and altitude, plus target type.
 */
export function scoreMoonImpact(
  moon: MoonCondition,
  typeCategory: DsoTypeCategory
): number {
  // Moon below horizon = no impact
  if (moon.altitudeDeg <= 0) return 100;

  // Clusters/stars are less affected by moonlight than faint nebulae/galaxies
  const sensitivity =
    typeCategory === "clusters" || typeCategory === "stars" ? 0.5 : 1.0;

  // Base moon impact: illumination * how high the moon is
  const moonAltFactor = Math.min(moon.altitudeDeg / 45, 1.0);
  const impact = moon.illumination * moonAltFactor * sensitivity;

  return Math.round(Math.max(0, (1 - impact) * 100));
}

/**
 * Score weather conditions for astronomical observation.
 */
export function scoreWeather(weather: WeatherCondition): number {
  // Cloud cover is the primary factor
  const cloudScore = Math.max(0, 100 - weather.cloudCoverPercent);

  // High humidity causes dew and poor seeing
  let humidityPenalty = 0;
  if (weather.humidityPercent > 80) {
    humidityPenalty = (weather.humidityPercent - 80) * 1.5;
  }

  // Wind causes vibration and poor tracking
  let windPenalty = 0;
  if (weather.windSpeedKmh > 20) {
    windPenalty = Math.min(30, (weather.windSpeedKmh - 20) * 1.0);
  }

  return Math.round(Math.max(0, Math.min(100, cloudScore - humidityPenalty - windPenalty)));
}

/**
 * Score target difficulty based on magnitude, size, type, and equipment.
 * Returns 100 for easy targets, 0 for impossible ones.
 */
export function scoreTargetDifficulty(
  target: TargetInfo,
  equipment: EquipmentProfile
): number {
  let score = 100;

  // Magnitude check
  if (target.magnitude !== null) {
    if (target.magnitude > equipment.limitingMagnitude) {
      // Too faint for this equipment
      return 0;
    }

    // Bright objects are easier
    if (target.magnitude <= 4) {
      score = 100;
    } else if (target.magnitude <= 8) {
      score = 90 - (target.magnitude - 4) * 5;
    } else if (target.magnitude <= 12) {
      score = 70 - (target.magnitude - 8) * 10;
    } else {
      score = 30 - (target.magnitude - 12) * 7.5;
    }
  } else {
    // Unknown magnitude — assume moderate difficulty
    score = 50;
  }

  // Size considerations
  if (target.angularSizeArcmin !== null) {
    const fovMin = Math.min(equipment.fovWidthDeg, equipment.fovHeightDeg) * 60;

    if (target.angularSizeArcmin > fovMin * 2) {
      // Much larger than FOV — need mosaic, harder
      score = Math.max(0, score - 20);
    } else if (target.angularSizeArcmin > fovMin) {
      // Larger than FOV — partially visible
      score = Math.max(0, score - 10);
    } else if (target.angularSizeArcmin < 1) {
      // Very small — harder to resolve
      score = Math.max(0, score - 15);
    }
  }

  // Planets/Moon are bright but require different technique
  if (target.typeCategory === "moon_planets") {
    score = Math.min(score, 60);
  }

  return Math.round(Math.max(0, Math.min(100, score)));
}

interface RecommendationResult {
  text: string;
  code: RecommendationCode;
}

/**
 * Generate a recommendation based on scores.
 * Returns both a human-readable text and a stable code for i18n.
 */
export function generateRecommendation(
  overall: number,
  factors: ObservationScore["factors"],
  altitudeDeg: number
): RecommendationResult {
  // Priority checks: these conditions override any overall score
  if (altitudeDeg <= 0) return { text: "Target is below the horizon.", code: "below_horizon" };
  if (factors.targetDifficulty === 0) return { text: "Target is too faint for this equipment.", code: "too_faint" };

  if (overall >= 80) return { text: "Excellent conditions. Highly recommended.", code: "excellent" };
  if (overall >= 60) {
    if (factors.weather < 50) return { text: "Good target, but weather may interfere.", code: "good_weather_issue" };
    if (factors.moonImpact < 50) return { text: "Good target, but moonlight will reduce contrast.", code: "good_moon_issue" };
    if (factors.altitude < 50) return { text: "Good target, wait for higher altitude.", code: "good_low_alt" };
    return { text: "Good conditions for observation.", code: "good" };
  }
  if (overall >= 40) {
    if (factors.targetDifficulty < 30) return { text: "Challenging target for this equipment.", code: "challenging" };
    if (factors.weather < 30) return { text: "Poor weather conditions. Consider postponing.", code: "poor_weather" };
    return { text: "Marginal conditions. Results may vary.", code: "marginal" };
  }
  return { text: "Poor conditions. Not recommended.", code: "poor" };
}

/**
 * Calculate the overall observation score.
 */
export function calculateObservationScore(
  target: TargetInfo,
  position: TargetPosition,
  moon: MoonCondition,
  weather: WeatherCondition,
  equipment: EquipmentProfile
): ObservationScore {
  const factors = {
    altitude: scoreAltitude(position.altitudeDeg),
    moonImpact: scoreMoonImpact(moon, target.typeCategory),
    weather: scoreWeather(weather),
    targetDifficulty: scoreTargetDifficulty(target, equipment),
  };

  const overall = Math.round(
    factors.altitude * WEIGHTS.altitude +
    factors.moonImpact * WEIGHTS.moonImpact +
    factors.weather * WEIGHTS.weather +
    factors.targetDifficulty * WEIGHTS.targetDifficulty
  );

  const { text: recommendation, code: recommendationCode } = generateRecommendation(
    overall,
    factors,
    position.altitudeDeg
  );

  // Clamp overall for hard-stop conditions so UI colors match recommendation
  const displayOverall =
    recommendationCode === "below_horizon" || recommendationCode === "too_faint"
      ? 0
      : overall;

  return { overall: displayOverall, factors, recommendation, recommendationCode };
}
