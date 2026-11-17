# JS Jewellers — Production Readiness Assessment (T044)

**Assessment date:** 10 November 2026; refreshed 11 November 2026 (T059 final
handover completion; T060 generic courier registry); fully re-audited 11
November 2026 (T061 production-readiness audit); local end-to-end test and
bug-fix audit completed 12 November 2026 (`docs/LOCAL_TEST_REPORT.md`); local
production-readiness implementation pass completed 12 November 2026 (Neon
database support, Vercel Blob product storage, payment configuration, super-admin
verification, demo-content safeguards, legal drafts, backup/restore tooling,
CSP/HSTS, and structured logging — see §9); advanced security-hardening pass
completed 12 November 2026 (administrator MFA, shared rate limiting, header
hardening, CI/CodeQL/Dependabot configuration, and security tests — see §10).
**Scope:** readiness for production deployment and launch approval
**Decision:** **NO-GO.** Production approval cannot be granted from the
repository alone. T044 remains **BLOCKED** pending explicit owner approval and
the missing external inputs below.

No deployment, publishing, domain change, credential creation, payment
processing, or live-data load was performed for this assessment. No production
database was contacted, no production backup was taken, and no restore was
rehearsed.

---

## 1. Current technical state

| Item | State |
| --- | --- |
| Application | Next.js 16.4.5, React 19, Turbopack, Cache Components enabled |
| Database | PostgreSQL 18 with Prisma 7; 7 additive migrations applied locally; production target is Neon PostgreSQL (connection string via `DATABASE_URL`) |
| Automated tests | 245 passed / 0 failed (12 November 2026; includes the T064 MFA and security suites) |
| Typecheck / lint | Passed (12 November 2026) |
| Contrast | 43/43 passed (12 November 2026) |
| Production build | Passed (67 pages generated, including `/admin/mfa`, `/admin/mfa/verify`, and `/admin/mfa/codes`; `/checkout/review` fully Dynamic after the T062 prerender fix) |
| Prisma validation / status | Valid / schema up to date (7 migrations) |
| Environment check | `npm run env:check -- --self-test` passes; production report fails closed on missing required values; development check passes against the local `.env.local` |
| Local end-to-end testing | COMPLETE (T062, 12 November 2026): all 15 checklist items passed against the running production build; four confirmed defects fixed and re-verified; report in `docs/LOCAL_TEST_REPORT.md` |
| Dependency audit | `npm audit --omit=dev`: 0 vulnerabilities. Full `npm audit`: 7 moderate, all in the development-only lint toolchain (`eslint-config-next` → `typescript-eslint` → `minimatch` DoS advisory); no production-dependency vulnerabilities |
| Product images | Vercel Blob storage implemented with the official `@vercel/blob` SDK behind a storage abstraction; local development keeps writing to `public/images/products/uploads/`; production uploads fail closed with a clear setup message when `BLOB_READ_WRITE_TOKEN` is absent. Blob is **not provisioned** and no token exists. |
| Couriers | Owner-managed generic registry — no courier company is predefined; none added, approved, or operational. Every courier requires a verified account, written jewellery acceptance, and verified destinations with approved charges before activation (see `docs/COURIER_ONBOARDING.md`) |
| Production catalogue | Empty by design (`Product=0`) |
| Supplier records | None (`Supplier=0`, `SupplierAgreement=0`); onboarding rules in `docs/SUPPLIER_ONBOARDING.md` |
| Demo content | No demo records and no seed exist. Any record marked `DEMO` is labelled in admin and can never be published or ordered. |
| Orders / customers | None (`Order=0`, `Customer=0`) |
| Admin accounts | None (`AdminUser=0`); 6 role definitions seeded; first Super Admin creation is an owner action via `/admin/setup` |
| Administrator MFA | Implemented and enforced in production (TOTP + 10 recovery codes; AES-256-GCM secret at rest; replay protection; Super Admin reset). No encryption key or enrolled authenticator exists yet. |
| Shared rate limiting | Async adapter implemented (`memory` dev/test, Upstash REST production, fail-closed). No Upstash store or credentials exist. |
| CI / dependency scanning | CI, CodeQL, and Dependabot workflows prepared locally but **not pushed or activated**. Manual `npm audit --omit=dev` clean. |
| WAF / bot protection | Not configured; guidance written in `docs/WAF_AND_BOT_PROTECTION.md`. |
| Payment methods | Implemented but unavailable; account values absent |
| Legal pages | `/privacy`, `/terms`, `/returns`, and `/shipping` are drafts marked **PENDING OWNER APPROVAL** and `noindex` |
| Hosting / domain | Not selected or approved; Vercel remains a future option, not a live deployment |
| Backups / monitoring | Local guarded backup/restore scripts exist and self-test; production schedule, PITR, restore rehearsal, and hosting-layer monitoring are not configured |
| Legal review | Outstanding |

