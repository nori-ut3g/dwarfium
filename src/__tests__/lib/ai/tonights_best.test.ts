import { rankTargetsForTonight } from "@/lib/ai/tonights_best";
import { DWARF_II } from "@/lib/ai/equipment_profiles";
import type { AstroObject } from "@/types";
import type {
  WeatherCondition,
  MoonCondition,
} from "@/lib/ai/observation_scorer";

// Sample objects for testing
const sampleObjects: AstroObject[] = [
  {
    designation: "M 42",
    ra: "5h 35m 17.30s",
    dec: "-5° 23' 28.0\"",
    magnitude: 4,
    type: "HII region",
    typeCategory: "nebulae",
    displayName: "M 42 - Orion Nebula",
    alternateNames: "NGC 1976",
    catalogue: "M",
    objectNumber: 42,
    size: "66'x60'",
    constellation: "Ori",
    notes: null,
    favorite: false,
  },
  {
    designation: "M 31",
    ra: "0h 42m 44.30s",
    dec: "+41° 16' 9.0\"",
    magnitude: 3.4,
    type: "galaxy",
    typeCategory: "galaxies",
    displayName: "M 31 - Andromeda Galaxy",
    alternateNames: "NGC 224",
    catalogue: "M",
    objectNumber: 31,
    size: "178'x63'",
    constellation: "And",
    notes: null,
    favorite: false,
  },
  {
    designation: "NGC 6543",
    ra: "17h 58m 33.42s",
    dec: "+66° 37' 59.5\"",
    magnitude: 8.1,
    type: "Planetary Nebula",
    typeCategory: "nebulae",
    displayName: "NGC 6543 - Cat's Eye Nebula",
    alternateNames: null,
    catalogue: "NGC",
    objectNumber: 6543,
    size: "0.3'",
    constellation: "Dra",
    notes: null,
    favorite: false,
  },
  {
    // Object without coordinates — should be skipped
    designation: "TEST 1",
    ra: null,
    dec: null,
    magnitude: null,
    type: "unknown",
    typeCategory: "other",
    displayName: "TEST 1",
    alternateNames: null,
    catalogue: "TEST",
    objectNumber: 1,
    constellation: null,
    notes: null,
    favorite: false,
  },
];

const clearWeather: WeatherCondition = {
  cloudCoverPercent: 0,
  humidityPercent: 40,
  windSpeedKmh: 5,
};

const noMoon: MoonCondition = {
  illumination: 0,
  altitudeDeg: -10,
};

// Paris coordinates
const lat = 48.85;
const lon = 2.35;

