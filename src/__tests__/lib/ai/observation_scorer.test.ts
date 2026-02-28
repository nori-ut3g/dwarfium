import {
  scoreAltitude,
  scoreMoonImpact,
  scoreWeather,
  scoreTargetDifficulty,
  generateRecommendation,
  calculateObservationScore,
  type TargetInfo,
  type TargetPosition,
  type MoonCondition,
  type WeatherCondition,
} from "@/lib/ai/observation_scorer";

import {
  DWARF_II,
  DWARF_3,
  getProfileByName,
} from "@/lib/ai/equipment_profiles";

// ---- getProfileByName ----

describe("getProfileByName", () => {
  it("returns DWARF II profile", () => {
    const profile = getProfileByName("DWARF II");
    expect(profile).toBeDefined();
    expect(profile!.name).toBe("DWARF II");
    expect(profile!.apertureMm).toBe(24);
  });

  it("returns DWARF 3 profile", () => {
    const profile = getProfileByName("DWARF 3");
    expect(profile).toBeDefined();
    expect(profile!.name).toBe("DWARF 3");
    expect(profile!.apertureMm).toBe(35);
  });

  it("returns undefined for unknown profile", () => {
    expect(getProfileByName("DWARF 99")).toBeUndefined();
    expect(getProfileByName("")).toBeUndefined();
  });

  it("DWARF II and DWARF 3 have different FOV values", () => {
    const d2 = getProfileByName("DWARF II")!;
    const d3 = getProfileByName("DWARF 3")!;
    // DWARF 3 has longer focal length → narrower FOV
    expect(d3.fovWidthDeg).toBeLessThan(d2.fovWidthDeg);
    expect(d3.fovHeightDeg).toBeLessThan(d2.fovHeightDeg);
  });
});

// ---- scoreAltitude ----