---

## 2. Environment variables required in production

Names only. Values must be supplied by the owner through the hosting secret
manager, never committed to the repository or pasted into chat/reports.

| Variable | Required | Purpose / notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Server-only PostgreSQL connection string using the dedicated application role. On Neon, use the pooled TLS connection string (`sslmode=require`). |
| `DATABASE_POOL_MAX` | Optional | Limits the Prisma/pg connection pool. Serverless hosts usually need a small value or the Neon pooled endpoint. |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public HTTPS origin used for metadata, sitemap, robots, and canonical URLs. |
| `CHECKOUT_DRAFT_SECRET` | Yes | Long random secret (32+ characters) for signing the checkout draft cookie. |
| `ADMIN_MFA_ENCRYPTION_KEY` | Yes | 32-byte key (base64, base64url, or 64 hex characters) encrypting administrator TOTP secrets at rest. Losing it makes existing authenticators unreadable. |
| `ADMIN_MFA_CHALLENGE_SECRET` | Optional | Signs the five-minute MFA challenge cookie. When unset, `CHECKOUT_DRAFT_SECRET` is used. |
| `RATE_LIMIT_PROVIDER` | Yes | Must be `upstash` in production (or `memory` only with a deliberate single-instance opt-in). Production fails closed when unset. |
| `UPSTASH_REDIS_REST_URL` | Yes when `upstash` | HTTPS Upstash Redis REST endpoint; must be an `*.upstash.io` host. |
| `UPSTASH_REDIS_REST_TOKEN` | Yes when `upstash` | Server-only Upstash REST token. |
| `BLOB_READ_WRITE_TOKEN` | Yes | Vercel Blob token for durable product-image uploads. Create the Blob store in the Vercel project and let Vercel inject the token. |
| `ADMIN_SETUP_SECRET` | One-time | Required for the first `/admin/setup`; remove or rotate after the owner creates the first Super Admin. |
| `PAYMENT_BANK_ACCOUNT_NUMBER` | Yes for Bank Transfer | Server-only; method stays unavailable until set with the holder. |
| `PAYMENT_BANK_ACCOUNT_HOLDER` | Yes for Bank Transfer | Server-only. |
| `PAYMENT_EASYPAISA_NUMBER` | Yes for Easypaisa | Server-only; method stays unavailable until set with the holder. |
| `PAYMENT_EASYPAISA_ACCOUNT_HOLDER` | Yes for Easypaisa | Server-only. |
| `PAYMENT_BANK_DISPLAY_NAME` | Optional | Label for the Bank Transfer method; when unset the approved name “Islamic Bank” is used. |
| `LOG_LEVEL` | Optional | `debug`, `info` (default), `warn`, or `error` for the structured logger. |

`ADMIN_SESSION_SECRET` is **not required and is not used for administrator
sessions.** Admin sessions are database-backed opaque tokens whose SHA-256 hashes
are stored in PostgreSQL. The variable exists only as a legacy fallback for the
checkout-draft signing secret; set `CHECKOUT_DRAFT_SECRET` instead.

Never use a `NEXT_PUBLIC_` prefix for database, payment, admin, setup, Blob, or
signing values. `ADMIN_MFA_REQUIRED` is a development-only switch; production
always enforces MFA. `RATE_LIMIT_ALLOW_MEMORY_IN_PRODUCTION` must stay unset
unless a documented single-instance deployment is explicitly approved.

