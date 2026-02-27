import {
  convertAzToCardinal,
  convertTimePartsToString,
} from "@/lib/astro_utils";

describe("convertAzToCardinal", () => {
  it("returns N for 0 degrees", () => {
    expect(convertAzToCardinal(0)).toBe("N");
  });

  it("returns N for 45 degrees", () => {
    expect(convertAzToCardinal(45)).toBe("N");
  });

  it("returns NE for 46-90 degrees", () => {
    expect(convertAzToCardinal(46)).toBe("NE");
    expect(convertAzToCardinal(90)).toBe("NE");
  });

  it("returns E for 91-135 degrees", () => {
    expect(convertAzToCardinal(91)).toBe("E");
    expect(convertAzToCardinal(135)).toBe("E");
  });

  it("returns SE for 136-180 degrees", () => {
    expect(convertAzToCardinal(136)).toBe("SE");
    expect(convertAzToCardinal(180)).toBe("SE");
  });

  it("returns S for 181-225 degrees", () => {
    expect(convertAzToCardinal(181)).toBe("S");
    expect(convertAzToCardinal(225)).toBe("S");
  });

  it("returns SW for 226-270 degrees", () => {
    expect(convertAzToCardinal(226)).toBe("SW");
    expect(convertAzToCardinal(270)).toBe("SW");
  });

  it("returns W for 271-315 degrees", () => {
    expect(convertAzToCardinal(271)).toBe("W");
    expect(convertAzToCardinal(315)).toBe("W");
  });

  it("returns NW for 316-360 degrees", () => {
    expect(convertAzToCardinal(316)).toBe("NW");
    expect(convertAzToCardinal(360)).toBe("NW");
  });
});

describe("convertTimePartsToString", () => {
  it("converts UTC time parts to local time string", () => {
    const timeParts = { hours: 12, minutes: 30, seconds: 0 };
    const result = convertTimePartsToString(
      { ...timeParts },
      "Europe/Paris",
      false,
      false
    );
    // Should return a formatted time string (locale-dependent)
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("adds one hour for daylight savings", () => {
    const timeParts12h = { hours: 12, minutes: 0, seconds: 0 };
    const timeParts13h = { hours: 13, minutes: 0, seconds: 0 };
    const noDst = convertTimePartsToString(
      { ...timeParts13h },
      "UTC",
      false,
      true
    );
    const withDst = convertTimePartsToString(
      { ...timeParts12h },
      "UTC",
      true,
      true
    );
    expect(noDst).toBe(withDst);
  });

  it("returns 24-hour format when use24Hour is true", () => {
    const timeParts = { hours: 14, minutes: 30, seconds: 0 };
    const result = convertTimePartsToString(
      { ...timeParts },
      "UTC",
      false,
      true
    );
    // 24-hour format should not contain AM/PM
    expect(result).not.toMatch(/AM|PM/i);
  });

  it("returns 12-hour format when use24Hour is false", () => {
    const timeParts = { hours: 14, minutes: 30, seconds: 0 };
    const result = convertTimePartsToString(
      { ...timeParts },
      "UTC",
      false,
      false
    );
    // 12-hour format should contain AM or PM
    expect(result).toMatch(/AM|PM/i);
  });

  it("returns dash for hours >= 24", () => {
    const timeParts = { hours: 24, minutes: 0, seconds: 0 };
    const result = convertTimePartsToString(
      { ...timeParts },
      "UTC",
      false,
      false
    );
    expect(result).toBe("-");
  });

  it("handles 60 seconds edge case", () => {
    // The function clamps 60 seconds to 59
    const timeParts = { hours: 12, minutes: 30, seconds: 60 };
    const result = convertTimePartsToString(
      { ...timeParts },
      "UTC",
      false,
      true
    );
    expect(typeof result).toBe("string");
    expect(result).not.toBe("-");
  });
});
