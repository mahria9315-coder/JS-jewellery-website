# JS Jewellers — WAF and Bot Protection Guidance

**Prepared:** 12 November 2026
**Audience:** The website owner and the deployment operator.
**Status:** **Guidance only.** No web application firewall, bot-management
service, CDN rule, or challenge page is configured. The application exposes no
WAF integration and no provider account exists. This document records what the
owner/operator must decide and configure; it does not claim any of it is active.

---

## 1. Why the application alone is not enough

The application has real, tested controls:

- Same-origin checks on authentication and administrator actions.
- Fail-closed rate limiting (shared Redis in production).
- Database-backed administrator sessions with MFA.
- Strict server-side authorization and server-priced checkout.
- CSP, HSTS, frame denial, and other security headers.
- Structured logging with credential redaction.

Those controls stop specific classes of abuse. They do **not** absorb a
volumetric DDoS, block a vulnerability scanner before it reaches the app, filter
known-bad IPs, or challenge automated credential stuffing at the edge. That is
the WAF/bot layer's job.

---

## 2. Recommended layers

Choose the layer that matches the approved hosting. All are owner decisions.

| Layer | What it should do | Examples (not endorsed or configured) |
| --- | --- | --- |
| DNS / CDN / DDoS | Absorb volumetric traffic, TLS termination, caching of static assets | The hosting provider's edge, Cloudflare, AWS CloudFront |
| WAF | Block known exploit signatures, enforce request-size and method rules, rate-limit at the edge | Vercel Firewall/WAF, Cloudflare WAF, AWS WAF |
| Bot management | Challenge or block automated traffic, protect `/admin/*` and login endpoints | Cloudflare Bot Management, Vercel Bot Protection, provider equivalent |
| Application rate limiting | Per-identity/per-IP business limits inside the app | This repository (`docs/RATE_LIMITING.md`) |

Use at least one edge/WAF layer for a public store. The application limits are a
second line of defence, not a substitute.

---

## 3. Baseline rules to configure

These are starting points for the operator to adapt, not a finished policy.

### Global

- Force HTTPS and redirect HTTP → HTTPS at the edge. The app also emits HSTS in
  production.
- Block requests with unsupported methods on read-only routes (`PUT`, `DELETE`,
  `TRACE`, `CONNECT` where not needed).
- Enforce a request body limit consistent with the app's 10 MB Server Action
  limit; reject oversized bodies at the edge.
- Enable managed OWASP-style rule sets, then review false positives on checkout
  and admin flows.
- Enable DDoS protection in "always on" mode.

### Administrator and authentication paths

Protect at minimum:

- `/admin/*`
- `/admin/login`
- `/admin/setup`
- `/admin/mfa/*`
- any future `/api/*`

Recommended:

- Challenge or block automated clients and known-bad reputation.
- Apply a stricter edge rate limit than the application's login limit (for
  example, per-IP requests per minute) so credential stuffing is slowed before it
  reaches the app.
- Restrict `/admin/*` to the owner's country or an allow-listed network if
  operationally acceptable. This is a strong, low-cost control; document how
  emergency access works if the owner travels.
- Do not cache any `/admin/*`, `/orders/*`, or `/checkout/*` response. The app
  already sends `private, no-store`; confirm the edge honours it.

### Storefront

- Allow legitimate search-engine crawlers for public catalogue, collection, and
  policy pages.
- Challenge aggressive scrapers of product data and prices; decide whether
  scraping is acceptable before enabling blocks.
- Do not challenge normal checkout traffic so aggressively that real customers
  fail. Monitor challenge rates.

---

## 4. Bot policy decisions the owner must make

| Question | Why it matters |
| --- | --- |
| Are search-engine crawlers allowed on the public catalogue? | Blocking them removes the store from search results. |
| Are price-comparison or AI crawlers allowed? | Affects product data exposure; the catalogue is currently empty. |
| Should `/admin/*` be geo-restricted? | Strong protection, but affects travel and remote staff. |
| How are false positives handled? | A challenge that blocks real customers loses sales. |
| Who receives WAF alerts and who can change rules? | A misconfigured rule can take the store offline. |

Record the answers in the deployment log. Do not let a provider default silently
decide them.

---

## 5. Logging, alerting, and review

- Send WAF and bot events to the same log destination as the application logs
  where possible. See `docs/MONITORING_AND_SECURITY.md`.
- Alert on: a spike in blocked requests, a spike in challenges, repeated attacks
  on `/admin/*`, and any change to WAF rules.
- Review blocked-request samples after launch to tune false positives.
- Keep the provider's audit log of rule changes; restrict who can edit rules.
- Never log request bodies, cookies, authorization headers, passwords, MFA
  codes, or payment references. The application logger already redacts these; do
  not disable that at the edge.

---

## 6. Interaction with the application controls

- Edge rate limits and application rate limits are complementary. Keep the edge
  limit looser than the application's per-account limit so the application
  remains the authority on business rules.
- Do not rely on the edge to enforce authorization, pricing, payment
  eligibility, or courier gates. Those are server-side and must stay that way.
- If the edge buffers or rewrites requests, confirm `Origin`/`Host` behaviour so
  the application's same-origin checks keep working. Test sign-in, MFA, and
  admin mutations after any proxy change.
- The application's HSTS header assumes HTTPS is terminated correctly. Confirm
  the edge forwards `X-Forwarded-Proto: https`.

---

## 7. Owner/operator checklist before launch

- [ ] Select the edge/WAF provider and plan; record it in the deployment log.
- [ ] Put the approved domain behind the provider with TLS and DDoS protection.
- [ ] Enable managed WAF rules and review false positives on checkout and admin.
- [ ] Apply stricter edge limits and bot challenges to `/admin/*` and login.
- [ ] Confirm `/admin`, `/orders`, and `/checkout` are never cached at the edge.
- [ ] Decide crawler and scraping policy; align with `app/robots.ts`.
- [ ] Configure WAF/bot alerting and name the person who responds.
- [ ] Restrict who can edit WAF rules and keep the provider audit log.
- [ ] Test sign-in, MFA, checkout, and admin mutations through the proxy.
- [ ] Document emergency access if `/admin/*` is geo-restricted.

Until these are done, WAF and bot protection remain **not configured** and the
verdict stays **NOT READY (NO-GO)**.

---

## 8. What this repository does not provide

- No WAF configuration file, provider account, API key, or deployment rule.
- No guarantee that any provider's defaults are safe for this store.
- No substitute for an independent security review or penetration test.

The application-side controls that *are* implemented are listed in
`docs/SECURITY_CHECKLIST.md` and `docs/MONITORING_AND_SECURITY.md`.