Validate the names and structure without connecting to anything:

```bash
npm run env:check             # production report (fails closed)
npm run env:check:dev         # local development report
node scripts/check-production-env.mjs --self-test
```

The report prints only variable names, presence booleans, and safe messages; it
never prints a value.

---

## 3. Database and migration readiness

- Production target: **Neon PostgreSQL**. The application supports a pooled TLS
  connection string and an optional `DATABASE_POOL_MAX`; the Prisma client is
  cached per process (`lib/db.ts`), which avoids the production connection leak
  fixed during T062.
- Apply migrations with `npm run prisma:deploy` (`prisma migrate deploy`).
  **Do not use `prisma migrate dev` in production.** Do not use `prisma db push`
  in any environment. The `js_jewellers_app` role does not have `CREATEDB`.
- Current migrations:
  1. `20261106000000_infrastructure_baseline`
  2. `20261108000000_supplier_catalogue_orders`
  3. `20261108010000_admin_panel`
  4. `20261109000000_product_customization`
  5. `20261110000000_courier_integrations`
  6. `20261111000000_courier_contact_details`
  7. `20261112000000_admin_mfa`
- All seven are applied locally and `prisma migrate status` reports the schema up
  to date. The admin MFA migration is additive (two new tables plus a relation);
  existing data is untouched. Couriers are data rows created only through admin
  actions, and `Order.courierCode` is a plain string column.
- Production needs a separate database/role, a verified connection, and a tested
  restore before launch.
- **Not verified:** backup schedule, point-in-time recovery, restore rehearsal,
  migration rollback plan, connection-pool sizing under real load, TLS to the
  database (provider-managed on Neon), and least-privilege review of the
  production role.
- Do not run any destructive command against production. Do not seed suppliers,
  products, orders, customers, or couriers.

Backup and restore tooling is documented in `docs/BACKUP_RESTORE.md`. Neon PITR
must be verified against the chosen plan before it is claimed; until then, use
the `pg_dump`/`pg_restore` runbook as the primary recovery path.

---

## 4. Hosting, domain, and operations

### Required before deployment

1. Owner-approved hosting provider and region. Vercel is a candidate, not a
   decision.
2. Production Neon PostgreSQL instance and `DATABASE_URL`.
3. Vercel Blob store and `BLOB_READ_WRITE_TOKEN` for product images.
4. Approved domain and DNS control.
5. TLS certificate and HTTPS-only redirect.
6. Secret storage for every variable in §2.
7. A deployment process that runs `npm ci` (which regenerates the Git-ignored
   Prisma Client via `postinstall`), `npm run prisma:deploy` against the
   production database, and `npm run build`/`npm start` (or the provider’s
   equivalent), with the build failing on type or lint errors. Migrations must
   run from an environment with production database access, not inside a Vercel
   build step.
8. A rollback plan: previous build artifact, database restore point, and a
   documented decision-maker.
9. Monitoring/alerting for availability, 5xx errors, database health, and failed
   logins.
10. A shared rate-limit store (Upstash or equivalent) with
    `RATE_LIMIT_PROVIDER=upstash` and both Upstash values. Production fails
    closed without it, even on a single instance.
11. A verified backup schedule, restore rehearsal, and (if claimed) Neon PITR
    window.
12. An `ADMIN_MFA_ENCRYPTION_KEY`, the first Super Admin enrolled in MFA, and
    recovery codes stored offline.
13. An edge/WAF and bot-protection layer with alert ownership, especially for
    `/admin/*` and the login endpoint.
14. Reviewed CI/CodeQL/Dependabot workflows and branch protection on `main`.

### Domain-dependent items still disabled or incomplete

- `NEXT_PUBLIC_SITE_URL` must change from the localhost placeholder; otherwise
  canonical URLs, sitemap entries, robots rules, and structured data remain
  localhost-based.
- Search-engine verification and live analytics remain blocked on the approved
  domain and consent wording.

### Deployment checklist (refreshed 12 November 2026)

A consolidated, ordered checklist for whoever performs the eventual deployment.
Every item requires an owner decision or owner-supplied value first; nothing
below may be executed until the owner explicitly approves deployment.

