/**
 * Server-only production environment validation.
 *
 * This module never returns, logs, or embeds secret values. Reports contain
 * only variable names, presence booleans, and non-sensitive validation
 * messages, so they are safe to print in deployment logs or handover notes.
 *
 * Dependency-free apart from standard JavaScript so it can be unit-tested and
 * reused by deployment scripts.
 */

export type EnvRequirement = "required" | "one-time" | "optional";

export type EnvValidationEntry = {
  name: string;
  requirement: EnvRequirement;
  present: boolean;
  valid: boolean;
  /** Safe, non-secret explanation. Never contains the value. */
  message: string | null;
};

export type EnvValidationReport = {
  environment: "production" | "development";
  ok: boolean;
  entries: EnvValidationEntry[];
};

type Environment = Record<string, string | undefined>;

export const DATABASE_URL_ENV = "DATABASE_URL" as const;
export const SITE_URL_ENV = "NEXT_PUBLIC_SITE_URL" as const;
export const CHECKOUT_DRAFT_SECRET_ENV = "CHECKOUT_DRAFT_SECRET" as const;
export const BLOB_TOKEN_ENV = "BLOB_READ_WRITE_TOKEN" as const;
export const ADMIN_SETUP_SECRET_ENV = "ADMIN_SETUP_SECRET" as const;
export const ADMIN_SESSION_SECRET_ENV = "ADMIN_SESSION_SECRET" as const;
export const ADMIN_MFA_ENCRYPTION_KEY_ENV = "ADMIN_MFA_ENCRYPTION_KEY" as const;
export const ADMIN_MFA_CHALLENGE_SECRET_ENV =
  "ADMIN_MFA_CHALLENGE_SECRET" as const;
export const ADMIN_MFA_REQUIRED_ENV = "ADMIN_MFA_REQUIRED" as const;
export const RATE_LIMIT_PROVIDER_ENV = "RATE_LIMIT_PROVIDER" as const;
export const UPSTASH_URL_ENV = "UPSTASH_REDIS_REST_URL" as const;
export const UPSTASH_TOKEN_ENV = "UPSTASH_REDIS_REST_TOKEN" as const;
export const RATE_LIMIT_ALLOW_MEMORY_ENV =
  "RATE_LIMIT_ALLOW_MEMORY_IN_PRODUCTION" as const;

export const PAYMENT_ENV_NAMES = [
  "PAYMENT_BANK_DISPLAY_NAME",
  "PAYMENT_BANK_ACCOUNT_NUMBER",
  "PAYMENT_BANK_ACCOUNT_HOLDER",
  "PAYMENT_EASYPAISA_NUMBER",
  "PAYMENT_EASYPAISA_ACCOUNT_HOLDER",
] as const;

const PLACEHOLDER_PATTERN =
  /^(?:changeme|change-me|example|placeholder|todo|tbd|your[-_ ].*|xxx+|<.*>|\$\{.*\})$/i;

function valueOf(env: Environment, name: string): string {
  return env[name]?.trim() ?? "";
}

function looksLikePlaceholder(value: string): boolean {
  return PLACEHOLDER_PATTERN.test(value);
}

/**
 * Validate a PostgreSQL connection string without connecting to it.
 *
 * The returned message is safe to display: it never echoes the URL, because a
 * connection string contains a password.
 */
export function validateDatabaseUrl(value: string): string | null {
  if (!value) {
    return `${DATABASE_URL_ENV} is missing. Set the server-only PostgreSQL connection string.`;
  }

  if (looksLikePlaceholder(value)) {
    return `${DATABASE_URL_ENV} still contains a placeholder value.`;
  }

  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    return `${DATABASE_URL_ENV} is not a valid URL. Use a postgresql:// connection string.`;
  }

  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    return `${DATABASE_URL_ENV} must start with postgresql:// or postgres://.`;
  }

  if (!parsed.hostname) {
    return `${DATABASE_URL_ENV} is missing a database host.`;
  }

  if (!parsed.pathname || parsed.pathname === "/") {
    return `${DATABASE_URL_ENV} is missing a database name.`;
  }

  if (/[\s]/.test(value)) {
    return `${DATABASE_URL_ENV} must not contain spaces or line breaks.`;
  }

  return null;
}

