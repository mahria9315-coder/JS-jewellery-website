import assert from "node:assert/strict";
import test from "node:test";

import {
  signPayload,
  verifyPayload,
} from "../lib/security/signed-payload.ts";
import {
  checkRateLimit,
  describeRateLimitConfiguration,
  resetRateLimitStoreForTests,
} from "../lib/security/rate-limit.ts";

process.env.CHECKOUT_DRAFT_SECRET = "test-draft-secret-not-a-real-secret";
process.env.RATE_LIMIT_PROVIDER = "memory";
delete process.env.RATE_LIMIT_ALLOW_MEMORY_IN_PRODUCTION;

function uniqueKey(label) {
  return `${label}:${Math.random().toString(36).slice(2)}`;
}

test("signed checkout payloads round-trip", () => {
  const token = signPayload({ orderId: "abc", paymentMethod: "bank-transfer" });
  const payload = verifyPayload(token);

  assert.ok(payload);
  assert.equal(payload.orderId, "abc");
  assert.equal(payload.paymentMethod, "bank-transfer");
  assert.equal(typeof payload.exp, "number");
});

test("tampered and malformed payloads are rejected", () => {
  const token = signPayload({ orderId: "abc" });
  const [segment, signature] = token.split(".");

  assert.equal(verifyPayload(`${segment}.${signature.slice(0, -2)}xx`), null);
  assert.equal(verifyPayload(`${segment}x.${signature}`), null);
  assert.equal(verifyPayload(""), null);
  assert.equal(verifyPayload("only-one-part"), null);
  assert.equal(verifyPayload("a.b"), null);
});

test("expired payloads are rejected", () => {
  const expired = signPayload({ orderId: "abc" }, -1);

  assert.equal(verifyPayload(expired), null);
});

test("the rate limiter allows exactly the configured number of attempts", async () => {
  const key = uniqueKey("login");

  assert.deepEqual(await checkRateLimit(key, 3, 60_000), {
    allowed: true,
    remaining: 2,
    retryAfterSeconds: 0,
  });
  assert.equal((await checkRateLimit(key, 3, 60_000)).allowed, true);
  assert.equal((await checkRateLimit(key, 3, 60_000)).allowed, true);

  const blocked = await checkRateLimit(key, 3, 60_000);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
  assert.ok(blocked.retryAfterSeconds > 0);
});

test("rate limit buckets are isolated per key", async () => {
  const first = uniqueKey("ip-a");
  const second = uniqueKey("ip-b");

  await checkRateLimit(first, 1, 60_000);

  assert.equal((await checkRateLimit(first, 1, 60_000)).allowed, false);
  assert.equal((await checkRateLimit(second, 1, 60_000)).allowed, true);
});

test("rate limit windows reset after expiry", async () => {
  const key = uniqueKey("window");

  assert.equal((await checkRateLimit(key, 1, 200)).allowed, true);

  const blocked = await checkRateLimit(key, 1, 200);
  assert.equal(blocked.allowed, false);

  const start = Date.now();
  while (Date.now() - start < 250) {
    // Busy-wait past the 200ms window without relying on timers.
  }

  assert.equal((await checkRateLimit(key, 1, 200)).allowed, true);
});

test("production fails closed when no shared provider is configured", async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousProvider = process.env.RATE_LIMIT_PROVIDER;

  try {
    process.env.NODE_ENV = "production";
    delete process.env.RATE_LIMIT_PROVIDER;
    resetRateLimitStoreForTests();

    const result = await checkRateLimit(uniqueKey("production"), 5, 60_000);

    assert.equal(result.allowed, false);
    assert.equal(result.unavailable, true);
    assert.equal(describeRateLimitConfiguration().configured, false);
  } finally {
    process.env.NODE_ENV = previousNodeEnv;
    process.env.RATE_LIMIT_PROVIDER = previousProvider;
    resetRateLimitStoreForTests();
  }
});

test("production refuses silent in-memory fallback without an explicit opt-in", async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousProvider = process.env.RATE_LIMIT_PROVIDER;

  try {
    process.env.NODE_ENV = "production";
    process.env.RATE_LIMIT_PROVIDER = "memory";
    delete process.env.RATE_LIMIT_ALLOW_MEMORY_IN_PRODUCTION;
    resetRateLimitStoreForTests();

    const result = await checkRateLimit(uniqueKey("memory"), 5, 60_000);

    assert.equal(result.allowed, false);
    assert.equal(result.unavailable, true);

    process.env.RATE_LIMIT_ALLOW_MEMORY_IN_PRODUCTION = "true";
    resetRateLimitStoreForTests();

    assert.equal(
      (await checkRateLimit(uniqueKey("memory-opt-in"), 5, 60_000)).allowed,
      true,
    );
  } finally {
    process.env.NODE_ENV = previousNodeEnv;
    process.env.RATE_LIMIT_PROVIDER = previousProvider;
    delete process.env.RATE_LIMIT_ALLOW_MEMORY_IN_PRODUCTION;
    resetRateLimitStoreForTests();
  }
});

test("upstash provider requires both URL and token", () => {
  const configuration = describeRateLimitConfiguration({
    NODE_ENV: "production",
    RATE_LIMIT_PROVIDER: "upstash",
  });

  assert.equal(configuration.configured, false);
  assert.match(configuration.message ?? "", /UPSTASH_REDIS_REST_URL/);
});