1. **Build requirements.** Node.js 20.9+ (verified with 24.21.0); `npm ci`; then
   `npm run build`. The build runs TypeScript and must fail on type errors.
   Verified locally (12 November 2026): 67 pages generated.
2. **Pre-deploy gates.** `npm test` (245 passed), `npm run typecheck`,
   `npm run lint`, `npm run check:contrast` (43/43), `npm run prisma:validate`,
   `npm run prisma:status` (7 migrations), and `npm run env:check` all green on
   the release candidate.
3. **Environment variables.** Every required variable in §2 set in the hosting
   provider's secret manager — never committed, never `NEXT_PUBLIC_`-prefixed,
   never pasted into chat. This includes `ADMIN_MFA_ENCRYPTION_KEY`,
   `RATE_LIMIT_PROVIDER`, and the Upstash values. Remove `ADMIN_SETUP_SECRET`
   after first-time setup.
4. **PostgreSQL (Neon).** A dedicated production database and least-privilege
   application role (not superuser, no `CREATEDB`); pooled TLS connection
   string; verified connection from the deployment environment; a sensible
   `DATABASE_POOL_MAX` for the chosen runtime.
5. **Migrations.** Run `npm run prisma:deploy` against the production database as
   part of the deployment. Never `prisma migrate dev` or `db push` in
   production. Record the applied migration list in the deployment log.
6. **Image storage (Vercel Blob).** Provision the Blob store and confirm
   `BLOB_READ_WRITE_TOKEN` is injected. Local filesystem storage remains a
   development fallback only; production uploads fail closed without Blob.
7. **Domain and DNS.** Owner-approved domain; DNS records pointing at the
   hosting provider; `NEXT_PUBLIC_SITE_URL` set to the final HTTPS origin.
8. **HTTPS.** TLS certificate (provider-managed or approved); HTTP→HTTPS
   redirect enforced. HSTS is emitted by the application in production once the
   origin is final.
9. **Security headers and shared rate limiting.** The app sets CSP,
   `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`,
   `Permissions-Policy`, COOP, CORP, `X-Permitted-Cross-Domain-Policies`,
   `X-DNS-Prefetch-Control`, production HSTS, and `private, no-store` for
   `/orders/*`, `/admin/*`, and `/checkout/*`. Provision the shared
   rate-limit store and set `RATE_LIMIT_PROVIDER=upstash` plus both Upstash
   values. Verify `npm run env:check` and confirm that a deliberately
   unreachable store causes rate-limited actions to refuse (fail closed).
10. **Administrator MFA.** Generate and store `ADMIN_MFA_ENCRYPTION_KEY`,
    create the first Super Admin, enrol an authenticator at `/admin/mfa`, and
    store the recovery codes offline. Confirm a password-only sign-in reaches
    `/admin/mfa/verify` and does not create a session. See
    `docs/ADMIN_MFA.md`.
11. **WAF and bot protection.** Put the final domain behind the approved
    edge/WAF, enable DDoS protection and managed rules, apply stricter rules and
    challenges to `/admin/*` and login, confirm private routes are never cached,
    and assign alert ownership. See `docs/WAF_AND_BOT_PROTECTION.md`.
12. **CI and dependency scanning.** Review and commit the local CI, CodeQL, and
    Dependabot files deliberately; enable the workflows, code scanning, and
    Dependabot alerts; and protect `main` with a required CI check. See
    `docs/CI_AND_DEPENDENCY_SCANNING.md`.
13. **Backups and restore.** Configure provider backups with a documented
    schedule and retention, run a **rehearsed restore** before launch, verify
    the Neon PITR window only if the plan provides it, and document the recovery
    decision-maker and rollback plan.
14. **Logging and monitoring.** The app emits structured JSON lines and logs
    unhandled server errors without headers. Configure hosting-layer uptime,
    5xx, database, failed-login, rate-limiter-outage, WAF, and backup-failure
    alerting, and a log drain or aggregator. See
    `docs/MONITORING_AND_SECURITY.md`.
