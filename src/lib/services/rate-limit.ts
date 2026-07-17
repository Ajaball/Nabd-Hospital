/**
 * A minimal fixed-window rate limiter kept entirely in process memory.
 *
 * LIMITATION (intentional at this scale): the counters live in a single Node
 * process. They reset on redeploy and are NOT shared across serverless
 * instances or regions, so this is not a defense against a distributed
 * brute-force. For a graduation-project deployment on a single Vercel function
 * it is enough to blunt naive credential-stuffing against one email/IP. A
 * production system would move this to Redis (e.g. Upstash) with a sliding
 * window. See docs/DECISIONS.md.
 */

type Window = { count: number; resetAt: number };

const store = new Map<string, Window>();

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

/**
 * Record one attempt for `key` and report whether it is within the limit.
 *
 * @param key         identity of the caller (e.g. `login:<ip>:<email>`)
 * @param limit       max attempts allowed per window
 * @param windowMs    window length in milliseconds
 * @param now         injectable clock for tests
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): RateLimitResult {
  const existing = store.get(key);

  if (!existing || now >= existing.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  const ok = existing.count <= limit;
  return {
    ok,
    remaining: Math.max(0, limit - existing.count),
    retryAfterSeconds: ok ? 0 : Math.ceil((existing.resetAt - now) / 1000),
  };
}

/** Clear a key's window — call on a successful login so the user isn't punished. */
export function resetRateLimit(key: string): void {
  store.delete(key);
}

/** Test-only: wipe all windows. */
export function _clearAllRateLimits(): void {
  store.clear();
}

// Login policy: 5 attempts per 5 minutes per IP+email.
export const LOGIN_RATE_LIMIT = 5;
export const LOGIN_RATE_WINDOW_MS = 5 * 60 * 1000;
