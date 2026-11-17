/**
 * Shared rate-limit adapter.
 *
 * Local development and tests use an in-process counter. Production must use a
 * shared Redis-compatible store so every server instance sees the same bucket.
 * The adapter deliberately fails closed: if the provider is not configured, is
 * misconfigured, or cannot be reached, the protected action is refused rather
 * than silently falling back to process-local memory.
 *
 * Supported providers:
 *   - `memory`  (development/test only by default)
 *   - `upstash` (Upstash Redis REST API, called with fetch; no SDK/account is
 *                bundled and no credential is assumed)
 */

export const RATE_LIMIT_PROVIDER_ENV = "RATE_LIMIT_PROVIDER" as const;
export const UPSTASH_URL_ENV = "UPSTASH_REDIS_REST_URL" as const;
export const UPSTASH_TOKEN_ENV = "UPSTASH_REDIS_REST_TOKEN" as const;
export const RATE_LIMIT_ALLOW_MEMORY_ENV =
  "RATE_LIMIT_ALLOW_MEMORY_IN_PRODUCTION" as const;

const KEY_PREFIX = "jsjewellers:ratelimit:";
const UPSTASH_TIMEOUT_MS = 3000;

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  /**
   * True when the limiter itself could not run. Callers must treat this as a
   * refusal; it is surfaced separately so operations can log the cause.
   */
  unavailable?: boolean;
};

type IncrementResult = {
  count: number;
  resetAtMs: number;
};

type RateLimitStore = {
  readonly name: string;
  increment(key: string, windowMs: number): Promise<IncrementResult>;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const MAX_BUCKETS = 5000;

class MemoryRateLimitStore implements RateLimitStore {
  readonly name = "memory";
  private readonly buckets = new Map<string, Bucket>();
  private lastCleanup = Date.now();

  async increment(key: string, windowMs: number): Promise<IncrementResult> {
    const now = Date.now();
    this.cleanup(now);

    const existing = this.buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      const resetAt = now + windowMs;
      this.buckets.set(key, { count: 1, resetAt });
      return { count: 1, resetAtMs: resetAt };
    }

    existing.count += 1;
    return { count: existing.count, resetAtMs: existing.resetAt };
  }

  private cleanup(now: number) {
    if (now - this.lastCleanup < 60_000) {
      return;
    }

    this.lastCleanup = now;

    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) {
        this.buckets.delete(key);
      }
    }

    if (this.buckets.size > MAX_BUCKETS) {
      const excess = this.buckets.size - MAX_BUCKETS;
      let removed = 0;

      for (const key of this.buckets.keys()) {
        this.buckets.delete(key);
        removed += 1;

        if (removed >= excess) {
          break;
        }
      }
    }
  }
}

