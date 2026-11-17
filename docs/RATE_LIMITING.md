# JS Jewellers — Shared Rate Limiting

**Prepared:** 12 November 2026
**Audience:** The deployment operator and the website owner.
**Status:** Implemented and verified locally. No Upstash account, endpoint, or
token exists. Until a shared provider is configured in production, the
application **fails closed** for rate-limited actions.

This document describes how rate limiting works, how to configure a shared
store, the limits in force, and what remains an owner action.

---

## 1. Why a shared store

Earlier versions kept counters in process memory. That is correct on a single
server but lets an attacker multiply their allowance by hitting every instance
behind a load balancer. T064 replaces the in-process counter with an async
adapter that can use a Redis-compatible store shared by every instance.

The adapter is in `lib/security/rate-limit.ts`.

| Provider | When allowed | How it works |
| --- | --- | --- |
| `memory` | Development and tests by default; production only with an explicit opt-in | In-process `Map`, bounded to 5,000 buckets with periodic cleanup. |
| `upstash` | Recommended for production | Upstash Redis REST API called with `fetch`; a Lua script increments the key and sets the first-write expiry atomically. No SDK or account is bundled. |

**Fail-closed behaviour:** if the provider is unset in production, misconfigured,
or unreachable, `checkRateLimit` returns `allowed: false` with
`unavailable: true`. Protected actions refuse rather than silently falling back
to memory. This is deliberate: a rate limiter that disappears under load is
worse than an explicit refusal.

---

## 2. Configuration

| Variable | Required | Notes |
| --- | --- | --- |
| `RATE_LIMIT_PROVIDER` | **Yes in production** | `upstash` recommended. `memory` is refused in production unless explicitly allowed. |
| `UPSTASH_REDIS_REST_URL` | When `upstash` | Must be `https://` and an `*.upstash.io` host with no embedded credentials. |
| `UPSTASH_REDIS_REST_TOKEN` | When `upstash` | Server-only bearer token. |
| `RATE_LIMIT_ALLOW_MEMORY_IN_PRODUCTION` | Optional | Set `true` only for a deliberate single-instance deployment. Document the limitation. |

Local development needs no configuration: with `NODE_ENV !== "production"` and
no provider set, the adapter uses memory.

Validate without revealing values:

```bash
npm run env:check             # production report; fails when the provider is unset
npm run env:check:dev         # local report
node scripts/check-production-env.mjs --self-test
```

The self-test includes: missing provider fails, `memory` in production fails,
missing Upstash URL fails, a non-`upstash.io` host fails, and the report never
prints a credential.

### Creating the Upstash store (owner action)

The owner creates the Upstash Redis database in their own account. Vercel offers
an Upstash integration if the owner chooses Vercel. Copy the REST URL and token
into the hosting secret manager. Do not commit them, paste them into chat, or
use the Redis URL form (`rediss://…`) — the adapter needs the HTTPS REST
endpoint. This document does not claim any store has been created.

---

## 3. Limits in force

Limits are per key and per window. Keys include a coarse client IP or an
administrator user id, never raw credentials.

| Action | Key | Limit | Window |
| --- | --- | --- | --- |
| Admin sign-in | `admin-login:ip:<ip>` | 10 | 15 min |
| Admin sign-in | `admin-login:account:<email>` | 5 | 15 min |
| First-admin setup | `admin-setup:ip:<ip>` | 8 | 15 min |
| Password change | `admin-password-change:<userId>` | 5 | 15 min |
| MFA enrolment start | `admin-mfa:enroll-start:<userId>` | 10 | 15 min |
| MFA enrolment confirm | `admin-mfa:enroll-confirm:<userId>` | 10 | 15 min |
| MFA code verification | `admin-mfa-verify:ip:<ip>` | 15 | 15 min |
| MFA code verification | `admin-mfa-verify:user:<userId>` | 10 | 15 min |
| Checkout save/place order | `checkout:<ip>` | 8 | 10 min |
| Order lookup | `order-lookup:<ip>` | 8 | 10 min |
| Payment reference submission | `payment-submit:<ip>:<orderNumber>` | 6 | 10 min |
| Return request | `return-request:<ip>:<orderNumber>` | 6 | 10 min |
| Admin mutation, sensitive | `admin-op:<permission>:<operation>:<userId>` | 30 | 5 min |
| Admin mutation, standard | `admin-op:<permission>:<operation>:<userId>` | 180 | 5 min |

**Sensitive administrator permissions** (30 per 5 minutes): `payments.verify`,
`payments.configure`, `refunds.process`, `users.manage`, `roles.manage`,
`settings.manage`, `suppliers.verify`, plus every Super Admin action. All other
administrator mutations share the 180-per-5-minute bucket per permission and
operation. This bounds automated flooding and audit-log spam without getting in
the way of normal editing.

Every protected action returns a clear "please wait and try again" message. It
never reveals whether the underlying account or order exists.

---

## 4. Provider failure and operations

- If Upstash is unreachable, sensitive actions are refused for the duration of
  the outage. Plan for this: checkout, sign-in, MFA, payments, and admin
  mutations fail closed.
- Upstash REST requests have a three-second timeout so a slow provider cannot
  hold a request open indefinitely.
- The adapter caches the resolved store per environment signature. Changing the
  environment variables requires a restart/redeploy.
- Failed limiter calls are not logged with request details by default. Add a
  hosting-layer alert if the refusal rate rises; see
  `docs/MONITORING_AND_SECURITY.md`.
- The store may evict keys under memory pressure. Eviction only shortens a
  window; it never permits an action that the application would otherwise block
  for another reason.

---

## 5. What rate limiting does not do

- It is not a WAF. It does not block malicious payloads, scanners, or
  application-layer attacks. See `docs/WAF_AND_BOT_PROTECTION.md`.
- It does not replace authentication, authorization, or the fail-closed payment
  and courier gates.
- It does not protect static assets or unauthenticated read-only pages; the
  hosting provider/CDN should absorb volumetric traffic.
- Memory mode is single-instance only and is not suitable for a multi-instance
  production deployment.
- Limits are intentionally coarse. They are a safety bound, not a precise abuse
  score.

---

## 6. Owner checklist before launch

- [ ] Create the Upstash Redis database (or an equivalent shared store the
      operator approves) and obtain the HTTPS REST URL and token.
- [ ] Set `RATE_LIMIT_PROVIDER=upstash`, `UPSTASH_REDIS_REST_URL`, and
      `UPSTASH_REDIS_REST_TOKEN` in the hosting secret manager.
- [ ] Run `npm run env:check` and confirm the rate-limit entries are valid.
- [ ] Confirm the deployment runs at least one instance and that the provider is
      reachable from the deployment region.
- [ ] Decide and document the response when the provider is unavailable (the
      code fails closed; the operator should alert on it).
- [ ] Do **not** set `RATE_LIMIT_ALLOW_MEMORY_IN_PRODUCTION=true` unless a
      single-instance deployment is an explicit, documented decision.

Until these are done, production rate limiting remains **not configured** and
the verdict stays **NOT READY (NO-GO)**.

---

## 7. Verification

| Check | Result |
| --- | --- |
| `tests/security.test.mjs` | Adapter behaviour, fail-closed resolution, provider validation |
| `tests/request-security.test.mjs` | Origin/header helpers used by protected actions |
| `npm run env:check -- --self-test` | Provider/URL/token validation cases pass |
| `npm run typecheck` / `npm run lint` | Pass |
| `npm audit --omit=dev` | Clean; no rate-limit SDK is bundled (plain `fetch`) |

No Upstash account, endpoint, credential, or production traffic was used.
