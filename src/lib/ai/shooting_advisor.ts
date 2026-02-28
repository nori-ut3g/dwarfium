/**
 * Shooting parameter advisor: recommends exposure, gain, and stack frames
 * based on target brightness, sky conditions, and equipment capabilities.
 * Pure functions, no external API calls.
 */

import type { EquipmentProfile } from "./equipment_profiles";
import type { DsoTypeCategory } from "./observation_scorer";
import { roundExposure } from "@/lib/math_utils";

// ---- Types ----

export type TargetBrightness = "bright" | "moderate" | "faint" | "very_faint";

export interface ShootingRecommendation {
  exposureSec: number;
  gain: number;
  stackFrames: number;
  totalIntegrationMin: number;
  brightness: TargetBrightness;
  notes: string;
}

// ---- Base exposure lookup ----

const BASE_EXPOSURE: Record<TargetBrightness, number> = {
  bright: 1,
  moderate: 5,
  faint: 10,
  very_faint: 15,
};

// ---- Target integration time in minutes ----

const TARGET_INTEGRATION_MIN: Record<TargetBrightness, number> = {
  bright: 15,
  moderate: 30,
  faint: 60,
  very_faint: 90,
};

// ---- Functions ----

/**
 * Classify a target by brightness based on its visual magnitude.
 * Brighter objects have lower magnitudes.
 */
export function classifyTargetBrightness(
  magnitude: number | null
): TargetBrightness {
  if (magnitude === null) return "very_faint";
  if (magnitude <= 4) return "bright";
  if (magnitude <= 8) return "moderate";
  if (magnitude <= 12) return "faint";
  return "very_faint";
}

/**
 * Recommend exposure time in seconds based on target brightness,
 * sky conditions, and equipment limits.
 *
 * Dark skies allow longer exposures; light-polluted skies need shorter
 * exposures to avoid washed-out backgrounds. Bright moon also requires
 * shorter exposures.
 */
export function recommendExposure(
  brightness: TargetBrightness,
  bortleClass: number,
  moonIllumination: number,
  maxExposureSec: number
): number {
  let exposure = BASE_EXPOSURE[brightness];

  // Dark sky (Bortle 1-3): can afford longer exposures
  if (bortleClass <= 3) {
    exposure *= 1.5;
  }

  // Light polluted sky (Bortle 7-9): shorter to avoid washed out frames
  if (bortleClass >= 7) {
    exposure *= 0.5;
  }

  // High moon illumination reduces effective exposure
  if (moonIllumination > 0.7) {
    exposure *= 0.7;
  }

  // Clamp to valid range
  exposure = Math.max(0.1, Math.min(exposure, maxExposureSec));

  return roundExposure(exposure);
}

/**
 * Recommend gain setting based on target brightness and equipment profile.
 * Brighter targets use lower gain; fainter targets need higher gain.
 */
export function recommendGain(
  brightness: TargetBrightness,
  equipment: EquipmentProfile
): number {
  const range = equipment.maxGain - equipment.minGain;

  let gain: number;
  switch (brightness) {
    case "bright":
      // Low gain for bright targets to avoid saturation
      gain = equipment.minGain + range * 0.1;
      break;
    case "moderate":
      gain = equipment.defaultGain;
      break;
    case "faint":
      gain = equipment.defaultGain + range * 0.2;
      break;
    case "very_faint":
      gain = equipment.defaultGain + range * 0.35;
      break;
  }

  // Clamp and round to nearest 10
  gain = Math.max(equipment.minGain, Math.min(gain, equipment.maxGain));
  gain = Math.round(gain / 10) * 10;

  return gain;
}

/**
 * Recommend number of stacking frames based on exposure time,
 * target brightness, and altitude above horizon.
 *
 * Low altitude targets need more frames to compensate for
 * atmospheric extinction and turbulence.
 */
export function recommendStackFrames(
  exposureSec: number,
  brightness: TargetBrightness,
  altitudeDeg: number
): number {
  let integrationMin = TARGET_INTEGRATION_MIN[brightness];

  // Low altitude: increase integration by 50% to compensate for extinction
  if (altitudeDeg < 30) {
    integrationMin *= 1.5;
  }

  const totalSec = integrationMin * 60;
  let frames = Math.round(totalSec / exposureSec);

  // Clamp to reasonable range
  frames = Math.max(10, Math.min(frames, 2000));

  return frames;
}

/**
 * Generate a brief human-readable note about the recommendation.
 */
function generateNotes(
  brightness: TargetBrightness,
  bortleClass: number,
  moonIllumination: number,
  altitudeDeg: number,
  typeCategory: DsoTypeCategory
): string {
  const parts: string[] = [];

  // Brightness context
  switch (brightness) {
    case "bright":
      parts.push("Bright target — use short exposures to avoid saturation.");
      break;
    case "moderate":
      parts.push("Moderate brightness — standard settings should work well.");
      break;
    case "faint":
      parts.push("Faint target — longer exposures and more frames needed.");
      break;
    case "very_faint":
      parts.push(
        "Very faint target — maximize exposure and stacking for best results."
      );
      break;
  }

  // Sky condition warnings
  if (bortleClass >= 7) {
    parts.push("Light-polluted sky — consider narrowband filters if available.");
  }
  if (moonIllumination > 0.7) {
    parts.push("Bright moon — shorter exposures to reduce sky glow.");
  }
  if (altitudeDeg < 30) {
    parts.push(
      "Low altitude — increased frames to compensate for atmospheric effects."
    );
  }

  // Type-specific tips
  if (typeCategory === "nebulae") {
    parts.push("Nebula target — stacking improves faint structure detail.");
  } else if (typeCategory === "galaxies") {
    parts.push("Galaxy target — maximize integration time for spiral arms.");
  } else if (typeCategory === "moon_planets") {
    parts.push("Planetary target — consider video mode for lucky imaging.");
  }

  return parts.join(" ");
}

/**
 * Recommend complete shooting parameters for a DSO target.
 * Orchestrates brightness classification, exposure, gain, and stacking.
 */
export function recommendShootingParams(
  target: { magnitude: number | null; typeCategory: DsoTypeCategory },
  conditions: {
    bortleClass: number;
    moonIllumination: number;
    altitudeDeg: number;
  },
  equipment: EquipmentProfile
): ShootingRecommendation {
  const brightness = classifyTargetBrightness(target.magnitude);

  const exposureSec = recommendExposure(
    brightness,
    conditions.bortleClass,
    conditions.moonIllumination,
    equipment.maxExposureSec
  );

  const gain = recommendGain(brightness, equipment);

  const stackFrames = recommendStackFrames(
    exposureSec,
    brightness,
    conditions.altitudeDeg
  );

  const totalIntegrationMin =
    Math.round(((exposureSec * stackFrames) / 60) * 10) / 10;

  const notes = generateNotes(
    brightness,
    conditions.bortleClass,
    conditions.moonIllumination,
    conditions.altitudeDeg,
    target.typeCategory
  );

  return {
    exposureSec,
    gain,
    stackFrames,
    totalIntegrationMin,
    brightness,
    notes,
  };
}
