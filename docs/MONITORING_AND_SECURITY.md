# JS Jewellers — Monitoring, Logging, and Security Runbook

**Prepared:** 12 November 2026
**Audience:** The website owner and the deployment operator.
**Status:** The application-side controls below are implemented and verified
locally, including administrator MFA and a shared-rate-limit adapter. The
external pieces — hosting-layer monitoring and alerting, a centralised log
store, an Upstash (or equivalent) rate-limit store, a WAF/bot layer, CI scanning,
and an independent security review — are **not** configured. No monitoring,
logging, or rate-limit service is contacted by the application today.

This document records what the code does, what it does not do, and the owner
actions required before launch. It does not claim that any external service is
active.

---

## 1. Security headers (implemented)

`next.config.ts` applies these headers to every route:

| Header | Value | Purpose |
| --- | --- | --- |
| `X-Content-Type-Options` | `nosniff` | Stop MIME-type sniffing. |
| `X-Frame-Options` | `DENY` | Block framing/clickjacking. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer leakage. |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` | Disable unneeded browser features. |
| `Cross-Origin-Opener-Policy` | `same-origin` | Isolate the browsing context. |
| `Cross-Origin-Resource-Policy` | `same-origin` | Prevent cross-origin resource embedding. |
| `X-Permitted-Cross-Domain-Policies` | `none` | Block legacy cross-domain policy files. |
| `X-DNS-Prefetch-Control` | `off` | Stop speculative DNS leakage. |
| `Content-Security-Policy` | See §2 | Restrict resource origins. |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Production only, once HTTPS is final. |

`/orders/*`, `/admin/*`, and `/checkout/*` also receive
`Cache-Control: private, no-store`, because they contain personal,
administrative, or draft checkout data. The header tests in
`tests/privacy-guards.test.mjs` cover all of these.

## 2. Content Security Policy

The policy is deliberately conservative and origin-restricted:

- `default-src 'self'`, `base-uri 'self'`, `form-action 'self'`;
- `frame-ancestors 'none'`, `object-src 'none'`;
- `script-src 'self' 'unsafe-inline'` and `style-src 'self' 'unsafe-inline'`
  (Next.js injects inline bootstrap/flight data; a nonce-based policy needs a
  proxy rewrite that is not in scope);
- `img-src 'self' data: blob: https://*.public.blob.vercel-storage.com`;
- `connect-src 'self'` in production (`ws:`/`wss:` are additionally allowed only
  in development for hot reload);
- `upgrade-insecure-requests` in production.

There is no `'unsafe-eval'` in production. If a future change needs a nonce or a
new origin, update the policy and the header tests together
(`tests/privacy-guards.test.mjs`).

## 3. Structured logging (implemented)

`lib/logging/logger.ts` emits one JSON object per line. Entries include a
timestamp, level, service name, environment, event name, and sanitised details.

It redacts:

- database URLs, `Bearer` tokens, Vercel Blob tokens, and JWT-shaped strings;
- `otpauth://` setup URIs, authenticator secrets, recovery codes, and OTP-shaped
  values;
- keys matching password/secret/token/cookie/session/api-key/account/card/PIN/
  OTP/email/phone/address;
- query strings on request paths (they may contain personal data).

Length, depth, and array sizes are bounded. `instrumentation.ts` exports
`onRequestError`, so unhandled server errors are logged without request headers
(headers can contain cookies and authorisation values). The error boundary does
not log the raw error object.

`LOG_LEVEL` may be set to `debug`, `info` (default), `warn`, or `error`.

This is application logging, not a monitoring service. Nothing is shipped off
the host by the application.

## 4. Authentication, MFA, and authorisation (implemented)

- Administrator sessions are database-backed opaque tokens; only SHA-256 token
  hashes are stored.
- Passwords are salted scrypt hashes; comparisons are constant time.
- Sessions expire, can be revoked, and are revoked on password/role changes.
- Login lockout/rate limiting is enforced per IP and per account (5 account
  failures per 15 minutes, 10 per IP).
- **Administrator MFA** is always enforced in production. A password alone never
  creates a session while an authenticator is enrolled; a signed five-minute
  challenge is exchanged for a session only after a TOTP or recovery code is
  verified. TOTP secrets are AES-256-GCM encrypted at rest; recovery codes are
  stored only as scrypt hashes. See `docs/ADMIN_MFA.md`.
- Every protected page and server action checks a permission on the server;
  hidden UI is never the security boundary.
- Account and role management are reserved for the Super Admin role.
- Supplier verification requires the dedicated `suppliers.verify` permission;
  `suppliers.manage` alone cannot mark a supplier `VERIFIED`.
- Authentication, setup, MFA, logout, and profile actions perform an explicit
  same-origin check in addition to the framework's Server Action check.
- The first-admin setup uses a server-only `ADMIN_SETUP_SECRET`, constant-time
  comparison, and a transaction-scoped advisory lock. Setup is permanently
  disabled once any administrator exists.

`ADMIN_SESSION_SECRET` is **not** used by administrator sessions. Sessions are
database-backed, not HMAC-signed. The variable remains an optional legacy
fallback for the checkout-draft signing secret; set `CHECKOUT_DRAFT_SECRET`
instead. Do not list `ADMIN_SESSION_SECRET` as a required production value.

## 5. Rate limiting (implemented, shared store not provisioned)

`lib/security/rate-limit.ts` provides an async adapter:

- `memory` for development and tests (single-instance only);
- `upstash` for production, using the Redis REST API over `fetch`;
- **fail-closed** when the provider is missing, misconfigured, or unreachable.

Production refuses an unset provider and refuses `memory` unless
`RATE_LIMIT_ALLOW_MEMORY_IN_PRODUCTION=true` is set deliberately. Limits cover
sign-in, setup, password change, MFA, checkout, order lookup, payment
submission, returns, and administrator mutations. Full table in
`docs/RATE_LIMITING.md`.

The Upstash account, endpoint, and token do **not** exist yet. Until they are
configured, production rate-limited actions fail closed by design.

## 6. Checkout and order protections (implemented)

- Prices and totals are recomputed on the server; browser values are not trusted.
- The checkout draft is an HTTP-only signed cookie with a 30-minute lifetime.
- Orders require an unguessable access token plus the order number.
- Checkout, order lookup, payment submission, and return requests are rate
  limited through the shared adapter.
- Payment methods appear only when their server-side account values exist; all
  payments are verified manually by an administrator.
- Cash on delivery is impossible.
- Public queries exclude supplier identity, cost, margin, contacts, and notes.

## 7. Known gaps and owner actions

The following are **not** implemented or not configured and must be handled at
the hosting layer or by a future change:

1. **Hosting-layer monitoring and alerting.** Configure uptime checks, 5xx/error
   alerting, database health, failed-login alerts, disk/connection saturation,
   and log retention. Decide who receives alerts and how quickly.
2. **Log collection.** Ship the JSON lines to the host's log drain or an approved
   aggregator. Do not log customer contact details or credentials. Confirm the
   retention period.
3. **Shared rate-limit store.** The adapter exists, but no Upstash (or
   equivalent) store is provisioned. Configure it before running more than one
   instance; see `docs/RATE_LIMITING.md`.
4. **MFA production setup.** The code enforces MFA in production, but the owner
   must generate `ADMIN_MFA_ENCRYPTION_KEY`, enrol the first Super Admin, and
   store recovery codes offline; see `docs/ADMIN_MFA.md`.
5. **Dependency scanning in CI.** Workflows exist locally but are not pushed or
   enabled. Run `npm audit --omit=dev` manually until then; see
   `docs/CI_AND_DEPENDENCY_SCANNING.md`.
6. **Web application firewall / bot protection.** Not configured. Guidance is in
   `docs/WAF_AND_BOT_PROTECTION.md`.
7. **HSTS.** Only enable once the final HTTPS origin is confirmed; the header is
   emitted in production but must not be relied on before HTTPS is enforced.
8. **Penetration test and independent security review.** Not performed.
9. **Secret management.** Use the hosting provider's secret manager. Rotate the
   checkout secret, MFA key, payment values, and Upstash token only through that
   channel. Remove `ADMIN_SETUP_SECRET` after first-admin setup. Never put a
   private value behind `NEXT_PUBLIC_`.
10. **Backup monitoring.** Confirm backups actually run and alert on failure; see
    `docs/BACKUP_RESTORE.md`.
11. **Privacy and legal review.** The policy pages are drafts marked pending
    owner approval and `noindex`. Do not remove the pending notices until legal
    review is complete.

The consolidated, honest status is in `docs/SECURITY_CHECKLIST.md`.

## 8. Incident basics

- If administrator credentials may be compromised: change the password, revoke
  sessions, review the audit log, disable any unknown account, and reset MFA if
  the second factor may also be compromised. A Super Admin can reset another
  administrator's MFA from the user detail page.
- If an authenticator device is lost: use a recovery code, then generate a new
  recovery set. If both device and recovery sheet are lost, a Super Admin resets
  the MFA; the user re-enrols on next sign-in.
- If a secret may have leaked: rotate it in the hosting secret manager, redeploy,
  and check logs for misuse. Rotating `ADMIN_MFA_ENCRYPTION_KEY` makes existing
  authenticators unreadable, so plan re-enrolment. Never paste the old or new
  value into a report.
- If the database is unavailable: check the provider status, connection limits,
  and `DATABASE_URL`; do not run destructive commands while diagnosing.
- If the rate-limit provider is unavailable: production fails closed for
  rate-limited actions. Treat it as an incident, restore the provider, and do not
  bypass the limiter by enabling memory mode without a documented decision.
- Record what happened, when, who was involved, and what was changed. Keep the
  record free of secrets and customer personal data.