const UPSTASH_SCRIPT = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
return {current, redis.call('PTTL', KEYS[1])}
`.trim();

class UpstashRateLimitStore implements RateLimitStore {
  readonly name = "upstash";
  private readonly url: string;
  private readonly token: string;

  constructor(url: string, token: string) {
    this.url = url.replace(/\/+$/, "");
    this.token = token;
  }

  async increment(key: string, windowMs: number): Promise<IncrementResult> {
    const response = await fetch(`${this.url}/eval`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        script: UPSTASH_SCRIPT,
        keys: [`${KEY_PREFIX}${key}`],
        args: [String(windowMs)],
      }),
      signal: AbortSignal.timeout(UPSTASH_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`Upstash rate limit request failed with ${response.status}.`);
    }

    const body = (await response.json()) as {
      result?: unknown;
      error?: unknown;
    };

    if (body.error !== undefined) {
      throw new Error("Upstash rate limit request returned an error.");
    }

    if (!Array.isArray(body.result) || body.result.length < 2) {
      throw new Error("Upstash rate limit response was not understood.");
    }

    const count = Number(body.result[0]);
    const ttlMs = Number(body.result[1]);

    if (!Number.isFinite(count) || !Number.isFinite(ttlMs)) {
      throw new Error("Upstash rate limit response was not understood.");
    }

    return {
      count,
      resetAtMs: Date.now() + Math.max(ttlMs, 0),
    };
  }
}

type Resolution =
  | { ok: true; store: RateLimitStore }
  | { ok: false; message: string };

let cachedStore: { signature: string; store: RateLimitStore } | null = null;

function resolveStore(
  env: Record<string, string | undefined> = process.env,
): Resolution {
  const provider = env[RATE_LIMIT_PROVIDER_ENV]?.trim().toLowerCase();
  const production = env.NODE_ENV === "production";

  if (!provider) {
    if (production) {
      return {
        ok: false,
        message: `${RATE_LIMIT_PROVIDER_ENV} is not configured. Production must use a shared rate-limit store.`,
      };
    }

    return { ok: true, store: new MemoryRateLimitStore() };
  }

  if (provider === "memory") {
    if (
      production &&
      env[RATE_LIMIT_ALLOW_MEMORY_ENV]?.trim().toLowerCase() !== "true"
    ) {
      return {
        ok: false,
        message:
          "In-memory rate limiting is disabled in production. Configure a shared provider.",
      };
    }

    return { ok: true, store: new MemoryRateLimitStore() };
  }

  if (provider === "upstash") {
    const url = env[UPSTASH_URL_ENV]?.trim();
    const token = env[UPSTASH_TOKEN_ENV]?.trim();

    if (!url || !token) {
      return {
        ok: false,
        message: `${UPSTASH_URL_ENV} and ${UPSTASH_TOKEN_ENV} must both be set when ${RATE_LIMIT_PROVIDER_ENV}=upstash.`,
      };
    }

    return { ok: true, store: new UpstashRateLimitStore(url, token) };
  }

  return {
    ok: false,
    message: `${RATE_LIMIT_PROVIDER_ENV} must be "upstash" or "memory".`,
  };
}

function getStore(): Resolution {
  const signature = [
    process.env.RATE_LIMIT_PROVIDER ?? "",
    process.env.UPSTASH_REDIS_REST_URL ?? "",
    process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
    process.env.RATE_LIMIT_ALLOW_MEMORY_IN_PRODUCTION ?? "",
    process.env.NODE_ENV ?? "",
  ].join("|");

  if (cachedStore && cachedStore.signature === signature) {
    return { ok: true, store: cachedStore.store };
  }

  const resolution = resolveStore();

  if (!resolution.ok) {
    return resolution;
  }

  cachedStore = { signature, store: resolution.store };
  return resolution;
}

/**
 * Consume one unit from a bucket.
 *
 * The result is fail-closed when the adapter is unavailable. Callers must show
 * a retry message rather than allowing the protected operation.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const resolution = getStore();

  if (!resolution.ok) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 60,
      unavailable: true,
    };
  }

  let result: IncrementResult;

  try {
    result = await resolution.store.increment(key, windowMs);
  } catch {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 60,
      unavailable: true,
    };
  }

  if (result.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((result.resetAtMs - Date.now()) / 1000),
      ),
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, limit - result.count),
    retryAfterSeconds: 0,
  };
}

/** Test-only hook: discard the cached adapter after changing environment. */
export function resetRateLimitStoreForTests(): void {
  cachedStore = null;
}

/** Safe, non-secret description used by environment self-tests and docs. */
export function describeRateLimitConfiguration(
  env: Record<string, string | undefined> = process.env,
): { provider: string; configured: boolean; message: string | null } {
  const resolution = resolveStore(env);

  if (!resolution.ok) {
    return {
      provider: env[RATE_LIMIT_PROVIDER_ENV]?.trim() || "unset",
      configured: false,
      message: resolution.message,
    };
  }

  return {
    provider: resolution.store.name,
    configured: true,
    message: null,
  };
}
