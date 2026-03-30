import { getSubnetBase } from "@/lib/discover_devices";

describe("getSubnetBase", () => {
  it("extracts subnet base from a valid IP", () => {
    expect(getSubnetBase("192.168.1.42")).toBe("192.168.1");
  });

  it("extracts subnet base from another valid IP", () => {
    expect(getSubnetBase("10.0.0.1")).toBe("10.0.0");
  });

  it("handles IP with high octets", () => {
    expect(getSubnetBase("172.16.255.254")).toBe("172.16.255");
  });

  it("returns null for IP with too few octets", () => {
    expect(getSubnetBase("192.168.1")).toBeNull();
  });

  it("returns null for IP with too many octets", () => {
    expect(getSubnetBase("192.168.1.1.1")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getSubnetBase("")).toBeNull();
  });

  it("returns null for non-numeric octets", () => {
    expect(getSubnetBase("abc.def.ghi.jkl")).toBeNull();
  });

  it("returns null for octet out of range (>255)", () => {
    expect(getSubnetBase("192.168.1.256")).toBeNull();
  });

  it("returns null for negative octet", () => {
    expect(getSubnetBase("192.168.-1.1")).toBeNull();
  });

  it("handles boundary values (0 and 255)", () => {
    expect(getSubnetBase("0.0.0.0")).toBe("0.0.0");
    expect(getSubnetBase("255.255.255.255")).toBe("255.255.255");
  });
});