/**
 * Validate a public site URL. Production must use HTTPS; local development may
 * use HTTP on localhost.
 */
export function validateSiteUrl(
  value: string,
  environment: "production" | "development",
): string | null {
  if (!value) {
    return `${SITE_URL_ENV} is missing. Set the final public website origin.`;
  }

  if (looksLikePlaceholder(value)) {
    return `${SITE_URL_ENV} still contains a placeholder value.`;
  }

  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    return `${SITE_URL_ENV} is not a valid absolute URL.`;
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return `${SITE_URL_ENV} must use http:// or https://.`;
  }

  const isLocal =
    parsed.hostname === "localhost" ||
    parsed.hostname === "127.0.0.1" ||
    parsed.hostname === "[::1]";

  if (environment === "production") {
    if (parsed.protocol !== "https:") {
      return `${SITE_URL_ENV} must use https:// in production.`;
    }

    if (isLocal) {
      return `${SITE_URL_ENV} must not point at localhost in production.`;
    }
  }

  if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
    return `${SITE_URL_ENV} must be an origin only, without a path, query, or fragment.`;
  }

  return null;
}

/** Validate a long random signing secret without revealing it. */
export function validateSecret(
  value: string,
  name: string,
  minimumLength: number,
): string | null {
  if (!value) {
    return `${name} is missing. Set a long random server-only value.`;
  }

  if (looksLikePlaceholder(value)) {
    return `${name} still contains a placeholder value.`;
  }

  if (value.length < minimumLength) {
    return `${name} must be at least ${minimumLength} characters.`;
  }

  return null;
}

/**
 * Validate the Vercel Blob token shape. The token is never returned or logged.
 * Vercel issues tokens with a recognisable prefix; older tokens are accepted
 * when they are long enough to be treated as a secret.
 */
export function validateBlobToken(value: string): string | null {
  if (!value) {
    return `${BLOB_TOKEN_ENV} is missing. Product image uploads need Vercel Blob storage.`;
  }

  if (looksLikePlaceholder(value)) {
    return `${BLOB_TOKEN_ENV} still contains a placeholder value.`;
  }

  if (value.length < 20) {
    return `${BLOB_TOKEN_ENV} is too short to be a valid Blob token.`;
  }

  return null;
}

function validateOptionalAccountValue(
  name: string,
  value: string,
  maxLength: number,
): string | null {
  if (!value) {
    return null;
  }

  if (value.length > maxLength) {
    return `${name} is longer than ${maxLength} characters.`;
  }

  if (/[\u0000-\u001f\u007f]/.test(value)) {
    return `${name} contains control characters.`;
  }

  return null;
}

/**
 * Validate a 32-byte MFA encryption key without revealing it. The key may be
 * standard base64, base64url, or 64 hexadecimal characters.
 */
export function validateMfaEncryptionKey(value: string): string | null {
  if (!value) {
    return `${ADMIN_MFA_ENCRYPTION_KEY_ENV} is missing. Administrator MFA needs an encryption key at rest.`;
  }

  if (looksLikePlaceholder(value)) {
    return `${ADMIN_MFA_ENCRYPTION_KEY_ENV} still contains a placeholder value.`;
  }

  if (/^[0-9a-f]{64}$/i.test(value)) {
    return null;
  }

  const decoded = Buffer.from(
    value.replace(/-/g, "+").replace(/_/g, "/"),
    "base64",
  );

  if (decoded.length !== 32) {
    return `${ADMIN_MFA_ENCRYPTION_KEY_ENV} must be exactly 32 bytes encoded as base64 or 64 hex characters.`;
  }

  return null;
}

