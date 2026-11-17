# JS Jewellers — Local Testing & Bug-Fix Audit Report (T062)

**Audit date:** 11–12 November 2026
**Tester:** Implementation agent (local machine only; not the business owner)
**Scope:** End-to-end local testing of the running production build (`next build` + `next start`), against the agreed 15-item checklist, fixing only confirmed defects, using isolated local test data, and restoring the documented empty state afterwards.
**Method:** Real HTTP flows against `localhost:3210` (no-JS form posts, cookie jars, multipart uploads), headless Chrome via CDP with axe-core for accessibility, direct read-only PostgreSQL inspection for state checks, and the full automated quality gate suite after every fix.

---

## 1. Verdict

**Local testing: COMPLETE — 15/15 checklist items PASS. 4 confirmed bugs found; all 4 fixed and re-verified. All quality gates green on the final build.**

**Production deployment: NOT READY (NO-GO)** — unchanged from the T061 assessment. Everything controllable and testable from this repository passes; deployment remains blocked on external owner actions (production database, durable image storage, real payment account values, the first Super Admin, approved supplier/product data, courier approvals, legal review, hosting/domain, backups/monitoring, and explicit written approval). See §8.

No deployment, commit, push, domain, production database, payment, courier, supplier, or customer action occurred. All local test data was removed; the database and `public/` are back to their documented baseline state.

---

## 2. Checklist results (15/15 PASS)

| # | Checklist item | Verdict | Evidence summary |
| --- | --- | --- | --- |
| 1 | Setup secret detection (`ADMIN_SETUP_SECRET`) | PASS | Setup form hides its secret field when the env var is unset; wrong secret rejected with no account created and no session issued. |
| 2 | First Super Admin setup + duplicate protection | PASS | One-time `/admin/setup` flow created the Super Admin; a second run is refused (setup no longer offered once an admin exists); duplicate emails rejected; anonymous `/admin/setup` redirects once admins exist. |
| 3 | Admin login / logout / session | PASS | Correct credentials issue `js_admin_session` (httpOnly, DB-backed); wrong password refused; logout revokes; sessions expire/rotate as designed. |
| 4 | Dashboard + admin navigation | PASS | `/admin` renders the overview; nav links match the permission catalogue; `AdminAuditLog` records the actions. |
| 5 | Supplier/product create/edit with safe test data | PASS | Created "ZZ Local Test Supplier" + product "zz-local-test-ring" through the admin UI; publication gates enforced; edit + note/agreement flows audited. |
| 6 | Image upload | PASS | Multipart PNG upload accepted and stored under `public/images/products/uploads/`; non-image content rejected; delete removes the stored file. |
| 7 | Order listing / details / status updates | PASS | Orders list + detail render; invalid transition (pending → delivered) rejected; valid chain confirmed → supplier stages → shipped; courier booking + tracking recorded. |
| 8 | Bank Transfer / Easypaisa config without exposing values | PASS | With env set, checkout offers both methods and the customer order page shows Islamic Bank instructions; on `/admin/settings/payments` only key *names* and "not configured" states are shown — no account values in any response body. |
| 9 | COD stays disabled | PASS | Cash on Delivery never appears as a payment option anywhere (checkout, review, admin, storefront) and is impossible by enum/validation. |
| 10 | Generic courier creation / fail-closed activation | PASS | "ZZ_LOCAL_TEST_COURIER" created via admin UI; activation server-blocked until every gate is satisfied (verified account, written jewellery acceptance, approved destination charges/estimates); activation then succeeds; invalid tracking templates rejected. |
| 11 | Customer, homepage, navigation, SEO, customization, settings, admin-role workflows | PASS | Homepage/collections/search/cart/checkout/order pages render; homepage sections, navigation items, SEO pages, business/shipping/notifications settings all editable with safe fallbacks; customization confirmation flow fail-closed → confirm → enable → storefront → disable; media library upload/delete; roles page + 6 seeded roles; Super Admin creates a MANAGER admin; MANAGER logs in, gets permitted pages, is denied `/admin/users` + `/admin/roles` server-side (no content served); wrong password refused. |
| 12 | Unauthorized access blocked | PASS | Anonymous `/admin/*` redirects to login (200 + RSC redirect payload under streaming, **no content served**); non-super-admin denied super-admin-only pages server-side; customer order pages require order number + unguessable token (no-token access renders not-found). |
| 13 | Missing env vars → safe errors | PASS | Without `PAYMENT_*` env: checkout shows the unavailable-payment warning with no form, no order/customer rows created; payments settings page renders with key names only; `DATABASE_URL` absence documented safe error. |
| 14 | DB connection / migration status | PASS | PostgreSQL 18.6 on localhost:5432; Prisma schema valid; 6 migrations applied, up to date; connection pool stable after Bug #1 fix. |
| 15 | Responsive + accessibility | PASS | 26 headless renders at 375px and 1280px with zero horizontal overflow; viewport/lang/landmark/alt/label checks pass; axe-core clean on all tested routes after Bug #3 fix (one documented transitional-state observation, §4). |

