/**
 * Minimal structured JSON logger for server-side events.
 *
 * Design goals:
 *   - one JSON object per line, so any host can collect it without parsing;
 *   - no secret values, credentials, cookies, or customer contact details;
 *   - no dependency, so it is safe to import from instrumentation and tests.
 *
 * Client components must not import this module: they cannot see server
 * environment variables and their console output is not a log stream.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogDetails = Record<string, unknown>;

const SERVICE_NAME = "js-jewellers";
const MAX_STRING_LENGTH = 500;
const MAX_DEPTH = 4;
const MAX_ARRAY_ITEMS = 20;

const SENSITIVE_KEY =
  /(password|passwd|secret|token|authorization|cookie|session|api[-_]?key|account[-_]?number|account[-_]?holder|card[-_]?number|cvv|pin|otp|mfa|recovery[-_]?code|authenticator|email|phone|address)/i;

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function configuredMinimumLevel(): LogLevel {
  const configured = (process.env.LOG_LEVEL ?? "").trim().toLowerCase();

  if (configured === "debug" || configured === "info" || configured === "warn" || configured === "error") {
    return configured;
  }

  return "info";
}

/** Redact credential-shaped substrings and cap length. */
export function sanitizeLogString(value: string): string {
  const redacted = value
    .replace(/postgres(?:ql)?:\/\/[^\s"'`]+/gi, "[redacted-database-url]")
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [redacted]")
    .replace(/vercel_blob_(?:rw|ro)_[A-Za-z0-9_=-]+/gi, "[redacted-blob-token]")
    .replace(/otpauth:\/\/[^\s"'`]+/gi, "[redacted-otpauth-uri]")
    .replace(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, "[redacted-jwt]");

  return redacted.length > MAX_STRING_LENGTH
    ? `${redacted.slice(0, MAX_STRING_LENGTH)}…`
    : redacted;
}

/** Recursively redact sensitive keys and credential-shaped strings. */
export function sanitizeLogDetails(
  value: unknown,
  depth = 0,
): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return sanitizeLogString(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (value instanceof Date) return value.toISOString();

  if (depth >= MAX_DEPTH) return "[truncated]";

  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_ARRAY_ITEMS)
      .map((item) => sanitizeLogDetails(item, depth + 1));
  }

  if (typeof value === "object") {
    const result: Record<string, unknown> = {};

    for (const [key, item] of Object.entries(value)) {
      result[key] = SENSITIVE_KEY.test(key)
        ? "[redacted]"
        : sanitizeLogDetails(item, depth + 1);
    }

    return result;
  }

  return "[unserialisable]";
}

export function createLogEntry(
  level: LogLevel,
  event: string,
  details: LogDetails = {},
): Record<string, unknown> {
  return {
    timestamp: new Date().toISOString(),
    level,
    service: SERVICE_NAME,
    environment: process.env.NODE_ENV ?? "unknown",
    event,
    ...(sanitizeLogDetails(details) as LogDetails),
  };
}

/** Emit one JSON line. The caller's message is sanitised, never raw. */
export function logEvent(
  level: LogLevel,
  event: string,
  details: LogDetails = {},
): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[configuredMinimumLevel()]) {
    return;
  }

  const line = JSON.stringify(createLogEntry(level, event, details));

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

/**
 * Log a server request error without request headers. Headers can contain
 * cookies, authorisation values, and customer data and are deliberately never
 * passed here.
 */
export function logRequestError(
  error: unknown,
  request: { path?: string; method?: string },
  context: {
    routerKind?: string;
    routePath?: string;
    routeType?: string;
  } = {},
): void {
  const errorObject = error instanceof Error ? error : null;
  const digest =
    error && typeof error === "object" && "digest" in error
      ? String((error as { digest?: unknown }).digest ?? "")
      : "";

  logEvent("error", "request.error", {
    path: sanitizePath(request.path),
    method: request.method ?? "unknown",
    routerKind: context.routerKind ?? "unknown",
    routePath: context.routePath ?? "unknown",
    routeType: context.routeType ?? "unknown",
    digest: digest || null,
    errorName: errorObject?.name ?? typeof error,
    message: errorObject?.message ?? String(error),
  });
}

/** Log only the pathname; query strings may contain personal data. */
export function sanitizePath(path: string | undefined): string {
  if (!path) return "unknown";

  const queryIndex = path.indexOf("?");

  return sanitizeLogString(queryIndex === -1 ? path : path.slice(0, queryIndex));
}