15. **Owner handover actions.** First Super Admin created by the owner through
    `/admin/setup` and enrolled in MFA; payment account values supplied;
    supplier evidence and products loaded; courier confirmations recorded or
    couriers left unapproved; legal review completed before policy `noindex`
    labels are removed.
16. **Explicit approval.** Written owner approval of this checklist and the
    release candidate before anything is deployed.

---

## 5. Security readiness

Implemented:

- Database-backed administrator sessions with opaque random tokens; only token
  hashes are stored.
- Salted scrypt password hashes; constant-time comparisons; session expiry and
  revocation.
- Server-side permission checks on admin pages and mutations; Super Admin
  boundary for account/role management.
- Dedicated `suppliers.verify` permission required to mark a supplier
  `VERIFIED`, even when a form is crafted to post that value.
- Server-priced cart and checkout; no browser-supplied price or total is trusted.
- Order access requires an unguessable token plus the order number; lookup is
  rate limited.
- Public queries and customer order projections exclude supplier identity, cost,
  margin, contacts, and notes.
- **Administrator MFA** (T064): TOTP authenticator plus ten single-use recovery
  codes, always enforced in production; a password alone never creates a session
  while an authenticator is enrolled; TOTP secrets AES-256-GCM-encrypted at rest
  under `ADMIN_MFA_ENCRYPTION_KEY`; recovery codes stored only as scrypt hashes;
  replay prevented by a stored time-step counter; Super Admin reset with audit
  logging.
- **Shared rate limiting** (T064): async adapter with `memory` (development/test)
  and Upstash Redis REST (production), fail-closed when missing, misconfigured,
  or unreachable; per-actor administrator limits (30/5 min sensitive, 180/5 min
  standard) and limits on sign-in, setup, MFA, checkout, order lookup, payment
  submission, and returns.
- **Explicit same-origin checks** on sign-in, setup, logout, MFA, and profile
  actions, in addition to the framework's Server Action check.
- Application security headers: nosniff, frame denial, referrer policy,
  permissions policy, COOP, CORP, `X-Permitted-Cross-Domain-Policies`,
  `X-DNS-Prefetch-Control`, a conservative CSP (no `unsafe-eval` in production),
  and production HSTS, plus `private, no-store` for admin/order/checkout routes.
- Structured JSON logging with credential, token, contact-detail, and
  query-string redaction; unhandled server errors logged without headers.
- No secrets in source, documentation, or client bundles; `.env.local` is
  git-ignored.
- One-time first-admin setup with a server-only setup secret and no automatic
  account creation.
- Product-image storage fails closed in production without Blob; deletion only
  touches the exact stored object.
- Demo content can never be published or ordered.
- Guarded backup/restore scripts that never auto-run, never print connection
  strings, and refuse to restore over the application database without an
  explicit override.

Not implemented or not verified:

- Centralised log collection, alerting, intrusion monitoring, or a WAF. WAF and
  bot-protection guidance is written (`docs/WAF_AND_BOT_PROTECTION.md`), but no
  provider, rule, challenge, or account is configured.
- CI, CodeQL, and Dependabot are prepared locally but **not pushed or enabled**;
  branch protection and secret scanning are not active. Manual
  `npm audit --omit=dev` (12 November 2026) is clean; 7 moderate advisories
  remain in the development-only lint toolchain.
- Production MFA configuration and enrolment: the code is implemented and
  enforced, but no `ADMIN_MFA_ENCRYPTION_KEY` exists, no authenticator is
  enrolled, and no recovery codes are stored offline.
- A provisioned shared rate-limit store: production refuses to start limiting
  actions without `RATE_LIMIT_PROVIDER=upstash` plus the Upstash values. The
  adapter exists; the store and credentials do not.
- A rehearsed production backup/restore and rollback.
- A penetration test or independent security review.
- Hard 307/404 statuses for streaming admin/order shells (no data leaked, but
  status semantics are soft).
- The admin payment settings’ `enabled` and display-label fields are
  informational only: storefront checkout availability is governed solely by
  the server environment configuration, so unchecking the CMS box does not
  disable a method and the CMS label is not shown to customers. Payment
  submission and return requests now have dedicated per-order rate limits
  (T064).

---

