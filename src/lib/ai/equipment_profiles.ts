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
}

export const DWARF_II: EquipmentProfile = {
  name: "DWARF II",
  apertureMm: 24,
  focalLengthMm: 100,
  sensorWidthMm: 6.4,
  sensorHeightMm: 3.6,
  pixelSizeUm: 2.0,
  resolutionWidth: 1280,
  resolutionHeight: 720,
  fovWidthDeg: 3.188,
  fovHeightDeg: 1.794,
  limitingMagnitude: 14,
  maxExposureSec: 15,
};

export const DWARF_3: EquipmentProfile = {
  name: "DWARF 3",
  apertureMm: 35,
  focalLengthMm: 150,
  sensorWidthMm: 7.9,
  sensorHeightMm: 4.4,
  pixelSizeUm: 2.0,
  resolutionWidth: 1920,
  resolutionHeight: 1080,
  fovWidthDeg: 3.188,
  fovHeightDeg: 1.794,
  limitingMagnitude: 16,
  maxExposureSec: 30,
};

export function getProfileByName(name: string): EquipmentProfile | undefined {
  const profiles: Record<string, EquipmentProfile> = {
    "DWARF II": DWARF_II,
    "DWARF 3": DWARF_3,
  };
  return profiles[name];
}
