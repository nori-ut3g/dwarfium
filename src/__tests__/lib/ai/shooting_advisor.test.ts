import {
  classifyTargetBrightness,
  recommendExposure,
  recommendGain,
  recommendStackFrames,
  recommendShootingParams,
  type TargetBrightness,
} from "@/lib/ai/shooting_advisor";

import {
  DWARF_II,
  DWARF_3,
} from "@/lib/ai/equipment_profiles";

// ---- classifyTargetBrightness ----

describe("classifyTargetBrightness", () => {
  it('returns "bright" for magnitude <= 4', () => {
    expect(classifyTargetBrightness(4)).toBe("bright");
    expect(classifyTargetBrightness(0)).toBe("bright");
    expect(classifyTargetBrightness(-2)).toBe("bright");
  });

  it('returns "moderate" for magnitude 4-8', () => {
    expect(classifyTargetBrightness(4.1)).toBe("moderate");
    expect(classifyTargetBrightness(6)).toBe("moderate");
    expect(classifyTargetBrightness(8)).toBe("moderate");
  });

  it('returns "faint" for magnitude 8-12', () => {
    expect(classifyTargetBrightness(8.1)).toBe("faint");
    expect(classifyTargetBrightness(10)).toBe("faint");
    expect(classifyTargetBrightness(12)).toBe("faint");
  });

  it('returns "very_faint" for magnitude > 12', () => {
    expect(classifyTargetBrightness(12.1)).toBe("very_faint");
    expect(classifyTargetBrightness(15)).toBe("very_faint");
    expect(classifyTargetBrightness(20)).toBe("very_faint");
  });

  it('returns "very_faint" for null magnitude', () => {
    expect(classifyTargetBrightness(null)).toBe("very_faint");
  });

  it("handles exact boundary values correctly", () => {
    // Exactly at boundary: 4 is bright, 8 is moderate, 12 is faint
    expect(classifyTargetBrightness(4)).toBe("bright");
    expect(classifyTargetBrightness(8)).toBe("moderate");
    expect(classifyTargetBrightness(12)).toBe("faint");
  });
});

// ---- recommendExposure ----