## 6. Business and data readiness

| Requirement | State |
| --- | --- |
| Approved supplier identities and agreements | Missing |
| Supplier SKUs, costs, stock, and image rights | Missing |
| Supplier availability-verification method | Not approved |
| Supplier order-transmission method | Not approved |
| Supplier fulfilment evidence workflow | Not approved |
| Supplier settlement and delivery-cost responsibility | Not approved |
| Actual-profit formula | Not approved |
| Payment account values | Missing |
| Production administrator | Not created (owner action) |
| Production MFA key and first enrollee | Not created (owner action) |
| Shared rate-limit store (Upstash) | Not created (owner action) |
| WAF / bot protection | Not configured (owner action) |
| CI / CodeQL / Dependabot | Prepared locally; not enabled (owner action) |
| Reviews decision | Not approved |
| Legal approval of privacy/terms/returns/shipping wording | Outstanding |
| Approved domain and hosting | Missing |
| Production Blob store | Missing |
| Backup/PITR and restore rehearsal | Not configured |
| Monitoring and alerting | Not configured |
| Explicit production approval | Not given |

The production catalogue is intentionally empty. No demo or invented
supplier/product/order/customer record may be used to satisfy a release gate.

---

## 7. Owner actions required

1. Create or approve the GitHub, Vercel, and Neon accounts/access used for
   deployment. Do not share passwords; use the provider’s own access controls.
2. Create the Neon PostgreSQL project/database and supply `DATABASE_URL`
   securely through the hosting secret manager.
3. Create the Vercel Blob store and supply `BLOB_READ_WRITE_TOKEN` the same way.
4. Supply `NEXT_PUBLIC_SITE_URL`, `CHECKOUT_DRAFT_SECRET`,
   `ADMIN_MFA_ENCRYPTION_KEY`, and the payment values (Bank Transfer and
   Easypaisa) securely. Optionally supply `ADMIN_MFA_CHALLENGE_SECRET`. Do not use
   `ADMIN_SESSION_SECRET`.
5. Create an Upstash Redis store (or an operator-approved equivalent) and set
   `RATE_LIMIT_PROVIDER=upstash`, `UPSTASH_REDIS_REST_URL`, and
   `UPSTASH_REDIS_REST_TOKEN`. Production fails closed without them
   (`docs/RATE_LIMITING.md`).
6. Approve and run the production migrations with `npm run prisma:deploy` from
   an environment with production database access. Never use `migrate dev` or
   `db push`.
7. Create the first Super Admin through `/admin/setup`, enrol an authenticator at
   `/admin/mfa`, store the recovery codes offline, then remove or rotate
   `ADMIN_SETUP_SECRET` (see `docs/OWNER_SETUP_GUIDE.md` §3-§4A and
   `docs/ADMIN_MFA.md`).
8. Supply approved supplier, agreement, product, image-rights, SKU, cost, stock,
   and availability data; record the evidence in the Admin Panel
   (`docs/SUPPLIER_ONBOARDING.md`).
9. Add the courier companies you use, then verify accounts, obtain written
   jewellery acceptance, and approve destinations and charges before activation
   (`docs/COURIER_ONBOARDING.md`).
10. Obtain legal review and final approval of all published policies; remove the
    pending notices and `noindex` only after approval.
11. Configure backups, restore rehearsal, and monitoring; verify Neon PITR only
    if the plan provides it (`docs/BACKUP_RESTORE.md`,
    `docs/MONITORING_AND_SECURITY.md`).
12. Choose hosting and the domain; put the approved domain behind an edge/WAF,
    apply stricter rules to `/admin/*` and login, and assign alert ownership
    (`docs/WAF_AND_BOT_PROTECTION.md`).
13. Review and deliberately commit the local CI, CodeQL, and Dependabot files;
    enable the workflows and code scanning; enable Dependabot alerts and secret
    scanning; protect `main` with a required CI check
    (`docs/CI_AND_DEPENDENCY_SCANNING.md`).
14. Complete final production testing on the real deployment with real
    (approved) data and non-destructive checks, and re-run the full gate suite on
    the release candidate.
15. Give **explicit written approval** before any production deployment.

