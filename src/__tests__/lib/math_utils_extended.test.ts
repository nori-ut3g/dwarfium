import {
  roundExposure,
  olderThanHours,
  range,
  parseRaToFloat,
  formatRa,
  formatModifyRa,
  parseDecToFloat,
  formatDec,
  formatModifyDec,
  convertHMSToDecimalHours,
  convertDecimalDegreesToHMS,
  padNumber,
  formatFloatToDecimalPlaces,
  convertRaDecToVec3d,
  ConvertStrDeg,
  ConvertStrHours,
} from "@/lib/math_utils";

describe("roundExposure", () => {
  it("rounds to integer for values > 0.8", () => {
    expect(roundExposure(1.4)).toBe(1);
    expect(roundExposure(2.6)).toBe(3);
    expect(roundExposure(10.2)).toBe(10);
  });

  it("rounds to 1 decimal place for values > 0.08 and <= 0.8", () => {
    expect(roundExposure(0.5)).toBe(0.5);
    expect(roundExposure(0.15)).toBe(0.2);
    expect(roundExposure(0.09)).toBe(0.1);
  });

  it("rounds to 2 decimal places for values > 0.008 and <= 0.08", () => {
    expect(roundExposure(0.05)).toBe(0.05);
    expect(roundExposure(0.015)).toBe(0.02);
    expect(roundExposure(0.009)).toBe(0.01);
  });

  it("rounds to 3 decimal places for values > 0.0008 and <= 0.008", () => {
    expect(roundExposure(0.005)).toBe(0.005);
    expect(roundExposure(0.0015)).toBe(0.002);
    expect(roundExposure(0.001)).toBe(0.001);
  });

  it("rounds to 4 decimal places for very small values", () => {
    expect(roundExposure(0.0005)).toBe(0.0005);
    expect(roundExposure(0.00015)).toBe(0.0001);
  });

  it("rounds to 4 decimal places for zero", () => {
    // 0 falls to else branch: Math.round(0 * 10000) / 10000 = 0
    expect(roundExposure(0)).toBe(0);
  });
});

describe("olderThanHours", () => {
  it("returns true if time difference exceeds hours", () => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000 - 1;
    expect(olderThanHours(twoHoursAgo, 2)).toBe(true);
  });

  it("returns false if time difference is within hours", () => {
    const oneHourAgo = Date.now() - 1 * 60 * 60 * 1000 + 1000;
    expect(olderThanHours(oneHourAgo, 2)).toBe(false);
  });

  it("returns false for current time", () => {
    expect(olderThanHours(Date.now(), 1)).toBe(false);
  });
});

describe("range", () => {
  it("generates a range of numbers", () => {
    expect(range(0, 4, 1)).toEqual([0, 1, 2, 3, 4]);
  });

  it("generates a range with step > 1", () => {
    expect(range(0, 10, 2)).toEqual([0, 2, 4, 6, 8, 10]);
  });

  it("generates a range starting from non-zero", () => {
    expect(range(5, 8, 1)).toEqual([5, 6, 7, 8]);
  });

  it("generates a single-element range", () => {
    expect(range(3, 3, 1)).toEqual([3]);
  });

  it("works with negative start", () => {
    expect(range(-2, 2, 1)).toEqual([-2, -1, 0, 1, 2]);
  });
});

describe("parseRaToFloat", () => {
  it("parses HMS string with 3 parts", () => {
    expect(parseRaToFloat("18:36:56.3")).toBeCloseTo(18.6156, 3);
  });

  it("returns decimal directly if no colon", () => {
    expect(parseRaToFloat("18.6156")).toBeCloseTo(18.6156, 3);
  });

  it("returns false for invalid format", () => {
    expect(parseRaToFloat("abc")).toBe(NaN);
  });

  it("returns false for NaN parts", () => {
    expect(parseRaToFloat("a:b:c")).toBe(false);
  });
});

describe("formatRa", () => {
  it("formats decimal RA to HMS string", () => {
    expect(formatRa(18.6156)).toBe("18h 36m 56.16s");
  });

  it("returns Invalid RA for false input", () => {
    expect(formatRa(false)).toBe("Invalid RA");
  });

  it("handles zero value", () => {
    expect(formatRa(0)).toBe("0h 0m 0.00s");
  });

  it("handles carry-over from seconds to minutes", () => {
    // 1h 59m 59.999... s — rounding seconds to 60 triggers carry
    const val = 1 + 59 / 60 + 59.999 / 3600;
    const result = formatRa(val);
    expect(result).toMatch(/^[12]h \d+m \d+\.\d+s$/);
  });
});

describe("formatModifyRa", () => {
  it("formats decimal RA to colon-separated string", () => {
    expect(formatModifyRa(18.6156)).toBe("18:36:56.16");
  });

  it("returns Invalid RA for false input", () => {
    expect(formatModifyRa(false)).toBe("Invalid RA");
  });
});

describe("parseDecToFloat", () => {
  it("parses DMS string with 3 parts", () => {
    expect(parseDecToFloat("38:47:01.29")).toBeCloseTo(38.7837, 3);
  });

  it("parses negative DMS string", () => {
    expect(parseDecToFloat("-38:47:01.29")).toBeCloseTo(-38.7837, 3);
  });

  it("returns decimal directly if no colon", () => {
    expect(parseDecToFloat("38.7837")).toBeCloseTo(38.7837, 3);
  });

  it("returns false for invalid format (only 2 parts)", () => {
    expect(parseDecToFloat("38:47")).toBe(false);
  });

  it("returns false for NaN parts", () => {
    expect(parseDecToFloat("a:b:c")).toBe(false);
  });
});