describe("recommendExposure", () => {
  it("returns base exposure for normal conditions (Bortle 4-6, low moon)", () => {
    // Bortle 5 = no sky multiplier, low moon = no moon multiplier
    expect(recommendExposure("bright", 5, 0.3, 15)).toBe(1);
    expect(recommendExposure("moderate", 5, 0.3, 30)).toBe(5);
    expect(recommendExposure("faint", 5, 0.3, 30)).toBe(10);
    expect(recommendExposure("very_faint", 5, 0.3, 30)).toBe(15);
  });

  it("increases exposure for dark sky (Bortle 1-3)", () => {
    const darkSky = recommendExposure("moderate", 2, 0.3, 30);
    const normalSky = recommendExposure("moderate", 5, 0.3, 30);
    expect(darkSky).toBeGreaterThan(normalSky);
  });

  it("multiplies by 1.5 for Bortle 1-3", () => {
    // moderate base=5, dark sky=5*1.5=7.5 → rounded to 8
    const result = recommendExposure("moderate", 2, 0.0, 30);
    expect(result).toBe(8);
  });

  it("decreases exposure for light-polluted sky (Bortle 7-9)", () => {
    const pollutedSky = recommendExposure("moderate", 8, 0.3, 30);
    const normalSky = recommendExposure("moderate", 5, 0.3, 30);
    expect(pollutedSky).toBeLessThan(normalSky);
  });

  it("multiplies by 0.5 for Bortle 7-9", () => {
    // moderate base=5, polluted=5*0.5=2.5 → rounded to 3
    const result = recommendExposure("moderate", 8, 0.0, 30);
    expect(result).toBe(3);
  });

  it("decreases exposure for high moon illumination (> 0.7)", () => {
    const brightMoon = recommendExposure("moderate", 5, 0.9, 30);
    const darkMoon = recommendExposure("moderate", 5, 0.1, 30);
    expect(brightMoon).toBeLessThan(darkMoon);
  });

  it("multiplies by 0.7 when moon illumination > 0.7", () => {
    // moderate base=5, moon=5*0.7=3.5 → rounded to 4
    const result = recommendExposure("moderate", 5, 0.8, 30);
    expect(result).toBe(4);
  });

  it("applies both dark sky and moon adjustments", () => {
    // faint base=10, dark sky=10*1.5=15, high moon=15*0.7=10.5 → 11
    const result = recommendExposure("faint", 2, 0.8, 30);
    expect(result).toBe(11);
  });

  it("applies both light pollution and moon adjustments", () => {
    // moderate base=5, polluted=5*0.5=2.5, moon=2.5*0.7=1.75 → 2
    const result = recommendExposure("moderate", 8, 0.9, 30);
    expect(result).toBe(2);
  });

  it("clamps to maxExposureSec", () => {
    // very_faint base=15, dark sky=15*1.5=22.5 → clamped to 15
    const result = recommendExposure("very_faint", 2, 0.0, 15);
    expect(result).toBe(15);
  });

  it("clamps to minimum of 0.1", () => {
    // bright base=1, polluted=1*0.5=0.5, moon=0.5*0.7=0.35 → 0.4
    // Still above 0.1 but let's verify the floor
    const result = recommendExposure("bright", 8, 0.9, 30);
    expect(result).toBeGreaterThanOrEqual(0.1);
  });

  it("returns a value from roundExposure", () => {
    // All results should be nicely rounded
    const result = recommendExposure("moderate", 5, 0.5, 30);
    expect(result).toBe(5);
  });

  it("does not exceed maxExposureSec for any brightness", () => {
    const brightnesses: TargetBrightness[] = [
      "bright",
      "moderate",
      "faint",
      "very_faint",
    ];
    for (const b of brightnesses) {
      const result = recommendExposure(b, 1, 0.0, 5);
      expect(result).toBeLessThanOrEqual(5);
    }
  });
});

// ---- recommendGain ----

describe("recommendGain", () => {
  it("returns low gain for bright targets", () => {
    const gain = recommendGain("bright", DWARF_II);
    // minGain + range * 0.1 = 0 + 240*0.1 = 24 → rounded to 20
    expect(gain).toBe(20);
  });

  it("returns default gain for moderate targets", () => {
    const gain = recommendGain("moderate", DWARF_II);
    expect(gain).toBe(DWARF_II.defaultGain);
  });

  it("returns elevated gain for faint targets", () => {
    const gain = recommendGain("faint", DWARF_II);
    // defaultGain + range * 0.2 = 80 + 240*0.2 = 128 → rounded to 130
    expect(gain).toBe(130);
  });

  it("returns high gain for very faint targets", () => {
    const gain = recommendGain("very_faint", DWARF_II);
    // defaultGain + range * 0.35 = 80 + 240*0.35 = 164 → rounded to 160
    expect(gain).toBe(160);
  });

  it("returns different gains for DWARF 3 due to different defaultGain", () => {
    const gainD2 = recommendGain("moderate", DWARF_II);
    const gainD3 = recommendGain("moderate", DWARF_3);
    expect(gainD2).toBe(80);
    expect(gainD3).toBe(60);
  });

  it("rounds to nearest 10", () => {
    const brightnesses: TargetBrightness[] = [
      "bright",
      "moderate",
      "faint",
      "very_faint",
    ];
    for (const b of brightnesses) {
      const gain = recommendGain(b, DWARF_II);
      expect(gain % 10).toBe(0);
    }
  });

  it("never exceeds maxGain", () => {
    const gain = recommendGain("very_faint", DWARF_II);
    expect(gain).toBeLessThanOrEqual(DWARF_II.maxGain);
  });

  it("never goes below minGain", () => {
    const gain = recommendGain("bright", DWARF_II);
    expect(gain).toBeGreaterThanOrEqual(DWARF_II.minGain);
  });

  it("clamps to maxGain for equipment with narrow gain range", () => {
    const narrowEquipment = {
      ...DWARF_II,
      minGain: 0,
      maxGain: 50,
      defaultGain: 30,
    };
    // very_faint: 30 + 50*0.35 = 47.5 → rounded to 50 → clamped to 50
    const gain = recommendGain("very_faint", narrowEquipment);
    expect(gain).toBeLessThanOrEqual(50);
  });
});