---

## 8. Go/no-go

### GO criteria (all must be true)

- [ ] Approved supplier/product/image/cost/stock data loaded and publication
      evidence recorded.
- [ ] Supplier availability, transmission, fulfilment, settlement, and profit
      decisions approved.
- [ ] At least one payment method fully configured and manually verified end to
      end with a non-production test.
- [ ] Production admin account created by the owner; setup secret removed; an
      authenticator enrolled with recovery codes stored offline.
- [ ] `ADMIN_MFA_ENCRYPTION_KEY` generated and stored securely; MFA verified end
      to end on the deployed app (password alone does not create a session).
- [ ] Shared rate-limit store provisioned and configured
      (`RATE_LIMIT_PROVIDER=upstash` plus both Upstash values); `npm run
      env:check` passes; fail-closed behaviour confirmed.
- [ ] Hosting, domain, TLS, Neon production database, Blob store, and secrets
      configured.
- [ ] CSP/HSTS, CORP/COOP, monitoring, backups, restore, and rollback verified.
- [ ] Edge/WAF and bot protection configured, with alert ownership assigned.
- [ ] CI, CodeQL, and Dependabot reviewed, committed deliberately, and enabled;
      `main` protected; secret scanning enabled.
- [ ] Legal approval obtained; pending labels removed only where approved.
- [ ] Full test/typecheck/lint/contrast/build/migration/env suite re-run on the
      release candidate.
- [ ] Owner gives explicit production approval.

### Current result

**NO-GO.** None of the business-data, payment, hosting, backup, monitoring,
WAF, CI, legal, or approval gates is satisfied. Administrator MFA and the
shared-rate-limit adapter are implemented and tested locally, but no production
MFA key, enrolled authenticator, or shared store exists, and WAF/CI remain
unconfigured. The code is ready for continued review, but production deployment
must not proceed.

**T044 status:** BLOCKED. No production deployment is authorized or performed.

---

## 9. Local production-readiness work completed (12 November 2026)

This pass implemented every item that can be completed safely and locally
without external accounts, credentials, legal approval, or production data. It
did not deploy, commit, push, create accounts, or contact any external service.

| Area | Implemented locally | Still owner/external |
| --- | --- | --- |
| Neon PostgreSQL | Pooled TLS URL validation, `DATABASE_POOL_MAX`, per-process client caching, connection guidance | Provision the Neon database and supply `DATABASE_URL` |
| Vercel Blob | Official `@vercel/blob` SDK, storage abstraction, exact-object deletion, Blob URL validation, image remote patterns, fail-closed production | Create the Blob store and supply `BLOB_READ_WRITE_TOKEN` |
| Payments | Optional `PAYMENT_BANK_DISPLAY_NAME`, structural validation without logging, fail-closed method availability | Supply real account values securely |
| Super Admin | Confirmed DB-backed sessions; corrected docs that wrongly required `ADMIN_SESSION_SECRET`; documented setup-secret rotation/removal | Create the first Super Admin and remove the setup secret |
| Demo products | Explicit `DEMO` detection, admin labels, publication/orderability blocks, tests | None; production catalogue stays empty |
| Suppliers | Documented evidence gates; dedicated `suppliers.verify` permission enforced on the server | Supply approved supplier/product data |
| Couriers | Documented fail-closed gates; existing activation fix preserved | Add, verify, and approve real couriers |
| Legal pages | Draft `/terms` added; all four policy pages marked pending approval and `noindex` | Legal review and owner approval |
| Backup/restore | Guarded local scripts, self-tests, same-database guard, `backups/` ignored, runbook | Configure schedule, retention, restore rehearsal, Neon PITR check |
| Monitoring/security | Structured JSON logging with redaction, `onRequestError`, CSP, production HSTS, header tests | Hosting-layer monitoring, alerting, log drain, WAF (administrator MFA and shared rate limiting were added in §10) |
| Testing | Full gate suite run; 227 tests passed at that pass | Final production testing on the deployed app |