/** Require an HTTPS Upstash REST endpoint with no embedded credentials. */
export function validateUpstashUrl(value: string): string | null {
  if (!value) {
    return `${UPSTASH_URL_ENV} is missing. Set the Upstash Redis REST URL.`;
  }

  if (looksLikePlaceholder(value)) {
    return `${UPSTASH_URL_ENV} still contains a placeholder value.`;
  }

  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    return `${UPSTASH_URL_ENV} is not a valid URL.`;
  }

  if (parsed.protocol !== "https:") {
    return `${UPSTASH_URL_ENV} must use https://.`;
  }

  if (!parsed.hostname.endsWith(".upstash.io")) {
    return `${UPSTASH_URL_ENV} must point at an upstash.io host.`;
  }

  if (parsed.username || parsed.password) {
    return `${UPSTASH_URL_ENV} must not contain embedded credentials.`;
  }

  return null;
}

export function validateRateLimitProvider(env: Environment): string | null {
  const provider = valueOf(env, RATE_LIMIT_PROVIDER_ENV).toLowerCase();

  if (!provider) {
    return `${RATE_LIMIT_PROVIDER_ENV} is missing. Production must use a shared rate-limit store such as upstash.`;
  }

  if (provider === "upstash") {
    return null;
  }

  if (provider === "memory") {
    return valueOf(env, RATE_LIMIT_ALLOW_MEMORY_ENV).toLowerCase() === "true"
      ? null
      : `${RATE_LIMIT_PROVIDER_ENV}=memory is not allowed in production. Use upstash or explicitly accept the single-instance limitation with ${RATE_LIMIT_ALLOW_MEMORY_ENV}=true.`;
  }

  return `${RATE_LIMIT_PROVIDER_ENV} must be "upstash" or "memory".`;
}

/**
 * Build a production-readiness report for environment variable names.
 *
 * Required in production: database URL, public site URL, checkout signing
 * secret, and Blob token (needed for durable product images). The one-time
 * setup secret is optional but reported. Payment values are optional so the
 * storefront can deploy without taking payments, but their presence is
 * reported honestly.
 *
 * `ADMIN_SESSION_SECRET` is deliberately not required: administrator sessions
 * are database-backed opaque tokens, and no HMAC session secret is used by the
 * current implementation.
 */
export function getProductionEnvReport(
  env: Environment = process.env,
): EnvValidationReport {
  const entries: EnvValidationEntry[] = [];

  const add = (
    name: string,
    requirement: EnvRequirement,
    message: string | null,
    present = Boolean(valueOf(env, name)),
  ) => {
    entries.push({
      name,
      requirement,
      present,
      valid: message === null,
      message,
    });
  };

  const databaseUrl = valueOf(env, DATABASE_URL_ENV);
  add(DATABASE_URL_ENV, "required", validateDatabaseUrl(databaseUrl));

  const siteUrl = valueOf(env, SITE_URL_ENV);
  add(SITE_URL_ENV, "required", validateSiteUrl(siteUrl, "production"));

  const checkoutSecret = valueOf(env, CHECKOUT_DRAFT_SECRET_ENV);
  add(
    CHECKOUT_DRAFT_SECRET_ENV,
    "required",
    validateSecret(checkoutSecret, CHECKOUT_DRAFT_SECRET_ENV, 32),
  );

  const blobToken = valueOf(env, BLOB_TOKEN_ENV);
  add(BLOB_TOKEN_ENV, "required", validateBlobToken(blobToken));

  const mfaKey = valueOf(env, ADMIN_MFA_ENCRYPTION_KEY_ENV);
  add(
    ADMIN_MFA_ENCRYPTION_KEY_ENV,
    "required",
    validateMfaEncryptionKey(mfaKey),
  );

  const rateLimitProvider = valueOf(env, RATE_LIMIT_PROVIDER_ENV).toLowerCase();
  add(
    RATE_LIMIT_PROVIDER_ENV,
    "required",
    validateRateLimitProvider(env),
  );

  const upstashRequired = rateLimitProvider === "upstash";
  const upstashUrl = valueOf(env, UPSTASH_URL_ENV);
  add(
    UPSTASH_URL_ENV,
    upstashRequired ? "required" : "optional",
    upstashRequired ? validateUpstashUrl(upstashUrl) : null,
  );

  const upstashToken = valueOf(env, UPSTASH_TOKEN_ENV);
  add(
    UPSTASH_TOKEN_ENV,
    upstashRequired ? "required" : "optional",
    upstashRequired
      ? validateSecret(upstashToken, UPSTASH_TOKEN_ENV, 20)
      : null,
  );

  const mfaChallengeSecret = valueOf(env, ADMIN_MFA_CHALLENGE_SECRET_ENV);
  add(
    ADMIN_MFA_CHALLENGE_SECRET_ENV,
    "optional",
    mfaChallengeSecret
      ? validateSecret(
          mfaChallengeSecret,
          ADMIN_MFA_CHALLENGE_SECRET_ENV,
          32,
        )
      : null,
  );

  const setupSecret = valueOf(env, ADMIN_SETUP_SECRET_ENV);
  add(
    ADMIN_SETUP_SECRET_ENV,
    "one-time",
    setupSecret
      ? validateSecret(setupSecret, ADMIN_SETUP_SECRET_ENV, 32)
      : null,
  );

  for (const name of [
    "PAYMENT_BANK_ACCOUNT_NUMBER",
    "PAYMENT_BANK_ACCOUNT_HOLDER",
    "PAYMENT_EASYPAISA_NUMBER",
    "PAYMENT_EASYPAISA_ACCOUNT_HOLDER",
    "PAYMENT_BANK_DISPLAY_NAME",
  ] as const) {
    const value = valueOf(env, name);
    const isDisplayName = name === "PAYMENT_BANK_DISPLAY_NAME";
    add(
      name,
      "optional",
      validateOptionalAccountValue(name, value, isDisplayName ? 80 : 120),
      Boolean(value),
    );
  }

  return {
    environment: "production",
    ok: entries.every((entry) => entry.requirement !== "required" || entry.valid),
    entries,
  };
}

