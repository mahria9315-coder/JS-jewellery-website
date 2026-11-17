# JS Jewellers — T064 Security Audit

**Date:** 12 November 2026
**Scope:** Read-only audit before the T064 hardening implementation.
**Method:** Repository inspection only. No production system, account, credential,
database, or external service was contacted. No penetration test was performed.

## 1. Summary

No critical or high-severity defect was found in the existing authentication,
authorization, checkout, payment, upload, database, or secret-handling code. The
application already has strong foundations: database-backed administrator
sessions, scrypt password hashing, server-side permission checks, server-priced
checkout, signed checkout drafts, fail-closed payments and couriers, upload
signature validation, CSP/HSTS, and structured log redaction.

The material gaps are capability and operational gaps rather than broken
controls:

| # | Gap | Severity | Phase |
| --- | --- | --- | --- |
| 1 | No administrator MFA; a stolen password is sufficient to sign in | High if exposed to the internet | 2 |
| 2 | Rate limiting is in-process only, so it is not shared across instances | Medium | 3 |
| 3 | Some sensitive admin actions (payment verification, refunds, role/user changes, settings) rely only on session + permission, with no per-actor operation limit | Medium | 3 |
| 4 | No WAF, bot protection, or hosting-layer abuse controls | Medium (owner/hosting) | 4 |
| 5 | No CI dependency scanning, CodeQL, or Dependabot configuration in the repository | Medium | 5 |
| 6 | CSP still allows `'unsafe-inline'` scripts because Next.js injects inline bootstrap data; no nonce proxy | Low/accepted | 6 |
| 7 | Missing a few defence-in-depth response headers (CORP, DNS-prefetch, cross-domain policy) | Low | 6 |
| 8 | The client error boundary writes the raw error object to the browser console | Low | 6 |
| 9 | No administrator password-recovery flow exists (so no recovery endpoint can be abused) | Informational | 7 |
| 10 | No MFA reset/recovery path for a lost authenticator and lost recovery codes | Operational | 2 |

## 2. Authentication and sessions

**Verified strengths**

- Administrator sessions are database-backed opaque tokens (`lib/admin/session.ts`).
  Only a SHA-256 hash of the token is stored.
- Cookies are `httpOnly`, `sameSite=lax`, `secure` in production, and expire
  after 8 hours.
- Sessions are revoked on password change, account disablement, and logout.
- Expired sessions are deleted.
- Login failures are counted per account with a 15-minute lockout after five
  failures; the response is generic and password hashing runs for unknown
  emails to reduce timing differences.
- First-admin setup uses a server-only secret, constant-time comparison, and a
  transaction-scoped advisory lock. It is permanently disabled once any
  administrator exists.
- `ADMIN_SESSION_SECRET` is not used for administrator sessions. It is only a
  legacy fallback for the checkout-draft signer.

**Gaps**

- No second factor. Password compromise equals administrative access.
- The first-admin setup and login both call `createAdminSession`; any future
  alternate login route must also pass the MFA gate (Phase 2 adds that gate to
  all session creation paths).
- No recovery-code or authenticator-loss process.

## 3. Authorization

**Verified strengths**

- Every admin page calls `requireAdminPage`, `requireAdminSession`, or
  `requireSuperAdminPage`.
- Every admin server action uses `authorizeAdminRequest` or
  `authorizeSuperAdminRequest`; role/user IDs in request bodies are never
  trusted.
- `users.manage` and `roles.manage` are reserved to the Super Admin role and
  enforced on the server, not just hidden in the UI.
- Supplier verification requires the dedicated `suppliers.verify` permission.
- Public queries exclude supplier identity, cost, margin, contacts, and notes.

**Gap**

- Sensitive admin mutations are permission-checked but not individually
  rate-limited per actor (Phase 3).

## 4. Checkout, orders, and payments

**Verified strengths**

- Cart and checkout totals are recomputed server-side; browser prices are not
  trusted.
- The checkout draft is an HTTP-only HMAC-signed cookie, re-validated before
  order creation.
- Country eligibility is re-read from approved couriers at placement time.
- Payment methods appear only when their server-only number and holder values
  exist; every payment is verified manually by an administrator.
- Cash on delivery is impossible in the enum, validation, and tests.
- Order lookup requires an unguessable access token plus the order number.
- Checkout creation, draft saving, order lookup, and admin login/setup use rate
  limiting.

**Gaps**

- The limiter is a process-local `Map`, not a shared store.
- Customer payment submission has no dedicated rate limit (it is bounded by the
  payment state machine and the order token).
- There is no automated payment gateway, so no webhook-signature surface exists
  to review or harden.

## 5. Uploads and media

**Verified strengths**

- Uploads accept only JPEG, PNG, WebP, and AVIF; size is capped at 8 MB.
- Leading bytes are checked against the declared MIME type, so a renamed file
  is rejected.
- File names are slugified; caller-supplied paths are never used.
- Vercel Blob deletion targets the exact stored object.
- Production uploads fail closed when no Blob token is configured.
- The media library accepts only local raster paths and validated Blob product
  URLs; SVG and remote arbitrary URLs are rejected.

**No material gap found.**

## 6. Security headers and response handling

**Verified strengths**

- Global CSP with `default-src 'self'`, `base-uri 'self'`, `form-action 'self'`,
  `frame-ancestors 'none'`, `object-src 'none'`, no `'unsafe-eval'` in
  production, and origin-restricted image/connect sources.
- `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`,
  `Permissions-Policy`, and `Cross-Origin-Opener-Policy`.
- Production-only HSTS.
- `Cache-Control: private, no-store` on `/admin/*` and `/orders/*`.

**Gaps**

- No `Cross-Origin-Resource-Policy`, `X-Permitted-Cross-Domain-Policies`, or
  `X-DNS-Prefetch-Control`.
- `/checkout/*` is not explicitly marked `private, no-store`.
- CSP inline-script allowance is an accepted Next.js constraint until a nonce
  proxy is implemented.
- The client error boundary logs the raw error object to the browser console.

## 7. Logging and error handling

**Verified strengths**

- Structured JSON lines with bounded depth/length.
- Redaction of database URLs, bearer tokens, Blob tokens, JWTs, and
  password/secret/token/cookie/session/account/contact keys.
- Query strings are stripped from logged paths.
- Unhandled server errors are logged without request headers.
- The rendered error boundary never exposes `error.message` or a stack.

**Gaps**

- Client-side console logging of the raw error object (Phase 6).
- No hosting-layer log drain or alerting (owner action).

## 8. Database and environment

**Verified strengths**

- Prisma with parameterized queries; the only raw SQL is a constant advisory
  lock.
- `DATABASE_URL` is validated structurally without printing it.
- One Prisma client per process, optional bounded pool.
- Production environment checks fail closed and never print values.
- Migrations are additive and run with `prisma migrate deploy`.

**Gaps**

- MFA and shared-rate-limit environment variables do not exist yet (Phases 2–3).
- Production database backup/PITR/restore rehearsal remains unverified (owner).

## 9. CSRF and origin protection

Next.js Server Actions already compare `Origin`/`Host` for state-changing
requests. The repository also has an `isSameOrigin` helper that is currently
unused. Phase 6 adds an explicit header-based check to the authentication,
setup, and MFA actions as defence in depth and covers it with tests.

## 10. Audit conclusion

The existing application is safe to continue developing and testing locally.
Production remains **NOT READY** because MFA, a shared rate-limit store, WAF/bot
protection, CI scanning, external accounts/secrets, production backups, legal
approval, and final deployment approval are not in place. T064 addresses the
locally implementable items and documents the rest honestly.
