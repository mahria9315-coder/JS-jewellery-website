# JS Jewellers — Security Checklist

**Prepared:** 12 November 2026
**Audience:** The website owner, the deployment operator, and a future reviewer.
**Purpose:** A single, honest security checklist that separates what the
repository implements from what the owner/operator must still do.

A checkbox marked `[x]` means implemented **and verified locally**. A checkbox
marked `[ ]` means it is **not done** — either it needs an external account,
credential, approval, or real data. Do not mark an external action complete on
the owner's behalf.

**Current verdict: NOT READY (NO-GO).** The application-side controls are
strong, but launch-blocking external gates remain (see §9).

---

## 1. Authentication and sessions

- [x] No default administrator credentials and no public administrator sign-up.
- [x] One-time first-admin setup with a server-only `ADMIN_SETUP_SECRET`,
      constant-time comparison, advisory lock, and permanent disablement once an
      account exists.
- [x] Salted scrypt password hashing with constant-time verification and a
      minimum length of 12.
- [x] Database-backed sessions using opaque random tokens; only SHA-256 token
      hashes are stored.
- [x] Session expiry (eight hours), server-side revocation, and revocation of
      other sessions after a password change.
- [x] Account lockout/rate limiting on sign-in.
- [x] **Administrator MFA** (TOTP + ten single-use recovery codes), always
      enforced in production; password alone never creates a session while an
      authenticator is enrolled.
- [x] TOTP secrets encrypted at rest with AES-256-GCM under
      `ADMIN_MFA_ENCRYPTION_KEY`; recovery codes stored only as scrypt hashes.
- [x] TOTP replay prevented with a stored time-step counter.
- [x] Super Admin can reset another administrator's MFA, with audit logging.
- [x] Explicit same-origin checks on sign-in, setup, logout, MFA, and profile
      actions (defence in depth on top of framework checks).
- [x] Authentication failures return generic messages.
- [ ] Production `ADMIN_MFA_ENCRYPTION_KEY` generated and stored securely.
- [ ] First Super Admin created by the owner; authenticator enrolled; recovery
      codes stored offline.
- [ ] Every staff account enrolled in MFA at creation.

## 2. Authorization and administration

- [x] Server-side permission checks on admin pages and every mutation.
- [x] Super Admin role boundary for account and role management; permission
      flags alone are not sufficient.
- [x] Dedicated `suppliers.verify` permission so `suppliers.manage` cannot mark
      a supplier `VERIFIED`.
- [x] Last active Super Admin cannot be disabled or demoted.
- [x] Per-actor rate limits on administrator mutations (30/5 min sensitive,
      180/5 min standard).
- [x] Audit log for administrative changes, including MFA events.
- [ ] Owner defines staff roles with least privilege and reviews the audit log
      regularly.

## 3. Customer-facing application

- [x] Server-priced cart and checkout; no browser-supplied price or total is
      trusted.
- [x] Signed checkout-draft cookie with an expiry; review page rendered at
      request time.
- [x] Order access requires an unguessable token plus the order number.
- [x] Order lookup, payment submission, return request, and checkout are rate
      limited.
- [x] Public queries and customer order projections exclude supplier identity,
      cost, margin, contacts, and notes.
- [x] Payment methods fail closed until their server environment values exist;
      nothing is auto-verified.
- [x] Couriers and destinations fail closed until fully approved.
- [x] Demo content can never be published or ordered.
- [x] Product-image upload validates content and fails closed in production
      without durable storage.

## 4. Data protection and secrets

- [x] No secrets, credentials, or production connection strings in source or
      documentation.
- [x] `.env.local` and `backups/` are Git-ignored.
- [x] Environment reports print only names, presence booleans, and safe
      messages — never values.
- [x] Structured logging redacts credentials, tokens, contact details,
      authenticator secrets, recovery codes, and query strings.
- [x] Unhandled server errors are logged without request headers.
- [x] Database backups/restores use guarded scripts that do not print connection
      strings and refuse to overwrite the application database without an
      explicit override.
- [ ] Production secrets stored in the hosting provider's secret manager.
- [ ] `ADMIN_SETUP_SECRET` removed or rotated after first-admin setup.
- [ ] Database backups scheduled and a restore rehearsed.
- [ ] Encryption key backed up in a way the owner controls.

## 5. Transport and headers

- [x] CSP with no `unsafe-eval` in production; inline scripts/styles are
      permitted pending a nonce-based policy.
- [x] `X-Content-Type-Options: nosniff`.
- [x] `X-Frame-Options: DENY` and `frame-ancestors 'none'`.
- [x] `Referrer-Policy: strict-origin-when-cross-origin`.
- [x] `Permissions-Policy` denies camera, microphone, geolocation, and payment.
- [x] COOP `same-origin`, CORP `same-origin`,
      `X-Permitted-Cross-Domain-Policies: none`, `X-DNS-Prefetch-Control: off`.
