import { describe, it, expect } from "vitest";
import { nextFileNumber, formatFileNumber } from "@/lib/file-number";

describe("file number generator", () => {
  it("starts at NB-0001 when there are no patients", () => {
    expect(nextFileNumber(null)).toBe("NB-0001");
    expect(nextFileNumber(undefined)).toBe("NB-0001");
  });

  it("increments the current maximum, preserving zero-padding", () => {
    expect(nextFileNumber("NB-0001")).toBe("NB-0002");
    expect(nextFileNumber("NB-0040")).toBe("NB-0041");
    expect(nextFileNumber("NB-0099")).toBe("NB-0100");
  });

  it("formats a raw sequence number", () => {
    expect(formatFileNumber(1)).toBe("NB-0001");
    expect(formatFileNumber(41)).toBe("NB-0041");
  });
});