/**
 * Build a local-development report. Only the database URL is structurally
 * required; secrets may fall back to documented development behaviour.
 */
export function getDevelopmentEnvReport(
  env: Environment = process.env,
): EnvValidationReport {
  const databaseUrl = valueOf(env, DATABASE_URL_ENV);
  const entries: EnvValidationEntry[] = [
    {
      name: DATABASE_URL_ENV,
      requirement: "required",
      present: Boolean(databaseUrl),
      valid: validateDatabaseUrl(databaseUrl) === null,
      message: validateDatabaseUrl(databaseUrl),
    },
  ];

  const siteUrl = valueOf(env, SITE_URL_ENV);
  const siteMessage = siteUrl
    ? validateSiteUrl(siteUrl, "development")
    : null;

  entries.push({
    name: SITE_URL_ENV,
    requirement: "optional",
    present: Boolean(siteUrl),
    valid: siteMessage === null,
    message: siteMessage,
  });

  const mfaKey = valueOf(env, ADMIN_MFA_ENCRYPTION_KEY_ENV);
  const mfaMessage = mfaKey ? validateMfaEncryptionKey(mfaKey) : null;
  entries.push({
    name: ADMIN_MFA_ENCRYPTION_KEY_ENV,
    requirement: "optional",
    present: Boolean(mfaKey),
    valid: mfaMessage === null,
    message: mfaMessage,
  });

  const provider = valueOf(env, RATE_LIMIT_PROVIDER_ENV);
  const providerMessage = provider ? validateRateLimitProvider(env) : null;
  entries.push({
    name: RATE_LIMIT_PROVIDER_ENV,
    requirement: "optional",
    present: Boolean(provider),
    valid: providerMessage === null,
    message: providerMessage,
  });

  if (provider.toLowerCase() === "upstash") {
    const upstashUrl = valueOf(env, UPSTASH_URL_ENV);
    const upstashUrlMessage = validateUpstashUrl(upstashUrl);
    entries.push({
      name: UPSTASH_URL_ENV,
      requirement: "required",
      present: Boolean(upstashUrl),
      valid: upstashUrlMessage === null,
      message: upstashUrlMessage,
    });

    const upstashToken = valueOf(env, UPSTASH_TOKEN_ENV);
    const upstashTokenMessage = validateSecret(
      upstashToken,
      UPSTASH_TOKEN_ENV,
      20,
    );
    entries.push({
      name: UPSTASH_TOKEN_ENV,
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
