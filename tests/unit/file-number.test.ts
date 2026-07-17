import { describe, it, expect } from "vitest";
import { formatFileNumber, parseFileNumber } from "@/lib/services/patients";

/**
 * The patient file-number allocator is a pure formatter/parser pair; the
 * uniqueness guarantee is the DB constraint, tested elsewhere. Here we prove
 * the NB-#### format and that format/parse round-trip.
 */

describe("formatFileNumber", () => {
  it("zero-pads to 4 digits with the NB- prefix", () => {
    expect(formatFileNumber(1)).toBe("NB-0001");
    expect(formatFileNumber(42)).toBe("NB-0042");
    expect(formatFileNumber(1234)).toBe("NB-1234");
  });

  it("does not truncate numbers beyond 4 digits", () => {
    expect(formatFileNumber(12345)).toBe("NB-12345");
  });
});

describe("parseFileNumber", () => {
  it("extracts the numeric sequence", () => {
    expect(parseFileNumber("NB-0001")).toBe(1);
    expect(parseFileNumber("NB-0042")).toBe(42);
  });

  it("round-trips with formatFileNumber", () => {
    for (const n of [1, 7, 40, 999, 1000]) {
      expect(parseFileNumber(formatFileNumber(n))).toBe(n);
    }
  });

  it("returns 0 for values that don't match the format", () => {
    expect(parseFileNumber("X-0001")).toBe(0);
    expect(parseFileNumber("NB-abcd")).toBe(0);
    expect(parseFileNumber("")).toBe(0);
  });
});
