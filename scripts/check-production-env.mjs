#!/usr/bin/env node
/**
 * Production environment validation.
 *
 * Checks only variable names, presence, and non-sensitive format rules. It
 * never connects to a database, never uses payment credentials, and never
 * prints a value. Safe to run locally, in CI, or in a hosting build step.
 *
 * Usage:
 *   node scripts/check-production-env.mjs
 *   node scripts/check-production-env.mjs --environment=development
 *   node scripts/check-production-env.mjs --self-test
 *
 * Exit codes: 0 = all required values valid; 1 = missing/invalid required
 * value (or a failed self-test).
 */

import { existsSync } from "node:fs";
import process from "node:process";

const PLACEHOLDER_PATTERN =
  /^(?:changeme|change-me|example|placeholder|todo|tbd|your[-_ ].*|xxx+|<.*>|\$\{.*\})$/i;

function valueOf(env, name) {
  return env[name]?.trim() ?? "";
}

function looksLikePlaceholder(value) {
  return PLACEHOLDER_PATTERN.test(value);
}

function validateDatabaseUrl(value) {
  if (!value) return "DATABASE_URL is missing. Set the server-only PostgreSQL connection string.";
  if (looksLikePlaceholder(value)) return "DATABASE_URL still contains a placeholder value.";

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return "DATABASE_URL is not a valid URL. Use a postgresql:// connection string.";
  }

  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    return "DATABASE_URL must start with postgresql:// or postgres://.";
  }
  if (!parsed.hostname) return "DATABASE_URL is missing a database host.";
  if (!parsed.pathname || parsed.pathname === "/") {
    return "DATABASE_URL is missing a database name.";
  }
  if (/\s/.test(value)) return "DATABASE_URL must not contain spaces or line breaks.";

  return null;
}

function validateSiteUrl(value, environment) {
  if (!value) return "NEXT_PUBLIC_SITE_URL is missing. Set the final public website origin.";
  if (looksLikePlaceholder(value)) return "NEXT_PUBLIC_SITE_URL still contains a placeholder value.";

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return "NEXT_PUBLIC_SITE_URL is not a valid absolute URL.";
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return "NEXT_PUBLIC_SITE_URL must use http:// or https://.";
  }

  const isLocal =
    parsed.hostname === "localhost" ||
    parsed.hostname === "127.0.0.1" ||
    parsed.hostname === "[::1]";

  if (environment === "production") {
    if (parsed.protocol !== "https:") return "NEXT_PUBLIC_SITE_URL must use https:// in production.";
    if (isLocal) return "NEXT_PUBLIC_SITE_URL must not point at localhost in production.";
  }

  if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
    return "NEXT_PUBLIC_SITE_URL must be an origin only, without a path, query, or fragment.";
  }

  return null;
}

function validateSecret(value, name, minimumLength) {
  if (!value) return `${name} is missing. Set a long random server-only value.`;
  if (looksLikePlaceholder(value)) return `${name} still contains a placeholder value.`;
  if (value.length < minimumLength) return `${name} must be at least ${minimumLength} characters.`;
  return null;
}

function validateBlobToken(value) {
  if (!value) return "BLOB_READ_WRITE_TOKEN is missing. Product image uploads need Vercel Blob storage.";
  if (looksLikePlaceholder(value)) return "BLOB_READ_WRITE_TOKEN still contains a placeholder value.";
  if (value.length < 20) return "BLOB_READ_WRITE_TOKEN is too short to be a valid Blob token.";
  return null;
}

function validateMfaEncryptionKey(value) {
  if (!value) return "ADMIN_MFA_ENCRYPTION_KEY is missing. Administrator MFA needs an encryption key at rest.";
  if (looksLikePlaceholder(value)) return "ADMIN_MFA_ENCRYPTION_KEY still contains a placeholder value.";
  if (/^[0-9a-f]{64}$/i.test(value)) return null;

  try {
    const decoded = Buffer.from(
      value.replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    );
    if (decoded.length === 32) return null;
  } catch {
    // Fall through to the shared message below.
  }

  return "ADMIN_MFA_ENCRYPTION_KEY must be exactly 32 bytes encoded as base64 or 64 hex characters.";
}

