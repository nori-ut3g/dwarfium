jest.mock("axios");
import axios from "axios";
const mockedAxios = axios as jest.Mocked<typeof axios>;

import {
  getCurrentMoonCondition,
  resolveEquipmentProfile,
  fetchCurrentWeather,
} from "@/lib/ai/weather_service";

// ---- getCurrentMoonCondition ----

describe("getCurrentMoonCondition", () => {
  // Use a fixed date for deterministic tests
  const fixedDate = new Date("2024-12-15T22:00:00Z");

  it("returns illumination between 0 and 1", () => {
    const result = getCurrentMoonCondition(48.85, 2.35, fixedDate);
    expect(result.illumination).toBeGreaterThanOrEqual(0);
    expect(result.illumination).toBeLessThanOrEqual(1);
  });

  it("returns altitude in degrees (not radians)", () => {
    const result = getCurrentMoonCondition(48.85, 2.35, fixedDate);
    // Altitude should be in range [-90, 90]
    expect(result.altitudeDeg).toBeGreaterThanOrEqual(-90);
    expect(result.altitudeDeg).toBeLessThanOrEqual(90);
  });

  it("returns different altitude for different locations", () => {
    const paris = getCurrentMoonCondition(48.85, 2.35, fixedDate);
    const tokyo = getCurrentMoonCondition(35.68, 139.69, fixedDate);
    // Different locations should see moon at different altitudes
    expect(paris.altitudeDeg).not.toBe(tokyo.altitudeDeg);
  });

  it("returns same illumination regardless of location", () => {
    // Moon illumination is independent of observer position
    const paris = getCurrentMoonCondition(48.85, 2.35, fixedDate);
    const tokyo = getCurrentMoonCondition(35.68, 139.69, fixedDate);
    expect(paris.illumination).toBeCloseTo(tokyo.illumination, 2);
  });

  it("returns different altitude at different times", () => {
    const evening = getCurrentMoonCondition(
      48.85,
      2.35,
      new Date("2024-12-15T20:00:00Z")
    );
    const midnight = getCurrentMoonCondition(
      48.85,
      2.35,
      new Date("2024-12-16T04:00:00Z")
    );
    expect(evening.altitudeDeg).not.toBe(midnight.altitudeDeg);
  });

  it("rounds altitude to 1 decimal place", () => {
    const result = getCurrentMoonCondition(48.85, 2.35, fixedDate);
    const decimals = (result.altitudeDeg.toString().split(".")[1] || "").length;
    expect(decimals).toBeLessThanOrEqual(1);
  });

  it("uses current date when no date provided", () => {
    // Should not throw
    const result = getCurrentMoonCondition(48.85, 2.35);
    expect(result.illumination).toBeDefined();
    expect(result.altitudeDeg).toBeDefined();
  });

  it("handles extreme latitudes", () => {
    // North pole
    const north = getCurrentMoonCondition(90, 0, fixedDate);
    expect(north.illumination).toBeGreaterThanOrEqual(0);
    // South pole
    const south = getCurrentMoonCondition(-90, 0, fixedDate);
    expect(south.illumination).toBeGreaterThanOrEqual(0);
  });
});

// ---- resolveEquipmentProfile ----

describe("resolveEquipmentProfile", () => {
  it("resolves DWARF II from exact name", () => {
    const profile = resolveEquipmentProfile("DWARF II");
    expect(profile).toBeDefined();
    expect(profile!.name).toBe("DWARF II");
  });

  it("resolves DWARF 3 from exact name", () => {
    const profile = resolveEquipmentProfile("DWARF 3");
    expect(profile).toBeDefined();
    expect(profile!.name).toBe("DWARF 3");
  });

  it("resolves DWARF 3 from name containing '3'", () => {
    const profile = resolveEquipmentProfile("Dwarf 3");
    expect(profile).toBeDefined();
    expect(profile!.name).toBe("DWARF 3");
  });

  it("resolves DWARF II from name containing '2'", () => {
    const profile = resolveEquipmentProfile("Dwarf 2");
    expect(profile).toBeDefined();
    expect(profile!.name).toBe("DWARF II");
  });

  it("returns undefined for generic 'Dwarf' (default context value)", () => {
    const profile = resolveEquipmentProfile("Dwarf");
    expect(profile).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    const profile = resolveEquipmentProfile("");
    expect(profile).toBeUndefined();
  });

  it("returns correct FOV for each model", () => {
    const d2 = resolveEquipmentProfile("DWARF II")!;
    const d3 = resolveEquipmentProfile("DWARF 3")!;
    // DWARF 3 has narrower FOV (longer focal length)
    expect(d3.fovWidthDeg).toBeLessThan(d2.fovWidthDeg);
  });
});

// ---- fetchCurrentWeather ----

describe("fetchCurrentWeather", () => {
  const mockHourly = {
    cloudcover: Array(24).fill(25),
    windspeed_10m: Array(24).fill(10),
    relative_humidity_2m: Array(24).fill(60),
  };

  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({
      data: { hourly: mockHourly },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns WeatherCondition with correct fields", async () => {
    const result = await fetchCurrentWeather(48.85, 2.35);
    expect(result).toHaveProperty("cloudCoverPercent");
    expect(result).toHaveProperty("humidityPercent");
    expect(result).toHaveProperty("windSpeedKmh");
  });

  it("extracts current hour data from response", async () => {
    const result = await fetchCurrentWeather(48.85, 2.35);
    expect(result.cloudCoverPercent).toBe(25);
    expect(result.humidityPercent).toBe(60);
    expect(result.windSpeedKmh).toBe(10);
  });

  it("calls Open-Meteo API with correct URL", async () => {
    await fetchCurrentWeather(48.85, 2.35);
    const calledUrl = mockedAxios.get.mock.calls[0][0];
    expect(calledUrl).toContain("api.open-meteo.com");
    expect(calledUrl).toContain("latitude=48.85");
    expect(calledUrl).toContain("longitude=2.35");
  });

  it("uses proxy URL when provided", async () => {
    await fetchCurrentWeather(48.85, 2.35, "http://proxy:8080");
    const calledUrl = mockedAxios.get.mock.calls[0][0];
    expect(calledUrl).toContain("http://proxy:8080");
    expect(calledUrl).toContain("target=");
  });

  it("does not use proxy when not provided", async () => {
    await fetchCurrentWeather(48.85, 2.35);
    const calledUrl = mockedAxios.get.mock.calls[0][0];
    expect(calledUrl).not.toContain("target=");
  });

  it("defaults to fallback values for missing hourly data", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        hourly: {
          cloudcover: [],
          windspeed_10m: [],
          relative_humidity_2m: [],
        },
      },
    });
    const result = await fetchCurrentWeather(48.85, 2.35);
    // Empty arrays → arr[hour] returns undefined → ?? fallbacks
    expect(result.cloudCoverPercent).toBe(50);
    expect(result.humidityPercent).toBe(50);
    expect(result.windSpeedKmh).toBe(0);
  });
});
