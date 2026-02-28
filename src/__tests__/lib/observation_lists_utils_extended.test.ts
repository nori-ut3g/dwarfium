import {
  processObjectListOpenNGC,
  findFirstObjectByNamesListOpenNGC,
  getObjectByNamesListOpenNGC,
} from "@/lib/observation_lists_utils";
import { ObjectOpenNGC } from "@/types";

// Fixture values match actual dso_catalog.json format:
// numeric fields use number | null (not strings)
const sampleObjects: ObjectOpenNGC[] = [
  {
    "Catalogue Entry": "M 42",
    "Right Ascension": "05:35:17.3",
    Declination: "-05:23:28",
    Magnitude: 4.0,
    Type: "HII region",
    "Type Category": "nebulae",
    "Alternative Entries": "NGC 1976, Great Orion Nebula",
    "Name catalog": "M",
    "Name number": 42,
    Constellation: "Ori",
    "Height (')": 66,
    "Width (')": 60,
    "Major Axis": null,
    "Minor Axis": null,
    Notes: "Orion Nebula",
    "Familiar Name": "Orion Nebula",
  },
  {
    "Catalogue Entry": "NGC 7000",
    "Right Ascension": "20:58:47",
    Declination: "+44:19:48",
    Magnitude: 4.0,
    Type: "HII region",
    "Type Category": "nebulae",
    "Alternative Entries": "C 20",
    "Name catalog": "NGC",
    "Name number": 7000,
    Constellation: "Cyg",
    "Height (')": null,
    "Width (')": null,
    "Major Axis": 120,
    "Minor Axis": 100,
    Notes: null,
    "Familiar Name": "North America Nebula",
  },
  {
    "Catalogue Entry": "M 31",
    "Right Ascension": "00:42:44.3",
    Declination: "+41:16:09",
    Magnitude: 3.4,
    Type: "galaxy",
    "Type Category": "galaxies",
    "Alternative Entries": "NGC 224, Andromeda Galaxy",
    "Name catalog": "M",
    "Name number": 31,
    Constellation: "And",
    "Height (')": 178,
    "Width (')": 63,
    "Major Axis": null,
    "Minor Axis": null,
    Notes: null,
    "Familiar Name": "Andromeda Galaxy",
  },
];

describe("processObjectListOpenNGC", () => {
  it("formats and sorts objects by catalogue and number", () => {
    const result = processObjectListOpenNGC(sampleObjects);

    expect(result).toHaveLength(3);
    // M 31 before M 42 (same catalogue, lower number)
    expect(result[0].designation).toBe("M 31");
    expect(result[1].designation).toBe("M 42");
    // NGC after M
    expect(result[2].designation).toBe("NGC 7000");
  });

  it("formats RA correctly", () => {
    const result = processObjectListOpenNGC(sampleObjects);
    // Should be converted to Dwarf RA format
    const m42 = result.find((o) => o.designation === "M 42");
    expect(m42?.ra).toMatch(/\d+h \d+m/);
  });

  it("formats Dec correctly", () => {
    const result = processObjectListOpenNGC(sampleObjects);
    const m42 = result.find((o) => o.designation === "M 42");
    expect(m42?.dec).toMatch(/[+-]\d+°/);
  });

  it("formats object size from Height/Width", () => {
    const result = processObjectListOpenNGC(sampleObjects);
    const m42 = result.find((o) => o.designation === "M 42");
    expect(m42?.size).toBe("66'x60'");
  });

  it("formats object size from Major/Minor Axis when Height/Width not available", () => {
    const result = processObjectListOpenNGC(sampleObjects);
    const ngc7000 = result.find((o) => o.designation === "NGC 7000");
    expect(ngc7000?.size).toBe("120'x100'");
  });

  it("includes familiar name in displayName", () => {
    const result = processObjectListOpenNGC(sampleObjects);
    const m42 = result.find((o) => o.designation === "M 42");
    expect(m42?.displayName).toBe("M 42 - Orion Nebula");
  });

  it("sets favorite to false by default", () => {
    const result = processObjectListOpenNGC(sampleObjects);
    result.forEach((obj) => {
      expect(obj.favorite).toBe(false);
    });
  });

  it("handles empty array", () => {
    const result = processObjectListOpenNGC([]);
    expect(result).toEqual([]);
  });
});

describe("findFirstObjectByNamesListOpenNGC", () => {
  it("finds object by catalogue entry", () => {
    const result = findFirstObjectByNamesListOpenNGC(sampleObjects, ["m 42"]);
    expect(result).not.toBeNull();
    expect(result!["Catalogue Entry"]).toBe("M 42");
  });

  it("finds object by alternative name", () => {
    const result = findFirstObjectByNamesListOpenNGC(sampleObjects, [
      "ngc 1976",
    ]);
    expect(result).not.toBeNull();
    expect(result!["Catalogue Entry"]).toBe("M 42");
  });

  it("finds object case-insensitively", () => {
    const result = findFirstObjectByNamesListOpenNGC(sampleObjects, ["M 31"]);
    expect(result).not.toBeNull();
    expect(result!["Catalogue Entry"]).toBe("M 31");
  });

  it("returns null when no match found", () => {
    const result = findFirstObjectByNamesListOpenNGC(sampleObjects, [
      "nonexistent",
    ]);
    expect(result).toBeNull();
  });

  it("finds first match among multiple search names", () => {
    const result = findFirstObjectByNamesListOpenNGC(sampleObjects, [
      "xyz",
      "m 42",
    ]);
    expect(result).not.toBeNull();
    expect(result!["Catalogue Entry"]).toBe("M 42");
  });

  it("matches by prefix (startsWith)", () => {
    const result = findFirstObjectByNamesListOpenNGC(sampleObjects, [
      "andromeda",
    ]);
    expect(result).not.toBeNull();
    expect(result!["Catalogue Entry"]).toBe("M 31");
  });
});

describe("getObjectByNamesListOpenNGC", () => {
  it("returns formatted AstroObject when match found", () => {
    const result = getObjectByNamesListOpenNGC(sampleObjects, ["m 42"], []);
    expect(result).toBeDefined();
    expect(result!.designation).toBe("M 42");
    expect(result!.displayName).toBe("M 42 - Orion Nebula");
    expect(result!.favorite).toBe(false);
  });

  it("returns undefined when no match found", () => {
    const result = getObjectByNamesListOpenNGC(
      sampleObjects,
      ["nonexistent"],
      []
    );
    expect(result).toBeUndefined();
  });

  it("sets favorite to true when displayName is in favorites list", () => {
    const result = getObjectByNamesListOpenNGC(sampleObjects, ["m 42"], [
      "M 42 - Orion Nebula",
    ]);
    expect(result).toBeDefined();
    expect(result!.favorite).toBe(true);
  });

  it("sets favorite to false when displayName is not in favorites list", () => {
    const result = getObjectByNamesListOpenNGC(sampleObjects, ["m 42"], [
      "NGC 7000 - North America Nebula",
    ]);
    expect(result).toBeDefined();
    expect(result!.favorite).toBe(false);
  });

  it("handles null objectFavoriteNames", () => {
    const result = getObjectByNamesListOpenNGC(sampleObjects, ["m 42"], null);
    expect(result).toBeDefined();
    expect(result!.favorite).toBe(false);
  });
});