---

## 3. Confirmed bugs found and fixed (4)

All fixes are behavior-preserving, minimal, and re-verified with the relevant flows plus the full quality gates. **Files are uncommitted (the project has no Git repository initialized locally).**

### Bug #1 — Production PrismaClient connection leak
- **File:** `lib/db.ts`
- **Root cause:** The client was cached on `globalThis` only when `NODE_ENV !== "production"` (the common dev-only hot-reload pattern). In production every fresh module instance created a new `PrismaClient` with its own PostgreSQL pool, so pools accumulated under traffic until PostgreSQL rejects connections (Prisma P2037 `TooManyConnections`).
- **Fix:** Always cache the client on `globalThis` (the comment now explains both reasons: dev hot reloads and production pool reuse).
- **Evidence:** After the fix, the connection count stayed flat (5–10 connections) across 15 rapid page requests; before, each new module instance opened a fresh pool. `npm test` (204), typecheck, lint, and build all pass.

### Bug #2 — Courier activation chicken-and-egg deadlock
- **File:** `lib/admin/settings.ts` (`updateCourierStatus`)
- **Root cause:** While transitioning a courier **to** `ACTIVE`, the destination-eligibility config was built with the courier's *stored* (still non-ACTIVE) status, but eligibility requires `ACTIVE` — so a courier that had genuinely satisfied every gate could never be activated.
- **Fix:** Build the eligibility config with the **target** status; the account-verification and jewellery-acceptance gates are still enforced explicitly beforehand, and every destination gate remains fail-closed (documented in a comment in the function).
- **Evidence:** Before the fix, activation of the fully-approved test courier failed; after the fix it succeeded. Fail-closed behavior re-verified: activation with any missing gate is still server-blocked. Courier flow tests + full gates pass.

### Bug #3 — Admin dashboard accessibility violation (definition list)
- **File:** `app/admin/(dashboard)/page.tsx`
- **Root cause:** A `<Link>` was rendered as a sibling of `<dt>`/`<dd>` inside a `<dl>`, producing an invalid definition-list structure flagged by axe-core as **serious**.
- **Fix:** Wrapped the link in `<dd>`.
- **Evidence:** axe-core over CDP on `/admin` reported 1 serious violation before and 0 after; final full a11y sweep clean.