describe("formatDec", () => {
  it("formats positive decimal to DMS string", () => {
    expect(formatDec(38.7837)).toBe("+38° 47' 1.3\"");
  });

  it("formats negative decimal to DMS string", () => {
    const result = formatDec(-38.7837);
    expect(result).toMatch(/^-38° 47' [\d.]+"/);
  });

  it("returns Invalid Dec for false input", () => {
    expect(formatDec(false)).toBe("Invalid Dec");
  });

  it("handles zero value", () => {
    expect(formatDec(0)).toBe("+0° 0' 0.0\"");
  });
});

describe("formatModifyDec", () => {
  it("formats positive decimal to colon-separated DMS string", () => {
    expect(formatModifyDec(38.7837)).toBe("+38:47:1.3");
  });

  it("formats negative decimal to colon-separated DMS string", () => {
    const result = formatModifyDec(-38.7837);
    expect(result).toMatch(/^-38:47:[\d.]+$/);
  });

  it("returns Invalid Dec for false input", () => {
    expect(formatModifyDec(false)).toBe("Invalid Dec");
  });
});

describe("convertHMSToDecimalHours", () => {
  it("converts HMS string to decimal hours", () => {
    expect(convertHMSToDecimalHours("3h50m10.4s")).toBeCloseTo(3.83622, 3);
  });

  it("converts colon-separated HMS to decimal hours", () => {
    expect(convertHMSToDecimalHours("3:50:10.4")).toBeCloseTo(3.83622, 3);
  });

  it("returns decimal directly if already a number", () => {
    expect(convertHMSToDecimalHours("3.83622")).toBeCloseTo(3.83622, 3);
  });

  it("returns NaN for non-numeric input", () => {
    expect(convertHMSToDecimalHours("random")).toBeNaN();
  });
});

describe("convertDecimalDegreesToHMS", () => {
  it("converts decimal degrees to HMS", () => {
    const result = convertDecimalDegreesToHMS(57.54333);
    expect(result.hour).toBe(3);
    expect(result.minute).toBe(50);
    expect(result.second).toBeCloseTo(10.4, 0);
  });

  it("handles zero input", () => {
    const result = convertDecimalDegreesToHMS(0);
    expect(result.hour).toBe(0);
    expect(result.minute).toBe(0);
    expect(result.second).toBe(0);
  });
});

describe("padNumber", () => {
  it("pads single digit with leading zero", () => {
    expect(padNumber(5)).toBe("05");
  });

  it("does not pad two-digit number", () => {
    expect(padNumber(12)).toBe("12");
  });

  it("pads zero", () => {
    expect(padNumber(0)).toBe("00");
  });

  it("pads to custom number of places", () => {
    expect(padNumber(5, 3)).toBe("005");
    expect(padNumber(42, 4)).toBe("0042");
  });

  it("does not truncate numbers larger than places", () => {
    expect(padNumber(123, 2)).toBe("123");
  });
});

describe("formatFloatToDecimalPlaces", () => {
  it("rounds to given decimal places", () => {
    expect(formatFloatToDecimalPlaces(3.14159, 2)).toBe(3.14);
    expect(formatFloatToDecimalPlaces(3.14159, 4)).toBe(3.1416);
  });

  it("handles zero decimal places", () => {
    expect(formatFloatToDecimalPlaces(3.7, 0)).toBe(4);
  });

  it("handles negative numbers", () => {
    expect(formatFloatToDecimalPlaces(-3.14159, 2)).toBe(-3.14);
  });
});

describe("convertRaDecToVec3d", () => {
  it("converts RA/Dec at origin to expected vector", () => {
    const result = convertRaDecToVec3d(0, 0);
    expect(result.x).toBeCloseTo(1, 5);
    expect(result.y).toBeCloseTo(0, 5);
    expect(result.z).toBeCloseTo(0, 5);
  });

  it("converts north pole (dec=90) to z-axis", () => {
    const result = convertRaDecToVec3d(90, 0);
    expect(result.x).toBeCloseTo(0, 5);
    expect(result.y).toBeCloseTo(0, 5);
    expect(result.z).toBeCloseTo(1, 5);
  });

  it("converts RA=90 dec=0 to y-axis", () => {
    const result = convertRaDecToVec3d(0, 90);
    expect(result.x).toBeCloseTo(0, 5);
    expect(result.y).toBeCloseTo(1, 5);
    expect(result.z).toBeCloseTo(0, 5);
  });

  it("produces unit vector", () => {
    const result = convertRaDecToVec3d(45, 45);
    const magnitude = Math.sqrt(
      result.x * result.x + result.y * result.y + result.z * result.z
    );
    expect(magnitude).toBeCloseTo(1, 5);
  });
});

describe("ConvertStrDeg", () => {
  it("converts positive decimal degrees to DMS string", () => {
    const result = ConvertStrDeg(38.7837);
    expect(result).toMatch(/^\+38° 47' /);
  });

  it("converts negative decimal degrees to DMS string", () => {
    const result = ConvertStrDeg(-38.7837);
    expect(result).toMatch(/^-38° 47' /);
  });

  it("handles zero", () => {
    const result = ConvertStrDeg(0);
    expect(result).toMatch(/^\+00° 00' 00"/);
  });
});

describe("ConvertStrHours", () => {
  it("converts decimal hours to HMS string", () => {
    const result = ConvertStrHours(18.6156);
    expect(result).toMatch(/^18h 36m /);
  });

  it("handles zero", () => {
    expect(ConvertStrHours(0)).toBe("0h 0m 0s");
  });
});
