import { pluralize } from "@/lib/text_utils";

describe("pluralize", () => {
  it("returns singular word when count is 1", () => {
    expect(pluralize(1, "object", "objects")).toBe("object");
  });

  it("returns plural word when count is 0", () => {
    expect(pluralize(0, "object", "objects")).toBe("objects");
  });

  it("returns plural word when count is greater than 1", () => {
    expect(pluralize(2, "object", "objects")).toBe("objects");
    expect(pluralize(100, "item", "items")).toBe("items");
  });

  it("returns plural word for negative counts", () => {
    expect(pluralize(-1, "object", "objects")).toBe("objects");
  });

  it("handles irregular plurals", () => {
    expect(pluralize(1, "galaxy", "galaxies")).toBe("galaxy");
    expect(pluralize(2, "galaxy", "galaxies")).toBe("galaxies");
    expect(pluralize(1, "nebula", "nebulae")).toBe("nebula");
    expect(pluralize(5, "nebula", "nebulae")).toBe("nebulae");
  });
});
