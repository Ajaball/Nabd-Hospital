/**
 * A minimal in-memory rate limiter for failed login attempts (Phase 2).
 *
 * LIMITATION (by design at this project's scale): the counters live in a single
 * process's memory. They are not shared across instances and reset on restart
 * or redeploy, so on a multi-instance / serverless deployment the effective
 * limit is per-instance. A production system would move this to a shared store
 * such as Redis / Upstash. It is documented here so the tradeoff is explicit.
 *
 * We count only FAILED attempts, keyed by login area + email, and clear nothing
 * eagerly — a bucket simply expires WINDOW_MS after its first failure.
 */

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILURES = 5;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function currentBucket(key: string): Bucket {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    const fresh: Bucket = { count: 0, resetAt: now + WINDOW_MS };
    buckets.set(key, fresh);
    return fresh;
  }
  return existing;
}

export type RateLimitState = { blocked: boolean; retryAfterMinutes: number };

function stateOf(bucket: Bucket): RateLimitState {
  const blocked = bucket.count >= MAX_FAILURES;
  return {
    blocked,
    retryAfterMinutes: blocked
      ? Math.max(1, Math.ceil((bucket.resetAt - Date.now()) / 60000))
      : 0,
  };
}

/** Is this key currently blocked? Does not mutate the counter. */
export function loginRateLimitState(key: string): RateLimitState {
  return stateOf(currentBucket(key));
}

/** Record one failed attempt and return the resulting state. */
export function recordLoginFailure(key: string): RateLimitState {
  const bucket = currentBucket(key);
  bucket.count += 1;
  return stateOf(bucket);
}

/** Clear a key after a successful login. */
export function clearLoginFailures(key: string): void {
  buckets.delete(key);
}