function validateUpstashUrl(value) {
  if (!value) return "UPSTASH_REDIS_REST_URL is missing. Set the Upstash Redis REST URL.";
  if (looksLikePlaceholder(value)) return "UPSTASH_REDIS_REST_URL still contains a placeholder value.";

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return "UPSTASH_REDIS_REST_URL is not a valid URL.";
  }

  if (parsed.protocol !== "https:") return "UPSTASH_REDIS_REST_URL must use https://.";
  if (!parsed.hostname.endsWith(".upstash.io")) {
    return "UPSTASH_REDIS_REST_URL must point at an upstash.io host.";
  }
  if (parsed.username || parsed.password) {
    return "UPSTASH_REDIS_REST_URL must not contain embedded credentials.";
  }

  return null;
}

function validateRateLimitProvider(env) {
  const provider = valueOf(env, "RATE_LIMIT_PROVIDER").toLowerCase();

  if (!provider) {
    return "RATE_LIMIT_PROVIDER is missing. Production must use a shared rate-limit store such as upstash.";
  }

  if (provider === "upstash") return null;

  if (provider === "memory") {
    return valueOf(env, "RATE_LIMIT_ALLOW_MEMORY_IN_PRODUCTION").toLowerCase() === "true"
      ? null
      : "RATE_LIMIT_PROVIDER=memory is not allowed in production. Use upstash or explicitly accept the single-instance limitation.";
  }

  return "RATE_LIMIT_PROVIDER must be \"upstash\" or \"memory\".";
}

function buildReport(environment, env) {
  const entries = [];
  const add = (name, requirement, message, present = Boolean(valueOf(env, name))) => {
    entries.push({ name, requirement, present, valid: message === null, message });
  };

  add("DATABASE_URL", "required", validateDatabaseUrl(valueOf(env, "DATABASE_URL")));
  add(
    "NEXT_PUBLIC_SITE_URL",
    "required",
    validateSiteUrl(valueOf(env, "NEXT_PUBLIC_SITE_URL"), environment),
  );
  add(
    "CHECKOUT_DRAFT_SECRET",
    "required",
    validateSecret(valueOf(env, "CHECKOUT_DRAFT_SECRET"), "CHECKOUT_DRAFT_SECRET", 32),
  );
  add("BLOB_READ_WRITE_TOKEN", "required", validateBlobToken(valueOf(env, "BLOB_READ_WRITE_TOKEN")));

  add(
    "ADMIN_MFA_ENCRYPTION_KEY",
    "required",
    validateMfaEncryptionKey(valueOf(env, "ADMIN_MFA_ENCRYPTION_KEY")),
  );

  const provider = valueOf(env, "RATE_LIMIT_PROVIDER").toLowerCase();
  add("RATE_LIMIT_PROVIDER", "required", validateRateLimitProvider(env));

  const upstashRequired = provider === "upstash";
  add(
    "UPSTASH_REDIS_REST_URL",
    upstashRequired ? "required" : "optional",
    upstashRequired ? validateUpstashUrl(valueOf(env, "UPSTASH_REDIS_REST_URL")) : null,
  );
  add(
    "UPSTASH_REDIS_REST_TOKEN",
    upstashRequired ? "required" : "optional",
    upstashRequired
      ? validateSecret(
          valueOf(env, "UPSTASH_REDIS_REST_TOKEN"),
          "UPSTASH_REDIS_REST_TOKEN",
          20,
        )
      : null,
  );

  const mfaChallengeSecret = valueOf(env, "ADMIN_MFA_CHALLENGE_SECRET");
  add(
    "ADMIN_MFA_CHALLENGE_SECRET",
    "optional",
    mfaChallengeSecret
      ? validateSecret(mfaChallengeSecret, "ADMIN_MFA_CHALLENGE_SECRET", 32)
      : null,
  );

  const setupSecret = valueOf(env, "ADMIN_SETUP_SECRET");
  add(
    "ADMIN_SETUP_SECRET",
    "one-time",
    setupSecret ? validateSecret(setupSecret, "ADMIN_SETUP_SECRET", 32) : null,
  );

  for (const name of [
    "PAYMENT_BANK_ACCOUNT_NUMBER",
    "PAYMENT_BANK_ACCOUNT_HOLDER",
    "PAYMENT_EASYPAISA_NUMBER",
    "PAYMENT_EASYPAISA_ACCOUNT_HOLDER",
    "PAYMENT_BANK_DISPLAY_NAME",
  ]) {
    const value = valueOf(env, name);
    const limit = name === "PAYMENT_BANK_DISPLAY_NAME" ? 80 : 120;
    let message = null;

    if (value.length > limit) message = `${name} is longer than ${limit} characters.`;
    else if (/[\u0000-\u001f\u007f]/.test(value)) message = `${name} contains control characters.`;

    add(name, "optional", message, Boolean(value));
  }

  return {
    environment,
    ok: entries.every((entry) => entry.requirement !== "required" || entry.valid),
    entries,
  };
}