describe("scoreAltitude", () => {
  it("returns 0 for objects at or below horizon", () => {
    expect(scoreAltitude(0)).toBe(0);
    expect(scoreAltitude(-10)).toBe(0);
  });

  it("returns low score for low altitude (0-15 deg)", () => {
    const score = scoreAltitude(10);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(30);
  });

  it("returns moderate score for medium altitude (15-40 deg)", () => {
    const score = scoreAltitude(30);
    expect(score).toBeGreaterThanOrEqual(30);
    expect(score).toBeLessThanOrEqual(85);
  });

  it("returns high score for high altitude (40-70 deg)", () => {
    const score = scoreAltitude(55);
    expect(score).toBeGreaterThanOrEqual(85);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("returns 100 for altitude >= 70 deg", () => {
    expect(scoreAltitude(70)).toBe(100);
    expect(scoreAltitude(90)).toBe(100);
  });

  it("is monotonically increasing", () => {
    let prev = scoreAltitude(-10);
    for (let alt = 0; alt <= 90; alt += 5) {
      const current = scoreAltitude(alt);
      expect(current).toBeGreaterThanOrEqual(prev);
      prev = current;
    }
  });
});

// ---- scoreMoonImpact ----

describe("scoreMoonImpact", () => {
  it("returns 100 when moon is below horizon", () => {
    expect(scoreMoonImpact({ illumination: 1.0, altitudeDeg: -5 }, "galaxies")).toBe(100);
    expect(scoreMoonImpact({ illumination: 1.0, altitudeDeg: 0 }, "galaxies")).toBe(100);
  });

  it("returns lower score for bright moon above horizon", () => {
    const fullMoonHigh: MoonCondition = { illumination: 1.0, altitudeDeg: 60 };
    const score = scoreMoonImpact(fullMoonHigh, "galaxies");
    expect(score).toBeLessThan(50);
  });

  it("returns higher score for dim moon", () => {
    const crescentMoon: MoonCondition = { illumination: 0.1, altitudeDeg: 30 };
    const score = scoreMoonImpact(crescentMoon, "galaxies");
    expect(score).toBeGreaterThan(80);
  });

  it("clusters are less affected by moonlight than galaxies", () => {
    const moon: MoonCondition = { illumination: 0.8, altitudeDeg: 45 };
    const galaxyScore = scoreMoonImpact(moon, "galaxies");
    const clusterScore = scoreMoonImpact(moon, "clusters");
    expect(clusterScore).toBeGreaterThan(galaxyScore);
  });

  it("stars are less affected by moonlight", () => {
    const moon: MoonCondition = { illumination: 0.8, altitudeDeg: 45 };
    const nebulaScore = scoreMoonImpact(moon, "nebulae");
    const starScore = scoreMoonImpact(moon, "stars");
    expect(starScore).toBeGreaterThan(nebulaScore);
  });
});

// ---- scoreWeather ----

describe("scoreWeather", () => {
  it("returns 100 for clear skies, low humidity, no wind", () => {
    expect(
      scoreWeather({ cloudCoverPercent: 0, humidityPercent: 50, windSpeedKmh: 5 })
    ).toBe(100);
  });

  it("returns 0 for fully overcast", () => {
    expect(
      scoreWeather({ cloudCoverPercent: 100, humidityPercent: 50, windSpeedKmh: 5 })
    ).toBe(0);
  });

  it("penalizes high humidity", () => {
    const lowHumidity = scoreWeather({
      cloudCoverPercent: 0,
      humidityPercent: 60,
      windSpeedKmh: 0,
    });
    const highHumidity = scoreWeather({
      cloudCoverPercent: 0,
      humidityPercent: 95,
      windSpeedKmh: 0,
    });
    expect(lowHumidity).toBeGreaterThan(highHumidity);
  });

  it("does not penalize humidity <= 80%", () => {
    const score = scoreWeather({
      cloudCoverPercent: 0,
      humidityPercent: 80,
      windSpeedKmh: 0,
    });
    expect(score).toBe(100);
  });

  it("penalizes high wind", () => {
    const calm = scoreWeather({
      cloudCoverPercent: 0,
      humidityPercent: 50,
      windSpeedKmh: 10,
    });
    const windy = scoreWeather({
      cloudCoverPercent: 0,
      humidityPercent: 50,
      windSpeedKmh: 40,
    });
    expect(calm).toBeGreaterThan(windy);
  });

  it("does not penalize wind <= 20 km/h", () => {
    const score = scoreWeather({
      cloudCoverPercent: 0,
      humidityPercent: 50,
      windSpeedKmh: 20,
    });
    expect(score).toBe(100);
  });

  it("never returns negative", () => {
    const score = scoreWeather({
      cloudCoverPercent: 100,
      humidityPercent: 100,
      windSpeedKmh: 100,
    });
    expect(score).toBeGreaterThanOrEqual(0);
  });
});

// ---- scoreTargetDifficulty ----

describe("scoreTargetDifficulty", () => {
  it("returns 0 for targets fainter than equipment limit", () => {
    const target: TargetInfo = {
      magnitude: 18,
      angularSizeArcmin: 5,
      typeCategory: "galaxies",
    };
    expect(scoreTargetDifficulty(target, DWARF_II)).toBe(0);
  });

  it("returns high score for bright targets", () => {
    const target: TargetInfo = {
      magnitude: 3,
      angularSizeArcmin: 60,
      typeCategory: "nebulae",
    };
    expect(scoreTargetDifficulty(target, DWARF_II)).toBeGreaterThanOrEqual(80);
  });

  it("returns moderate score for dim targets", () => {
    const target: TargetInfo = {
      magnitude: 10,
      angularSizeArcmin: 5,
      typeCategory: "galaxies",
    };
    const score = scoreTargetDifficulty(target, DWARF_II);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(60);
  });

  it("returns 50 for unknown magnitude", () => {
    const target: TargetInfo = {
      magnitude: null,
      angularSizeArcmin: 10,
      typeCategory: "nebulae",
    };
    expect(scoreTargetDifficulty(target, DWARF_II)).toBe(50);
  });

  it("penalizes objects much larger than FOV", () => {
    const large: TargetInfo = {
      magnitude: 5,
      angularSizeArcmin: 300,
      typeCategory: "nebulae",
    };
    const small: TargetInfo = {
      magnitude: 5,
      angularSizeArcmin: 30,
      typeCategory: "nebulae",
    };
    expect(scoreTargetDifficulty(small, DWARF_II)).toBeGreaterThan(
      scoreTargetDifficulty(large, DWARF_II)
    );
  });

  it("penalizes very small objects", () => {
    const tiny: TargetInfo = {
      magnitude: 8,
      angularSizeArcmin: 0.5,
      typeCategory: "galaxies",
    };
    const normal: TargetInfo = {
      magnitude: 8,
      angularSizeArcmin: 10,
      typeCategory: "galaxies",
    };
    expect(scoreTargetDifficulty(normal, DWARF_II)).toBeGreaterThan(
      scoreTargetDifficulty(tiny, DWARF_II)
    );
  });

  it("caps planets/moon at 60", () => {
    const planet: TargetInfo = {
      magnitude: -2,
      angularSizeArcmin: 0.5,
      typeCategory: "moon_planets",
    };
    expect(scoreTargetDifficulty(planet, DWARF_II)).toBeLessThanOrEqual(60);
  });

  it("DWARF 3 can handle fainter targets than DWARF II", () => {
    const target: TargetInfo = {
      magnitude: 15,
      angularSizeArcmin: 3,
      typeCategory: "galaxies",
    };
    // DWARF II limiting mag = 14, so this should be 0
    expect(scoreTargetDifficulty(target, DWARF_II)).toBe(0);
    // DWARF 3 limiting mag = 16, so this should be > 0
    expect(scoreTargetDifficulty(target, DWARF_3)).toBeGreaterThan(0);
  });
});

// ---- generateRecommendation ----

describe("generateRecommendation", () => {
  it("returns excellent recommendation for high overall score", () => {
    const result = generateRecommendation(
      85,
      { altitude: 90, moonImpact: 90, weather: 80, targetDifficulty: 80 },
      60
    );
    expect(result.text).toContain("Excellent");
    expect(result.code).toBe("excellent");
  });

  it("mentions weather for good target with poor weather", () => {
    const result = generateRecommendation(
      65,
      { altitude: 90, moonImpact: 90, weather: 40, targetDifficulty: 80 },
      60
    );
    expect(result.text).toContain("weather");
    expect(result.code).toBe("good_weather_issue");
  });

  it("mentions moonlight for good target with bright moon", () => {
    const result = generateRecommendation(
      65,
      { altitude: 90, moonImpact: 40, weather: 80, targetDifficulty: 80 },
      60
    );
    expect(result.text).toContain("moonlight");
    expect(result.code).toBe("good_moon_issue");
  });

  it("mentions altitude when target is low", () => {
    const result = generateRecommendation(
      65,
      { altitude: 40, moonImpact: 80, weather: 80, targetDifficulty: 80 },
      20
    );
    expect(result.text).toContain("altitude");
    expect(result.code).toBe("good_low_alt");
  });

  it("mentions below horizon when altitude <= 0", () => {
    const result = generateRecommendation(
      10,
      { altitude: 0, moonImpact: 90, weather: 80, targetDifficulty: 80 },
      -5
    );
    expect(result.text).toContain("below the horizon");
    expect(result.code).toBe("below_horizon");
  });

  it("mentions too faint when targetDifficulty is 0", () => {
    const result = generateRecommendation(
      5,
      { altitude: 80, moonImpact: 90, weather: 80, targetDifficulty: 0 },
      60
    );
    expect(result.text).toContain("too faint");
    expect(result.code).toBe("too_faint");
  });

  it("prioritizes below_horizon even when overall is high", () => {
    // alt=0 but other factors give overall ~70 — should still say below horizon
    const result = generateRecommendation(
      70,
      { altitude: 0, moonImpact: 100, weather: 100, targetDifficulty: 100 },
      -5
    );
    expect(result.code).toBe("below_horizon");
  });

  it("prioritizes too_faint even when overall is high", () => {
    // targetDifficulty=0 but other factors give overall ~80
    const result = generateRecommendation(
      80,
      { altitude: 100, moonImpact: 100, weather: 100, targetDifficulty: 0 },
      60
    );
    expect(result.code).toBe("too_faint");
  });
});

// ---- calculateObservationScore (integration) ----

describe("calculateObservationScore", () => {
  const perfectWeather: WeatherCondition = {
    cloudCoverPercent: 0,
    humidityPercent: 40,
    windSpeedKmh: 5,
  };
  const noMoon: MoonCondition = { illumination: 0, altitudeDeg: -10 };

  it("returns high score for ideal conditions", () => {
    const target: TargetInfo = {
      magnitude: 4,
      angularSizeArcmin: 30,
      typeCategory: "nebulae",
    };
    const position: TargetPosition = { altitudeDeg: 70, azimuthDeg: 180 };

    const result = calculateObservationScore(
      target,
      position,
      noMoon,
      perfectWeather,
      DWARF_II
    );

    expect(result.overall).toBeGreaterThanOrEqual(80);
    expect(result.factors.altitude).toBe(100);
    expect(result.factors.moonImpact).toBe(100);
    expect(result.factors.weather).toBe(100);
    expect(result.recommendation).toContain("Excellent");
  });

  it("returns 0 overall when target is below horizon", () => {
    const target: TargetInfo = {
      magnitude: 4,
      angularSizeArcmin: 30,
      typeCategory: "nebulae",
    };
    const position: TargetPosition = { altitudeDeg: -10, azimuthDeg: 0 };

    const result = calculateObservationScore(
      target,
      position,
      noMoon,
      perfectWeather,
      DWARF_II
    );

    expect(result.factors.altitude).toBe(0);
    // Below-horizon is a hard-stop: overall is clamped to 0
    expect(result.overall).toBe(0);
    expect(result.recommendationCode).toBe("below_horizon");
  });

  it("returns low score for poor weather", () => {
    const target: TargetInfo = {
      magnitude: 4,
      angularSizeArcmin: 30,
      typeCategory: "nebulae",
    };
    const position: TargetPosition = { altitudeDeg: 60, azimuthDeg: 180 };
    const badWeather: WeatherCondition = {
      cloudCoverPercent: 90,
      humidityPercent: 95,
      windSpeedKmh: 40,
    };

    const result = calculateObservationScore(
      target,
      position,
      noMoon,
      badWeather,
      DWARF_II
    );

    expect(result.factors.weather).toBeLessThan(20);
    // Weather weight is 0.3, so poor weather pulls down but other
    // factors (altitude, moon, target) keep overall moderate
    expect(result.overall).toBeLessThan(80);
  });

  it("returns lower score with bright full moon", () => {
    const target: TargetInfo = {
      magnitude: 8,
      angularSizeArcmin: 10,
      typeCategory: "galaxies",
    };
    const position: TargetPosition = { altitudeDeg: 50, azimuthDeg: 180 };
    const fullMoon: MoonCondition = { illumination: 1.0, altitudeDeg: 60 };

    const withMoon = calculateObservationScore(
      target,
      position,
      fullMoon,
      perfectWeather,
      DWARF_II
    );
    const withoutMoon = calculateObservationScore(
      target,
      position,
      noMoon,
      perfectWeather,
      DWARF_II
    );

    expect(withoutMoon.overall).toBeGreaterThan(withMoon.overall);
  });

  it("overall score is between 0 and 100", () => {
    const targets: TargetInfo[] = [
      { magnitude: -2, angularSizeArcmin: 0.5, typeCategory: "moon_planets" },
      { magnitude: 4, angularSizeArcmin: 66, typeCategory: "nebulae" },
      { magnitude: 12, angularSizeArcmin: 2, typeCategory: "galaxies" },
      { magnitude: 20, angularSizeArcmin: 1, typeCategory: "galaxies" },
      { magnitude: null, angularSizeArcmin: null, typeCategory: "nebulae" },
    ];
    const positions: TargetPosition[] = [
      { altitudeDeg: -10, azimuthDeg: 0 },
      { altitudeDeg: 30, azimuthDeg: 180 },
      { altitudeDeg: 90, azimuthDeg: 0 },
    ];
    const moons: MoonCondition[] = [
      { illumination: 0, altitudeDeg: -10 },
      { illumination: 1, altitudeDeg: 60 },
    ];
    const weathers: WeatherCondition[] = [
      { cloudCoverPercent: 0, humidityPercent: 30, windSpeedKmh: 0 },
      { cloudCoverPercent: 100, humidityPercent: 100, windSpeedKmh: 50 },
    ];

    for (const target of targets) {
      for (const pos of positions) {
        for (const moon of moons) {
          for (const weather of weathers) {
            const result = calculateObservationScore(
              target,
              pos,
              moon,
              weather,
              DWARF_II
            );
            expect(result.overall).toBeGreaterThanOrEqual(0);
            expect(result.overall).toBeLessThanOrEqual(100);
            expect(typeof result.recommendation).toBe("string");
            expect(result.recommendation.length).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it("clamps overall to 0 for too-faint target", () => {
    // Magnitude 20 exceeds DWARF II limiting mag (14) → targetDifficulty=0
    const target: TargetInfo = {
      magnitude: 20,
      angularSizeArcmin: 1,
      typeCategory: "galaxies",
    };
    const position: TargetPosition = { altitudeDeg: 60, azimuthDeg: 180 };

    const result = calculateObservationScore(
      target,
      position,
      noMoon,
      perfectWeather,
      DWARF_II
    );

    expect(result.factors.targetDifficulty).toBe(0);
    expect(result.overall).toBe(0);
    expect(result.recommendationCode).toBe("too_faint");
  });
});
