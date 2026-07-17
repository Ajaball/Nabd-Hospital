/**
 * A tiny fixed-window rate limiter (CLAUDE.md §Phase 2).
 *
 * LIMITATION (by design at this scale): state is an in-memory Map, so limits are
 * per-process. On a multi-instance or serverless deployment each instance keeps
 * its own counters and the effective limit is higher; the counters also reset on
 * restart. For a real deployment this belongs in Redis or the database. It is
 * enough here to blunt naive credential-stuffing against a single instance.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

/**
 * Records one attempt for `key` and reports whether it is within `limit` per
 * `windowMs`. Call once per attempt.
 */
export function hitRateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  const allowed = existing.count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - existing.count),
    retryAfterSeconds: allowed ? 0 : Math.ceil((existing.resetAt - now) / 1000),
  };
}

/** Clears a key's counter — e.g. after a successful login. */
export function resetRateLimit(key: string): void {
  buckets.delete(key);
}
