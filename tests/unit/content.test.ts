import { describe, it, expect } from "vitest";
import { ar } from "@/content/ar";

// Smoke test: proves the Vitest harness, the @/* alias, and the content module
// all resolve. Real coverage arrives with each feature phase.
describe("content/ar", () => {
  it("exposes the hospital name in Arabic", () => {
    expect(ar.site.name).toBe("مستشفى نبض");
  });

  it("has no empty user-visible strings at the top level", () => {
    expect(ar.home.heroTitle.length).toBeGreaterThan(0);
    expect(ar.home.heroLead.length).toBeGreaterThan(0);
    expect(ar.actions.bookAppointment.length).toBeGreaterThan(0);
  });
});