// ---- recommendStackFrames ----

describe("recommendStackFrames", () => {
  it("returns frames for bright target at high altitude", () => {
    // bright: 15 min integration, 1s exposure = 900 frames
    const frames = recommendStackFrames(1, "bright", 60);
    expect(frames).toBe(900);
  });

  it("returns frames for moderate target", () => {
    // moderate: 30 min = 1800s, 5s exposure = 360 frames
    const frames = recommendStackFrames(5, "moderate", 60);
    expect(frames).toBe(360);
  });

  it("returns frames for faint target", () => {
    // faint: 60 min = 3600s, 10s exposure = 360 frames
    const frames = recommendStackFrames(10, "faint", 60);
    expect(frames).toBe(360);
  });

  it("returns frames for very faint target", () => {
    // very_faint: 90 min = 5400s, 15s exposure = 360 frames
    const frames = recommendStackFrames(15, "very_faint", 60);
    expect(frames).toBe(360);
  });

  it("increases frames by 50% for low altitude (< 30 deg)", () => {
    const highAlt = recommendStackFrames(5, "moderate", 60);
    const lowAlt = recommendStackFrames(5, "moderate", 20);
    expect(lowAlt).toBe(Math.round(highAlt * 1.5));
  });

  it("altitude exactly at 30 deg does not trigger increase", () => {
    const at30 = recommendStackFrames(5, "moderate", 30);
    const at60 = recommendStackFrames(5, "moderate", 60);
    expect(at30).toBe(at60);
  });

  it("enforces minimum of 10 frames", () => {
    // bright: 15 min = 900s, very long exposure = few frames
    // With 15s max exposure: 900/15 = 60, still above 10
    // Use a very long exposure to test the floor
    const frames = recommendStackFrames(15, "bright", 60);
    expect(frames).toBeGreaterThanOrEqual(10);
  });

  it("enforces maximum of 2000 frames", () => {
    // very_faint at low alt: 90*1.5 = 135 min = 8100s, 0.1s exposure = 81000 → clamped to 2000
    const frames = recommendStackFrames(0.1, "very_faint", 10);
    expect(frames).toBeLessThanOrEqual(2000);
  });
});

// ---- recommendShootingParams (integration tests) ----