**Verification at that pass (12 November 2026, before T064):** `npm test` 227/227;
`npm run typecheck` pass; `npm run lint` pass; `npm run check:contrast` 43/43;
`npm run prisma:validate` valid; `npm run prisma:status` 6 migrations applied and
up to date; `npm run build` pass (64 pages); `node
scripts/check-production-env.mjs --self-test` pass; development env check pass;
`npm run db:backup:check` pass (local); backup and restore self-tests pass;
`npm audit --omit=dev` clean. No production database, payment credential, or
deployment was used. Current numbers are in §10.

---

## 10. Advanced security hardening completed (T064, 12 November 2026)

This pass added the remaining application-side security controls that do not
require an external account, credential, or approval. It did not deploy, commit,
push, create accounts, provision services, or contact any external service.

| Area | Implemented and verified locally | Still owner/external |
| --- | --- | --- |
| Administrator MFA | TOTP enrolment/verification, ten single-use recovery codes, AES-256-GCM secret encryption, replay counter, Super Admin reset with audit logging, `/admin/mfa` UI, always enforced in production | Generate `ADMIN_MFA_ENCRYPTION_KEY`; enrol the first Super Admin; store recovery codes offline; enrol every staff account |
| MFA challenge signing | Five-minute signed HTTP-only challenge cookie; a database session is created only after verification | Optionally set `ADMIN_MFA_CHALLENGE_SECRET` |
| Shared rate limiting | Async adapter (`memory` dev/test, Upstash REST via `fetch`, fail-closed), production refuses unset provider and memory; per-actor admin limits; checkout/payment/return limits | Provision Upstash (or approved equivalent); set the three rate-limit variables; confirm reachability and alerting |
| Origin hardening | Explicit same-origin checks on sign-in, setup, logout, MFA, and profile actions | Test each flow through the eventual proxy/WAF |
| Header hardening | Added CORP, `X-Permitted-Cross-Domain-Policies: none`, `X-DNS-Prefetch-Control: off`, and `private, no-store` for `/checkout/*`; error boundary no longer logs the raw error object | Enforce HTTPS at the edge; consider a nonce-based CSP |
| CI and scanning | `.github/workflows/ci.yml`, `.github/workflows/codeql.yml`, and `.github/dependabot.yml` prepared locally; `otpauth` is the only new runtime dependency (MIT) | Review, commit, enable workflows and code scanning, enable Dependabot and secret scanning, protect `main` |
| WAF / bot guidance | Documented baseline rules, bot-policy decisions, and alert ownership in `docs/WAF_AND_BOT_PROTECTION.md` | Select and configure the edge/WAF provider; assign responders |
| Security tests | New `tests/mfa.test.mjs` plus extended security, logging, privacy-header, and request-security tests | Independent review/penetration test |

New documentation: `docs/ADMIN_MFA.md`, `docs/RATE_LIMITING.md`,
`docs/WAF_AND_BOT_PROTECTION.md`, `docs/CI_AND_DEPENDENCY_SCANNING.md`, and
`docs/SECURITY_CHECKLIST.md`. The read-only audit is
`docs/SECURITY_AUDIT_T064.md`.

**Verification (12 November 2026, final local gate):**

| Check | Result |
| --- | --- |
| `npm test` | **245/245 passed** (includes 13 MFA tests) |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run check:contrast` | 43/43 pass |
| `npm run prisma:validate` | Valid |
| `npm run prisma:status` | 7 migrations applied; schema up to date |
| `npm run build` | Pass (67 pages, including `/admin/mfa`, `/admin/mfa/verify`, `/admin/mfa/codes`) |
| `node scripts/check-production-env.mjs --self-test` | All cases pass (missing/short MFA key, memory rate limiting in production, missing/non-Upstash URL, secret never printed) |
| `npm audit --omit=dev` | 0 vulnerabilities |
| `npm run db:backup:check` | Pass (local prerequisites) |
| `npm run db:restore:check` | Fails as expected: no backup file and no `RESTORE_DATABASE_URL` (owner action) |

No production MFA key, authenticator secret, recovery code, Upstash credential,
WAF rule, CI run, or deployment was created or contacted.

**T064 verdict:** local scope DONE; production remains **NOT READY (NO-GO)**.
T044 stays **BLOCKED**.
