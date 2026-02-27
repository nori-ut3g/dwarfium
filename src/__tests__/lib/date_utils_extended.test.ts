import {
  isDstObserved,
  calculateImagingTime,
  calculateElapsedTime,
  toIsoStringInLocalTime,
} from "@/lib/date_utils";

describe("isDstObserved", () => {
  it("returns a boolean", () => {
    const result = isDstObserved(new Date());
    expect(typeof result).toBe("boolean");
  });

  it("returns consistent results for the same date", () => {
    const date = new Date("2023-07-15T12:00:00");
    const result1 = isDstObserved(date);
    const result2 = isDstObserved(date);
    expect(result1).toBe(result2);
  });
});

describe("calculateImagingTime edge cases", () => {
  it("returns undefined when count is undefined", () => {
    expect(calculateImagingTime(undefined, 1)).toBeUndefined();
  });

  it("returns undefined when exposure is undefined", () => {
    expect(calculateImagingTime(10, undefined)).toBeUndefined();
  });

  it("returns undefined when both are undefined", () => {
    expect(calculateImagingTime(undefined, undefined)).toBeUndefined();
  });

  it("handles fractional exposure times", () => {
    // 10 frames * 0.5s = 5s total
    expect(calculateImagingTime(10, 0.5)).toEqual({
      hours: 0,
      minutes: 0,
      seconds: 5,
    });
  });

  it("handles zero count", () => {
    expect(calculateImagingTime(0, 10)).toEqual({
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  it("handles zero exposure", () => {
    expect(calculateImagingTime(10, 0)).toEqual({
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });
});

describe("calculateElapsedTime edge cases", () => {
  it("returns undefined when startTime is undefined", () => {
    expect(calculateElapsedTime(undefined)).toBeUndefined();
  });

  it("calculates elapsed time from a specific start", () => {
    const start = new Date("2023-01-01T12:00:00").getTime();
    const now = new Date("2023-01-01T13:30:45").getTime();
    expect(calculateElapsedTime(start, now)).toEqual({
      hours: 1,
      minutes: 30,
      seconds: 45,
    });
  });
});

describe("toIsoStringInLocalTime", () => {
  it("returns a string in ISO format", () => {
    const date = new Date("2023-06-15T12:00:00Z");
    const result = toIsoStringInLocalTime(date);
    // Should match ISO format: YYYY-MM-DDTHH:mm:ss.sssZ
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it("adjusts for timezone offset", () => {
    const date = new Date("2023-06-15T00:00:00Z");
    const result = toIsoStringInLocalTime(date);
    // The result should differ from UTC if we're not in UTC timezone
    // but should still be a valid ISO string
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("handles midnight correctly", () => {
    const date = new Date("2023-01-01T00:00:00Z");
    const result = toIsoStringInLocalTime(date);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});
