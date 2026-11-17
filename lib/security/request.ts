/**
 * Request helpers for route handlers and server actions.
 */

/** Reject cross-site state-changing requests when the browser sends Origin. */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");

  if (!origin) {
    // Non-browser clients (server-to-server, tests) do not send Origin. The
    // admin cookie is HTTP-only and SameSite=Lax, so this is not a CSRF path.
    return true;
  }

  try {
    const requestUrl = new URL(request.url);
    const originUrl = new URL(origin);

    return (
      requestUrl.protocol === originUrl.protocol &&
      requestUrl.host === originUrl.host
    );
  } catch {
    return false;
  }
}

export function getClientIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip")?.trim();

  if (realIp) {
    return realIp;
  }

  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    const parts = forwarded
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    // Prefer the right-most forwarded value as a safer default when a trusted
    // proxy chain is not explicitly configured here.
    return parts.at(-1) || "unknown";
  }

  return "unknown";
}

/**
 * Compare the browser `Origin` header with the host the request reached.
 *
 * Server Actions already receive framework origin checks, but authentication
 * and profile actions add this explicit defence-in-depth check. A missing Origin
 * is allowed for non-browser clients; cookies remain HTTP-only and SameSite=Lax.
 */
export function isSameOriginRequestHeaders(
  get: (name: string) => string | null,
  production: boolean = process.env.NODE_ENV === "production",
): boolean {
  const origin = get("origin");

  if (!origin) {
    return true;
  }

  let originUrl: URL;

  try {
    originUrl = new URL(origin);
  } catch {
    return false;
  }

  const host =
    get("x-forwarded-host")?.split(",")[0]?.trim() ||
    get("host")?.trim() ||
    "";

  if (!host || originUrl.host !== host) {
    return false;
  }

  const forwardedProto = get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim()
    .toLowerCase();

  if (forwardedProto) {
    return originUrl.protocol === `${forwardedProto}:`;
  }

  return production ? originUrl.protocol === "https:" : true;
}

/** Safe redirect target: only site-relative paths are accepted. */
export function safeRelativePath(
  value: string | null | undefined,
  fallback: string,
): string {
  if (!value) {
    return fallback;
  }

  // Browsers treat a backslash like a forward slash in special URLs, so
  // `/\evil.example` resolves to `//evil.example`. Control characters can be
  // stripped during URL parsing and create the same protocol-relative bypass.
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u001F\u007F]/.test(value)
  ) {
    return fallback;
  }

  return value;
}