### Bug #4 — `Date.now()` prerender error on `/checkout/review`
- **File:** `app/(site)/checkout/review/page.tsx`
- **Root cause:** With `cacheComponents` + `partialPrefetching` enabled in `next.config.ts`, the route ships an empty PPR shell (htmlSize 0). On the first request-time render with a checkout draft cookie present, Next.js re-runs an instrumented prerender pass; the draft-token expiry check in `verifyPayload` (`lib/security/signed-payload.ts`) calls `Date.now()` during that pass, so the server logged `Route "/checkout/review": Next.js encountered the unstable value Date.now() while prerendering` on **every fresh server's first authenticated review render** (reproduced deterministically on two consecutive builds). The page still rendered — Next recovered by falling back to dynamic rendering — but the error was real and repeatable.
- **Fix:** `await connection()` at the top of the page (Next.js's prescribed remedy), rendering the page fully at request time — correct here because the page is per-visitor draft-cookie content whose "static" shell was empty anyway.
- **Evidence:** Build output changed from `◐ (Partial Prerender)` to `ƒ /checkout/review (Dynamic)`; the identical reproduction (fresh server + draft cookie + review render) now logs nothing; the full customer order flow passes end-to-end with a clean server log (only the known benign origin-header warnings from no-JS action POSTs).

---

## 4. Observations — documented non-bugs (no code change)

1. **Homepage axe color-contrast flag is a scroll-reveal transitional state, not a defect.** The `.reveal-on-scroll` sections use a scroll-driven animation (`animation-timeline: view()`, range `entry 10% cover 30%`, opacity 0→1). At 1280×800 the "Collections" eyebrow rests at partial opacity at page load (`#2a210f` on `#000000`, 1.32:1). At full reveal it is `rgb(194,154,69)` on black ≈ 8:1 — verified **0 violations** after scrolling the element into view — and reduced-motion users get instant full opacity. The app's own `check:contrast` passes 43/43. Changing it would alter the owner-approved animation design, so it is recorded only.
2. **`/shipping` policy page deliberately never publishes courier names** — by design; no courier identity leaks to the storefront.
3. **Checkout without payment env replaces the entire form with the warning notice** — fail-closed by design; no order or customer rows are created.
4. **Admin payment verification before customer submission is rejected** ("Cannot move a pending payment to…") — correct state machine (PENDING → SUBMITTED → VERIFIED); the full cycle passes when performed in order.
5. **Admin routes respond HTTP 200 with the redirect embedded in the RSC payload** (streaming) rather than a 3xx. Verified that **no page content is served** (e.g. anonymous `/admin` returns 29 characters of shell text + the `/admin/login` redirect; MANAGER on `/admin/users` gets no create form and no user emails). Enforcement is server-side.
6. **Files added to `public/` after `next start` are 404 until restart** — build-output snapshot semantics; documented for the owner.
7. **Deleting a product image DB row through the path-based delete does not remove the file from disk** (the upload-flow delete does) — by design; local storage is development-only pending the durable-storage decision.
8. **A product with zero images becomes non-orderable** (image count is an orderability blocker) — fail-closed by design.

---

## 5. Environment incidents (recovered, no lasting impact)

- **Corrupted `.next` mid-session:** a stale `next start` server was running while a `next build` wrote the same directory. Symptom: inconsistent route output. Recovery: kill all node processes, rebuild. All final gates below were run with zero node processes running.
- **Transient axe color-contrast flags:** viewport-dependent (the reveal animation mid-state is visible at 1280×800 but not at the 800×600 default) — explained in §4.1, not a defect.
- **Benign server log noise:** `Missing origin header from a forwarded Server Actions request` warnings appear for no-JS action POSTs (used by the test harness); real browsers send the header.

---

## 6. Test data and cleanup verification (fully restored)

**Test identifiers used (all deleted):** admin `test-superadmin@example.test` + MANAGER admin `zz-role-test@example.test`; supplier "ZZ Local Test Supplier"; product "zz-local-test-ring"; courier `ZZ_LOCAL_TEST_COURIER`; customer `local-test-customer@example.test`; orders `JS-20261111-HN74SA`, `JS-20261111-AW61TA`, `JS-20261111-TC0CYS`; tracking `ZZTEST123456789`.

**Payment env for order-flow testing:** set only as process environment on the test server (never written to `.env.local`, never printed in this report or logs beyond the fact of presence): `PAYMENT_BANK_ACCOUNT_NUMBER`, `PAYMENT_BANK_ACCOUNT_HOLDER`, `PAYMENT_EASYPAISA_NUMBER`, `PAYMENT_EASYPAISA_ACCOUNT_HOLDER` with placeholder test values. Those server processes are terminated, so the values no longer exist anywhere.

**Database final state (verified after cleanup):**
- All business tables **0**: Supplier, SupplierNote, SupplierAgreement, Product, ProductImage, ProductCustomizationConfirmation, Category, Brand, InventoryMovement, Order, OrderItem, PaymentEvent, OrderStatusEvent, OrderProductionStatusEvent, ReturnRequest, AdminAuditLog, AdminUser, AdminSession, Customer, CustomerNote, Address, Courier, CourierDestination, MediaAsset, SeoMetadata.
- `AdminRole = 6` (seeded role catalogue: SUPER_ADMIN, MANAGER, PRODUCT_MANAGER, ORDER_MANAGER, FINANCE_MANAGER, CONTENT_MANAGER).
- Seeded configuration tables retained (verified as migration baseline, all timestamps `2026-11-08T10:40:22` — hours before this session began, untouched by testing): ShippingSetting 1, ShippingZone 1 (PK), BusinessSetting 10, PaymentSetting 2 (both `enabled=false`), ContentPage 3 (DRAFT), HomeSection 4, NavigationItem 8.
- `_prisma_migrations`: 6 applied, up to date.

**Disk final state:** `public/` contains only the 4 baseline files (`.gitkeep`, the owner logo PNG, `images/js-jewellers-hero.png`, `images/products/.gitkeep`). The test upload directories (`public/images/products/test/`, `public/images/products/uploads/`) were deleted.

**`.env.local`:** untouched — only the 4 original keys (`DATABASE_URL`, `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD`, `ADMIN_SETUP_SECRET`); no `PAYMENT_*` keys or test values.

---

## 7. Final verification suite (12 November 2026, after all fixes + cleanup)

| Gate | Result |
| --- | --- |
| `npm test` | **204 tests, 0 failures** |
| `npm run typecheck` | pass (no errors) |
| `npm run lint` | pass (no errors) |
| `npm run check:contrast` | **43/43 passed** |
| `npm run prisma:validate` | schema valid |
| `npm run prisma:status` | 6 migrations applied, up to date |
| `npm run build` | pass — compiled in 7.0s, 63/63 static pages, exit 0; `/checkout/review` correctly `ƒ (Dynamic)` |
| Final-build smoke test (`next start`, GET-only) | homepage, collections, shipping, admin login, order lookup all 200; unknown route 404; anonymous `/admin` serves no content (redirect only); `/admin/setup` available for the owner action; **zero errors in the server log** |

---

## 8. Remaining blockers and owner actions (unchanged, external)

1. **Production PostgreSQL** — provision a separate production database/role and run `prisma migrate deploy`.
2. **Durable object storage for product images** — local uploads are development-only (and Vercel caps request bodies near 4.5 MB); choose and configure storage before launch.
3. **Payment account values** (T049/T050) — set the four `PAYMENT_*` server environment variables with the real Islamic Bank / Easypaisa details.
4. **First Super Admin** (T054) — the owner's one-time `/admin/setup` action using `ADMIN_SETUP_SECRET`; not performed automatically.
5. **Approved supplier and product data** (T013A/T014) — the catalogue is intentionally empty until owner-approved records exist.
6. **Courier companies** (T060) — add and fully approve each courier through the Admin Panel (verify account, record written jewellery acceptance, approve destination charges/estimates, then activate).
7. **Formal legal review** (T053) — of the policy wording before publication.
8. **Hosting/domain/secrets configuration** (T044) — Vercel or equivalent, DNS, TLS, environment variables.
9. **Backups, monitoring, CSP/HSTS** — at the hosting layer; also decide on the in-process rate-limiter single-instance assumption.
10. **Explicit written deployment approval** from the owner.

---

## 9. Local-testing completeness statement

**Covered locally:** all 15 checklist items against the actual production build (`next build` + `next start`, multiple builds), including the complete customer journey (cart → checkout → draft → review → place → confirmation → token-only access), the fail-closed checkout variant without payment env, the admin order workflow with invalid-transition rejection, the full payment cycle (customer submit → admin verify), supplier/product/image/customization/media flows, generic courier fail-closed activation, the first-admin setup flow with secret checks, admin-role workflows with server-side denial, unauthorized-access probes, missing-env behavior, database/migration state, and responsive + accessibility sweeps (26 renders at 375px/1280px with zero overflow; axe-core across public and admin routes).

**Not coverable locally (and therefore not claimed):** real payment processing (this is a manual bank-transfer/Easypaisa model by design — verification is an admin action, no gateway exists), real courier integrations (generic owner-managed registry by design), production hosting/domain/TLS/production database, email/SMS delivery (not in the approved scope), multi-instance rate limiting (in-process limiter implies single-instance deployment), and exhaustive per-route × per-viewport accessibility combinations (representative routes and both breakpoints were tested).

---

## 10. Files changed (4, uncommitted — no local Git repository)

| File | Change |
| --- | --- |
| `lib/db.ts` | Bug #1 — always cache PrismaClient on `globalThis` (production pool reuse). |
| `lib/admin/settings.ts` | Bug #2 — `updateCourierStatus` evaluates destination eligibility against the target status. |
| `app/admin/(dashboard)/page.tsx` | Bug #3 — wrapped the dashboard link in `<dd>` (valid definition list). |
| `app/(site)/checkout/review/page.tsx` | Bug #4 — `await connection()` before reading the draft cookie (request-time rendering). |

No schema, migration, policy, business-rule, theme, or test changes. No data survives from this audit.

---

## 11. Bottom line

The application is now in its most thoroughly verified state: **every local test passes, every confirmed defect found during testing is fixed and re-verified, the database and filesystem are restored to baseline, and the full quality gate suite is green on the final build.** What separates the site from production is exclusively the owner/external action list in §8 — nothing further is testable from this machine.