function buildDevelopmentReport(env) {
  const databaseUrl = valueOf(env, "DATABASE_URL");
  const databaseMessage = validateDatabaseUrl(databaseUrl);
  const siteUrl = valueOf(env, "NEXT_PUBLIC_SITE_URL");
  const siteMessage = siteUrl ? validateSiteUrl(siteUrl, "development") : null;
  const mfaKey = valueOf(env, "ADMIN_MFA_ENCRYPTION_KEY");
  const mfaMessage = mfaKey ? validateMfaEncryptionKey(mfaKey) : null;
  const provider = valueOf(env, "RATE_LIMIT_PROVIDER");
  const providerMessage = provider ? validateRateLimitProvider(env) : null;

  const entries = [
    {
      name: "DATABASE_URL",
      requirement: "required",
      present: Boolean(databaseUrl),
      valid: databaseMessage === null,
      message: databaseMessage,
    },
    {
      name: "NEXT_PUBLIC_SITE_URL",
      requirement: "optional",
      present: Boolean(siteUrl),
      valid: siteMessage === null,
      message: siteMessage,
    },
    {
      name: "ADMIN_MFA_ENCRYPTION_KEY",
      requirement: "optional",
      present: Boolean(mfaKey),
      valid: mfaMessage === null,
      message: mfaMessage,
    },
    {
      name: "RATE_LIMIT_PROVIDER",
      requirement: "optional",
      present: Boolean(provider),
      valid: providerMessage === null,
      message: providerMessage,
    },
  ];

  if (provider.toLowerCase() === "upstash") {
    const upstashUrl = valueOf(env, "UPSTASH_REDIS_REST_URL");
    const upstashUrlMessage = validateUpstashUrl(upstashUrl);
    entries.push({
      name: "UPSTASH_REDIS_REST_URL",
      requirement: "required",
      present: Boolean(upstashUrl),
      valid: upstashUrlMessage === null,
      message: upstashUrlMessage,
    });

    const upstashToken = valueOf(env, "UPSTASH_REDIS_REST_TOKEN");
    const upstashTokenMessage = validateSecret(
      upstashToken,
      "UPSTASH_REDIS_REST_TOKEN",
      20,
    );
    entries.push({
      name: "UPSTASH_REDIS_REST_TOKEN",
      requirement: "required",
      present: Boolean(upstashToken),
      valid: upstashTokenMessage === null,
      message: upstashTokenMessage,
    });
  }

  return {
    environment: "development",
    ok: entries.every((entry) => entry.requirement !== "required" || entry.valid),
    entries,
  };
}