- [x] Production HSTS (`max-age=31536000; includeSubDomains`).
- [x] `Cache-Control: private, no-store` on `/admin/*`, `/orders/*`, and
      `/checkout/*`.
- [ ] HTTPS enforced at the edge and `X-Forwarded-Proto: https` forwarded.
- [ ] A nonce-based CSP considered if the framework integration is approved
      (not required for launch, but removes `unsafe-inline`).

## 6. Rate limiting and abuse resistance

- [x] Async rate-limit adapter with `memory` (dev/test) and Upstash REST
      (production).
- [x] Fail-closed when the provider is missing, misconfigured, or unreachable.
- [x] Limits on sign-in, setup, password change, MFA, checkout, order lookup,
      payment submission, returns, and admin mutations.
- [x] Production refuses an unset provider and refuses memory without explicit
      opt-in.
- [ ] Upstash (or approved shared) store provisioned.
- [ ] `RATE_LIMIT_PROVIDER`, `UPSTASH_REDIS_REST_URL`, and
      `UPSTASH_REDIS_REST_TOKEN` set in production.
- [ ] Edge/WAF rate limits configured in front of the application.

## 7. Monitoring, logging, and incident response

- [x] Structured JSON application logs with redaction.
- [x] `onRequestError` hook for unhandled server errors.
- [x] Audit log for administrative actions.
- [ ] Centralised log collection / log drain.
- [ ] Alerting for availability, 5xx, database health, failed logins, backup
      failures, and WAF events.
- [ ] A documented incident-response owner and escalation path.
- [ ] Intrusion monitoring or a WAF (see `docs/WAF_AND_BOT_PROTECTION.md`).

## 8. Build, CI, and supply chain

- [x] Typecheck, lint, tests, contrast checks, Prisma validation, and production
      build pass locally.
- [x] `npm audit --omit=dev` clean.
- [x] CI, CodeQL, and Dependabot configuration prepared locally.
- [x] Guarded backup/restore scripts with self-tests.
- [ ] GitHub repository connected and workflows pushed and reviewed.
- [ ] CodeQL and Dependabot enabled; code scanning entitlement confirmed.
- [ ] `main` branch protected and CI required before merge.
- [ ] Secret scanning and push protection enabled.
- [ ] A named person triages security findings within a stated time.

## 9. Launch-blocking external gates

These are the items that keep the verdict at **NO-GO**. None can be completed
from the repository alone.

- [ ] Approved supplier identities, agreements, SKUs, costs, stock, and image
      rights loaded; publication evidence recorded.
- [ ] Supplier availability, transmission, fulfilment, settlement, and profit
      decisions approved.
- [ ] At least one payment method fully configured and manually verified with a
      non-production test.
- [ ] Production Neon PostgreSQL provisioned; least-privilege role; migrations
      applied with `prisma migrate deploy`; restore rehearsed.
- [ ] Vercel Blob store provisioned and `BLOB_READ_WRITE_TOKEN` set.
- [ ] `NEXT_PUBLIC_SITE_URL`, `CHECKOUT_DRAFT_SECRET`,
      `ADMIN_MFA_ENCRYPTION_KEY`, and the Upstash values supplied securely.
- [ ] Hosting, domain, DNS, and TLS configured; HTTPS-only enforced.
- [ ] WAF/bot protection configured and alerting assigned.
- [ ] Backups, PITR (verified against the plan), monitoring, and alerting live.
- [ ] Legal review and owner approval of privacy, terms, returns, and shipping
      wording; pending notices and `noindex` removed only after approval.
- [ ] First Super Admin created by the owner and MFA-enrolled; setup secret
      removed.
- [ ] Full test/typecheck/lint/contrast/build/migration/env suite re-run on the
      release candidate.
- [ ] Independent security review / penetration test (recommended before
      handling real customer data).
- [ ] **Explicit written owner approval to deploy.**

## 10. Known limitations to carry into launch

- CSP allows inline script/style (framework constraint) and has no nonce yet.
- Streaming admin/order shells may return soft 200/307 statuses rather than hard
  307/404; no data is leaked, but status semantics are soft.
- The admin payment settings' `enabled` and display-label fields are
  informational only; availability is governed solely by server environment
  configuration.
- Memory rate limiting is single-instance only.
- MFA covers TOTP only; no passkeys, hardware keys, SMS, or device trust.
- No automated alert is sent when MFA is reset or disabled (the audit log
  records it).
- No penetration test has been performed.

---

**Summary:** every application-side control in this checklist is implemented and
covered by local tests. The release remains **NOT READY (NO-GO)** because the
external/owner gates in §9 are incomplete. Update this file only with verified
evidence; never mark an external action complete on someone else's behalf.