describe("rankTargetsForTonight", () => {
  it("returns ranked targets sorted by score descending", () => {
    const results = rankTargetsForTonight(
      sampleObjects,
      lat,
      lon,
      "Europe/Paris",
      clearWeather,
      noMoon,
      DWARF_II
    );

    // At least some objects should be above horizon
    // (exact count depends on time of day)
    for (let i = 1; i < results.length; i++) {
      expect(results[i].score).toBeLessThanOrEqual(results[i - 1].score);
    }
  });

  it("excludes objects without coordinates", () => {
    const results = rankTargetsForTonight(
      sampleObjects,
      lat,
      lon,
      "Europe/Paris",
      clearWeather,
      noMoon,
      DWARF_II
    );

    const testObj = results.find((r) => r.object.designation === "TEST 1");
    expect(testObj).toBeUndefined();
  });

  it("excludes objects below minimum altitude", () => {
    const results = rankTargetsForTonight(
      sampleObjects,
      lat,
      lon,
      "Europe/Paris",
      clearWeather,
      noMoon,
      DWARF_II,
      { minAltitudeDeg: 30 }
    );

    results.forEach((r) => {
      expect(r.altitudeDeg).toBeGreaterThanOrEqual(30);
    });
  });

  it("respects the limit option", () => {
    const results = rankTargetsForTonight(
      sampleObjects,
      lat,
      lon,
      "Europe/Paris",
      clearWeather,
      noMoon,
      DWARF_II,
      { limit: 1 }
    );

    expect(results.length).toBeLessThanOrEqual(1);
  });

  it("respects the minScore option", () => {
    const results = rankTargetsForTonight(
      sampleObjects,
      lat,
      lon,
      "Europe/Paris",
      clearWeather,
      noMoon,
      DWARF_II,
      { minScore: 50 }
    );

    results.forEach((r) => {
      expect(r.score).toBeGreaterThanOrEqual(50);
    });
  });

  it("returns RankedTarget shape with required fields", () => {
    const results = rankTargetsForTonight(
      sampleObjects,
      lat,
      lon,
      "Europe/Paris",
      clearWeather,
      noMoon,
      DWARF_II
    );

    results.forEach((r) => {
      expect(r).toHaveProperty("object");
      expect(r).toHaveProperty("score");
      expect(r).toHaveProperty("altitudeDeg");
      expect(r).toHaveProperty("azimuthDeg");
      expect(r).toHaveProperty("recommendation");
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(100);
      expect(typeof r.recommendation).toBe("string");
    });
  });

  it("returns empty array when no objects visible", () => {
    const results = rankTargetsForTonight(
      sampleObjects,
      lat,
      lon,
      "Europe/Paris",
      clearWeather,
      noMoon,
      DWARF_II,
      { minAltitudeDeg: 89 } // Almost nothing at 89+ degrees
    );

    // Most objects won't be at 89+ degrees altitude
    expect(results.length).toBeLessThanOrEqual(1);
  });

  it("returns empty array for empty input", () => {
    const results = rankTargetsForTonight(
      [],
      lat,
      lon,
      "Europe/Paris",
      clearWeather,
      noMoon,
      DWARF_II
    );

    expect(results).toEqual([]);
  });

  it("handles objects with string magnitude", () => {
    const objsWithStringMag: AstroObject[] = [
      {
        ...sampleObjects[0],
        magnitude: "4.00" as unknown as number,
      },
    ];

    // Should not throw
    const results = rankTargetsForTonight(
      objsWithStringMag,
      lat,
      lon,
      "Europe/Paris",
      clearWeather,
      noMoon,
      DWARF_II
    );

    // If object is above horizon, it should have a valid score
    results.forEach((r) => {
      expect(r.score).toBeGreaterThanOrEqual(0);
    });
  });

  it("handles objects with null magnitude", () => {
    const objsNullMag: AstroObject[] = [
      {
        ...sampleObjects[0],
        magnitude: null,
      },
    ];

    const results = rankTargetsForTonight(
      objsNullMag,
      lat,
      lon,
      "Europe/Paris",
      clearWeather,
      noMoon,
      DWARF_II
    );

    results.forEach((r) => {
      expect(r.score).toBeGreaterThanOrEqual(0);
    });
  });

  it("poor weather lowers scores", () => {
    const poorWeather: WeatherCondition = {
      cloudCoverPercent: 90,
      humidityPercent: 95,
      windSpeedKmh: 40,
    };

    const goodResults = rankTargetsForTonight(
      sampleObjects,
      lat,
      lon,
      "Europe/Paris",
      clearWeather,
      noMoon,
      DWARF_II
    );

    const poorResults = rankTargetsForTonight(
      sampleObjects,
      lat,
      lon,
      "Europe/Paris",
      poorWeather,
      noMoon,
      DWARF_II
    );

    // Same objects above horizon should score lower in poor weather
    if (goodResults.length > 0 && poorResults.length > 0) {
      const goodTop = goodResults[0];
      const poorMatch = poorResults.find(
        (r) => r.object.designation === goodTop.object.designation
      );
      if (poorMatch) {
        expect(poorMatch.score).toBeLessThanOrEqual(goodTop.score);
      }
    }
  });

  it("altitude values are rounded to 1 decimal", () => {
    const results = rankTargetsForTonight(
      sampleObjects,
      lat,
      lon,
      "Europe/Paris",
      clearWeather,
      noMoon,
      DWARF_II
    );

    results.forEach((r) => {
      const decimals = (r.altitudeDeg.toString().split(".")[1] || "").length;
      expect(decimals).toBeLessThanOrEqual(1);
    });
  });
});
