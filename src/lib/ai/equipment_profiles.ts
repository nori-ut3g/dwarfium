/**
 * Equipment profiles for DWARF telescope models.
 * Used by observation_scorer and future shooting_advisor.
 */

export interface EquipmentProfile {
  name: string;
  apertureMm: number;
  focalLengthMm: number;
  sensorWidthMm: number;
  sensorHeightMm: number;
  pixelSizeUm: number;
  resolutionWidth: number;
  resolutionHeight: number;
  // Field of view in degrees
  fovWidthDeg: number;
  fovHeightDeg: number;
  // Limiting magnitude for point sources (approximate)
  limitingMagnitude: number;
  // Maximum recommended exposure in seconds
  maxExposureSec: number;
  // Gain range for the sensor
  minGain: number;
  maxGain: number;
  defaultGain: number;
}

// IMX415: 3840x2160 @ 1.45µm → active area 5.568x3.132mm
// FOV = 2*atan(sensor/(2*focal))*180/π → 3.189° x 1.794°
// ~2.99 arcsec/pixel, preview 1280x720
export const DWARF_II: EquipmentProfile = {
  name: "DWARF II",
  apertureMm: 24,
  focalLengthMm: 100,
  sensorWidthMm: 5.568,
  sensorHeightMm: 3.132,
  pixelSizeUm: 1.45,
  resolutionWidth: 1280,
  resolutionHeight: 720,
  fovWidthDeg: 3.189,
  fovHeightDeg: 1.794,
  limitingMagnitude: 14,
  maxExposureSec: 15,
  minGain: 0,
  maxGain: 240,
  defaultGain: 80,
};

// IMX678: 3840x2160 @ 2.0µm → active area 7.680x4.320mm
// FOV = 2*atan(sensor/(2*focal))*180/π → 2.933° x 1.650°
// ~2.75 arcsec/pixel, confirmed by Wido's AstroForum review
export const DWARF_3: EquipmentProfile = {
  name: "DWARF 3",
  apertureMm: 35,
  focalLengthMm: 150,
  sensorWidthMm: 7.680,
  sensorHeightMm: 4.320,
  pixelSizeUm: 2.0,
  resolutionWidth: 1920,
  resolutionHeight: 1080,
  fovWidthDeg: 2.933,
  fovHeightDeg: 1.650,
  limitingMagnitude: 16,
  maxExposureSec: 30,
  minGain: 0,
  maxGain: 240,
  defaultGain: 60,
};

export function getProfileByName(name: string): EquipmentProfile | undefined {
  const profiles: Record<string, EquipmentProfile> = {
    "DWARF II": DWARF_II,
    "DWARF 3": DWARF_3,
  };
  return profiles[name];
}
