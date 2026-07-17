import { describe, it, expect, beforeEach } from "vitest";
import {
  rateLimit,
  resetRateLimit,
  _clearAllRateLimits,
} from "@/lib/services/rate-limit";

/**
 * Fixed-window login limiter. The clock is injected so we can test the window
 * boundary deterministically without real time.
 */

beforeEach(() => {
  _clearAllRateLimits();
});

describe("rateLimit", () => {
  it("allows up to the limit, then blocks", () => {
    const key = "login:ip:user";
    const limit = 3;
    const win = 1000;

    expect(rateLimit(key, limit, win, 0).ok).toBe(true); // 1
    expect(rateLimit(key, limit, win, 0).ok).toBe(true); // 2
    expect(rateLimit(key, limit, win, 0).ok).toBe(true); // 3
    const blocked = rateLimit(key, limit, win, 0); // 4
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets once the window elapses", () => {
    const key = "login:ip:user";
    rateLimit(key, 1, 1000, 0);
    expect(rateLimit(key, 1, 1000, 500).ok).toBe(false); // still in window
    expect(rateLimit(key, 1, 1000, 1000).ok).toBe(true); // window rolled over
  });

  it("tracks keys independently", () => {
    expect(rateLimit("a", 1, 1000, 0).ok).toBe(true);
    expect(rateLimit("a", 1, 1000, 0).ok).toBe(false);
    expect(rateLimit("b", 1, 1000, 0).ok).toBe(true);
  });

  it("resetRateLimit clears a key", () => {
    rateLimit("a", 1, 1000, 0);
    expect(rateLimit("a", 1, 1000, 0).ok).toBe(false);
    resetRateLimit("a");
    expect(rateLimit("a", 1, 1000, 0).ok).toBe(true);
  });
});