function printReport(report) {
  console.log(`Environment validation (${report.environment})`);
  console.log("");

  for (const entry of report.entries) {
    const marker = entry.valid ? "OK" : "FAIL";
    const detail = entry.message ? ` - ${entry.message}` : entry.present ? "" : " - not set";
    console.log(`[${marker}] ${entry.name} (${entry.requirement})${detail}`);
  }

  console.log("");
  console.log(report.ok ? "All required values are present and structurally valid." : "Required values are missing or invalid. Nothing was connected to, changed, or deployed.");

  if (
    report.environment === "production" &&
    report.entries.some((entry) => entry.name === "ADMIN_SETUP_SECRET" && entry.present)
  ) {
    console.log("ADMIN_SETUP_SECRET is set. Remove or rotate it after the first Super Admin exists.");
  }
}

function selfTest() {
  const assertions = [];
  const check = (label, condition) => assertions.push({ label, ok: Boolean(condition) });

  const baseEnv = {
    DATABASE_URL: "postgresql://user:secret@ep-example-123.eu-central-1.aws.neon.tech/neondb?sslmode=require",
    NEXT_PUBLIC_SITE_URL: "https://www.example.pk",
    CHECKOUT_DRAFT_SECRET: "a".repeat(64),
    BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_EXAMPLE_TOKEN_123456789",
    ADMIN_MFA_ENCRYPTION_KEY: "a".repeat(64),
    RATE_LIMIT_PROVIDER: "upstash",
    UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
    UPSTASH_REDIS_REST_TOKEN: "b".repeat(32),
  };

  check("valid production environment passes", buildReport("production", baseEnv).ok);
  check(
    "mysql URL fails",
    !buildReport("production", { ...baseEnv, DATABASE_URL: "mysql://host/db" }).ok,
  );
  check(
    "localhost site URL fails in production",
    !buildReport("production", { ...baseEnv, NEXT_PUBLIC_SITE_URL: "http://localhost:3000" }).ok,
  );
  check(
    "missing Blob token fails",
    !buildReport("production", { ...baseEnv, BLOB_READ_WRITE_TOKEN: "" }).ok,
  );
  check(
    "short checkout secret fails",
    !buildReport("production", { ...baseEnv, CHECKOUT_DRAFT_SECRET: "short" }).ok,
  );
  check(
    "missing MFA encryption key fails",
    !buildReport("production", { ...baseEnv, ADMIN_MFA_ENCRYPTION_KEY: "" }).ok,
  );
  check(
    "short MFA encryption key fails",
    !buildReport("production", { ...baseEnv, ADMIN_MFA_ENCRYPTION_KEY: "short" }).ok,
  );
  check(
    "memory rate limiting fails in production",
    !buildReport("production", { ...baseEnv, RATE_LIMIT_PROVIDER: "memory" }).ok,
  );
  check(
    "missing Upstash URL fails",
    !buildReport("production", { ...baseEnv, UPSTASH_REDIS_REST_URL: "" }).ok,
  );
  check(
    "non-Upstash host fails",
    !buildReport("production", { ...baseEnv, UPSTASH_REDIS_REST_URL: "https://redis.example.com" }).ok,
  );

  const reportText = JSON.stringify(buildReport("production", baseEnv));
  check(
    "report never contains the database password",
    !reportText.includes("secret@") && !reportText.includes(baseEnv.DATABASE_URL),
  );

  let failed = 0;
  for (const assertion of assertions) {
    if (!assertion.ok) failed += 1;
    console.log(`[${assertion.ok ? "PASS" : "FAIL"}] ${assertion.label}`);
  }

  console.log("");
  console.log(failed === 0 ? "Self-test passed." : `${failed} self-test check(s) failed.`);
  process.exit(failed === 0 ? 0 : 1);
}

const args = new Set(process.argv.slice(2));

if (args.has("--self-test")) {
  selfTest();
} else {
  const environmentArg = process.argv
    .slice(2)
    .find((argument) => argument.startsWith("--environment="));

  const environment = environmentArg?.split("=")[1] === "development" ? "development" : "production";

  if (environment === "development" && existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  }

  const report =
    environment === "development"
      ? buildDevelopmentReport(process.env)
      : buildReport("production", process.env);
  printReport(report);
  process.exit(report.ok ? 0 : 1);
}