describe("recommendShootingParams", () => {
  it("returns correct recommendation for M42 (bright nebula)", () => {
    const result = recommendShootingParams(
      { magnitude: 4, typeCategory: "nebulae" },
      { bortleClass: 5, moonIllumination: 0.2, altitudeDeg: 50 },
      DWARF_II
    );

    expect(result.brightness).toBe("bright");
    expect(result.exposureSec).toBe(1);
    expect(result.gain).toBe(20);
    expect(result.stackFrames).toBe(900);
    expect(result.totalIntegrationMin).toBe(15);
    expect(result.notes).toContain("Bright target");
    expect(result.notes).toContain("Nebula target");
  });

  it("returns correct recommendation for a faint galaxy", () => {
    const result = recommendShootingParams(
      { magnitude: 11, typeCategory: "galaxies" },
      { bortleClass: 4, moonIllumination: 0.1, altitudeDeg: 55 },
      DWARF_3
    );

    expect(result.brightness).toBe("faint");
    expect(result.exposureSec).toBe(10);
    expect(result.gain).toBe(110);
    expect(result.stackFrames).toBe(360);
    expect(result.notes).toContain("Faint target");
    expect(result.notes).toContain("Galaxy target");
  });

  it("returns correct recommendation for a planet", () => {
    const result = recommendShootingParams(
      { magnitude: -2, typeCategory: "moon_planets" },
      { bortleClass: 6, moonIllumination: 0.5, altitudeDeg: 40 },
      DWARF_II
    );

    expect(result.brightness).toBe("bright");
    expect(result.exposureSec).toBeLessThanOrEqual(1);
    expect(result.notes).toContain("Planetary target");
  });

  it("adjusts for light-polluted sky with bright moon", () => {
    const result = recommendShootingParams(
      { magnitude: 6, typeCategory: "nebulae" },
      { bortleClass: 8, moonIllumination: 0.9, altitudeDeg: 45 },
      DWARF_II
    );

    // Moderate base=5, polluted=5*0.5=2.5, moon=2.5*0.7=1.75 → 2
    expect(result.exposureSec).toBe(2);
    expect(result.notes).toContain("Light-polluted");
    expect(result.notes).toContain("Bright moon");
  });

  it("adjusts for low altitude target", () => {
    const highAlt = recommendShootingParams(
      { magnitude: 8, typeCategory: "clusters" },
      { bortleClass: 5, moonIllumination: 0.2, altitudeDeg: 60 },
      DWARF_II
    );

    const lowAlt = recommendShootingParams(
      { magnitude: 8, typeCategory: "clusters" },
      { bortleClass: 5, moonIllumination: 0.2, altitudeDeg: 20 },
      DWARF_II
    );

    // Same exposure and gain, but more frames for low altitude
    expect(lowAlt.stackFrames).toBeGreaterThan(highAlt.stackFrames);
    expect(lowAlt.notes).toContain("Low altitude");
  });

  it("handles null magnitude as very faint", () => {
    const result = recommendShootingParams(
      { magnitude: null, typeCategory: "galaxies" },
      { bortleClass: 5, moonIllumination: 0.2, altitudeDeg: 50 },
      DWARF_3
    );

    expect(result.brightness).toBe("very_faint");
    expect(result.exposureSec).toBe(15);
  });

  it("calculates totalIntegrationMin correctly", () => {
    const result = recommendShootingParams(
      { magnitude: 6, typeCategory: "nebulae" },
      { bortleClass: 5, moonIllumination: 0.2, altitudeDeg: 60 },
      DWARF_II
    );

    const expected =
      Math.round(((result.exposureSec * result.stackFrames) / 60) * 10) / 10;
    expect(result.totalIntegrationMin).toBe(expected);
  });

  it("respects equipment maxExposureSec for dark sky very faint target", () => {
    // DWARF II maxExposureSec = 15, very_faint base=15, dark sky=15*1.5=22.5 → clamped to 15
    const result = recommendShootingParams(
      { magnitude: 14, typeCategory: "galaxies" },
      { bortleClass: 2, moonIllumination: 0.0, altitudeDeg: 60 },
      DWARF_II
    );

    expect(result.exposureSec).toBeLessThanOrEqual(DWARF_II.maxExposureSec);
  });

  it("gives different recommendations for DWARF II vs DWARF 3", () => {
    const target = { magnitude: 9 as number | null, typeCategory: "galaxies" as const };
    const conditions = {
      bortleClass: 5,
      moonIllumination: 0.2,
      altitudeDeg: 50,
    };

    const d2 = recommendShootingParams(target, conditions, DWARF_II);
    const d3 = recommendShootingParams(target, conditions, DWARF_3);

    // Both should have same brightness classification
    expect(d2.brightness).toBe(d3.brightness);

    // Different gain due to different defaultGain
    expect(d2.gain).not.toBe(d3.gain);

    // DWARF 3 allows longer exposure (maxExposureSec=30 vs 15)
    // For faint brightness base=10, no modifiers, both equipment can handle it
    expect(d2.exposureSec).toBe(d3.exposureSec);
  });
});
