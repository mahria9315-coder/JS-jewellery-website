
# JS Jewellers â€” Task Tracker

**Status:** T001 repository audit, T040 responsive/accessibility verification, and T041 performance verification are complete â€” 4 November 2026. T003B documentation alignment is complete. T003A baseline, T004 design tokens, T005 header/navigation/footer, T006 homepage sections, T007 responsive layouts, T008 collections, T009 product listing, T010 product details, T011 search/filtering/sorting, T012 product image handling, T032 page metadata, T033 sitemap/robots, T034 product structured data, and T035â€“T037 integration documentation/static checks are verified. The owner-approved Black Gold Galaxy theme was applied and verified across those pages on 5 November 2026 as a cross-cutting presentation enhancement with no new task IDs; it changes no task status. A follow-up owner-approved presentation batch on the same date added the dark/light theme toggle, editorial italic typography, premium 3D cards, and the decorative CSS starfield, also with no new task IDs and no task-status changes. The starfield was then replaced on 6 November 2026 by the owner-approved two-style background system: Luxury Silk Waves on the homepage only and a Geometric Grid on every other route. The homepage layer was subsequently updated on the same date to the Bright Gold Geometric Grid, while every non-homepage route retains the existing Geometric Grid. That homepage update is recorded as T006A and is DONE: the pre-existing `/privacy` and `/returns` `lastUpdated` errors were resolved outside this task, and repository-wide typecheck and production build now pass; the earlier background replacement made no task-ID or task-status changes outside T006A. T013 is DONE: PostgreSQL 18 and Prisma 7 are verified locally under the infrastructure-only scope, with an applied no-DDL baseline migration and the `migrate deploy` workflow documented in `DATABASE.md`. T029 is DONE: the owner-supplied draft `/privacy` and `/returns` wording is published and linked from the footer, with every unapproved detail marked **PENDING OWNER APPROVAL** and both routes intentionally `noindex` until final owner approval and legal review. T029A is DONE (technical implementation): the policy drafts now carry the confirmed brand/legal name, Karachi location, clickable business email **mahria9315@gmail.com**, WhatsApp link, Pakistan **3-day / 25% deduction / 75% refund** terms with a worked PKR 10,000 example, safeguards for faulty and legally protected returns, country-aware international terms backed by `lib/returns-policy.ts`, the **4â€“7 day** delivery estimate, and the new `/shipping` page. Formal legal review and final owner approval remain **BLOCKED** under T053, and no destination outside Pakistan has been enabled. A server-only payment configuration boundary exists for Bank Transfer (Islamic Bank) and Easypaisa, and the checkout, order, manual-payment, return, refund, supplier, product, and guarded admin workflows are implemented under the owner-approved T049/T050/T052 scopes. The actual payment account values remain **BLOCKED** under T049/T050, so both methods stay unavailable. No administrator account exists yet; creating the first Super Admin is the website owner's one-time `/admin/setup` action under T054 and was not performed automatically. T013A's technical implementation is complete, but real supplier/product onboarding remains BLOCKED by missing approved supplier data. The production catalogue remains intentionally empty until approved supplier-backed product records exist; demo content is approved for development/preview only, must be clearly labelled, and is not orderable. No payment has been received or verified, and no live payment or marketing integration exists.  
**Tracker:** 56 DONE, 15 BLOCKED, 3 NEEDS_REVIEW, 0 NOT_STARTED.

**Reconciliation update (10 November 2026):** The T052 implementation was reconciled against the earlier Phase 5, Phase 6, and release tasks instead of being duplicated. T017â€“T019, T021â€“T028, T039, and T043 are now recorded as DONE because their implementation and acceptance can be verified through code, unit tests, static checks, read-only HTTP checks, and read-only database inspection. T014, T018A, T020, T026A, T026B, T027A, T031, T038, T038A, T042, and T044 are recorded as BLOCKED on missing owner data, decisions, accounts, or approvals. T015/T016 remain NEEDS_REVIEW. No supplier, product, image, agreement, confirmation, order, customer, payment, or administrator record was created, and no production deployment or approval occurred. The release review is in `docs/RELEASE_REVIEW.md`; the production-readiness assessment is in `docs/PRODUCTION_READINESS.md`.
**Self-service admin update (10 November 2026):** T055 is DONE as a technical implementation: saved business contact, opening-hours, and delivery settings now reach the storefront with safe fallbacks; the homepage hero and showcase are editable; notification preferences are stored without sending messages; suppliers can be archived and restored with a published-product guard; and the new rules are covered by automated tests. T056 product image upload is NEEDS_REVIEW because no administrator account exists for an end-to-end upload check and production image storage is undecided. No supplier, product, order, payment, customer, or administrator record was created, and no commit, push, deployment, reset, or destructive database command occurred.

**Courier integration update (10 November 2026; superseded for courier-provider specifics by the 11 November 2026 removal below):** T057 is DONE as a technical implementation: courier configuration, admin activation guards, checkout gating, order charge/estimate snapshots, manual tracking administration, and customer tracking display were implemented and unit-tested (30 new tests; suite total 197; lint, typecheck, contrast, build, and Prisma checks pass; the additive migration `20261110000000_courier_integrations` was applied with the documented `npm run prisma:deploy`). At the time of this update no courier was approved, configured, or operational: no courier account was created or contacted, jewellery acceptance and destination charges were unset, and activation was server-blocked pending owner confirmations. Pakistan checkout behaviour was unchanged (free shipping, the published 4â€“7 day store estimate, no COD). The provider-specific courier names, registry codes, candidate precedence, and research document introduced by this update were later removed by T060 on 11 November 2026, which made the courier registry provider-independent and owner-managed; see the courier provider-removal update below. No courier, destination, charge, booking, or shipment record was invented.

**Final handover completion update (11 November 2026; courier-provider specifics superseded by the removal update below):** T058 and T059 are DONE as technical implementations. T058 researched one further potential provider from the two official sources the owner specified and recorded it as two potential-provider rows (domestic and international eligibility configured separately), both starting `PENDING_VERIFICATION` with all existing activation gates unchanged; jewellery stayed `NOT_ACCEPTED`, no database migration was needed, and courier precedence kept the previously selected providers first so nothing changed for customers. T059 produced the owner-facing Super Admin setup guide (`docs/OWNER_SETUP_GUIDE.md`), refreshed `docs/PRODUCTION_READINESS.md` with a consolidated deployment checklist, and re-ran the full verification suite (210 tests 0 failures; typecheck, lint, contrast 43/43, build 63 pages, Prisma validate and status up to date with 5 migrations). No courier, payment, supplier, product, order, customer, or administrator record was created; no account was created with any courier or provider; no deployment, commit, push, or destructive command occurred. The provider-specific records, notices, and research documentation from T058 were later removed by T060 on 11 November 2026. Owner actions remain tracked under T044, T049/T050, T053, T054 (owner-run setup), and T060.

**Courier provider removal (11 November 2026):** T060 is DONE: all provider-specific courier integrations and references were removed, restoring a fully generic, provider-independent courier registry that the client manages through the Admin Panel. The fixed courier registry codes, per-provider jewellery notices, provider candidate precedence, provider-named admin help text, the provider-specific tracking-format rule, and the courier research document (`docs/courier-research.md`) are gone; courier records are now created by the owner with a company name, delivery scope, and optional contact details, and a tracking reference must satisfy generic guardrails only. Every existing fail-closed gate is unchanged: verified account, written jewellery acceptance, approved per-destination charges and estimates, and server-blocked activation. The additive migration `20261111000000_courier_contact_details` was applied with the documented `npm run prisma:deploy`; the historical `20261110000000_courier_integrations` migration file is intentionally untouched because editing applied migrations breaks checksums (provider names appear there only in historical comments). Pakistan checkout behaviour is unchanged (free shipping, the published 4â€“7 day store estimate, no COD), no international destination is available until the owner adds and fully approves a courier, and no courier, destination, charge, booking, shipment, or credential record was created. Supplier, product, catalogue, payment, theme, and all unrelated work is untouched.

**Production-readiness audit (11 November 2026):** T061 is DONE: the full production-readiness audit re-verified the repository from the current tree instead of trusting earlier reports. The approved business rules are intact (Pakistan market, Bank Transfer plus Easypaisa only, COD impossible, generic owner-managed couriers, empty catalogue, owner-created first Super Admin), the hosting, database, image-storage, admin-auth, payment, and security surfaces were audited, the full verification suite passed (204 tests, typecheck, lint, contrast 43/43, build with 63 pages, Prisma valid and up to date with 6 migrations, production dependencies with 0 vulnerabilities), and one clearly-required safe fix was implemented: `postinstall` now regenerates the Git-ignored Prisma Client so a fresh clone or a Vercel `npm ci` â†’ `next build` succeeds. `docs/PRODUCTION_READINESS.md` was refreshed with the verified numbers. The verdict is NOT READY TO DEPLOY: production database, durable image storage, payment account values, the first Super Admin, supplier/product/courier data, legal review, hosting configuration, backups, monitoring, and explicit owner approval remain outstanding. No deployment, domain, production database, account, or credential action occurred.

**Local testing and bug-fix audit (11â€“12 November 2026):** T062 is DONE: the running production build was tested end-to-end against the agreed 15-item checklist using isolated local test data, and every checklist item passed. Four confirmed defects were found and fixed, each behavior-preserving and re-verified with the affected flows plus the full gate suite: a production PrismaClient connection leak in `lib/db.ts` (client cached on `globalThis` in every environment so pools are reused in production); a courier-activation chicken-and-egg deadlock in `lib/admin/settings.ts` (destination eligibility was evaluated against the stored pre-activation status instead of the target status, so no fully-approved courier could ever be activated; every fail-closed gate is unchanged); an axe definition-list accessibility violation on the admin dashboard (`Link` wrapped in `dd`); and a deterministic `Date.now()` prerender error on `/checkout/review` (the PPR instrumented pass evaluated the draft-token expiry check; the page now opts into request-time rendering with `await connection()`, per the Next.js remedy, and builds as fully Dynamic). The full customer order flow, fail-closed no-payment-env checkout, admin order workflow, payment cycle, supplier/product/image/customization/media/courier/setup/role workflows, unauthorized-access probes, responsive sweeps, and axe checks all pass on the final build; a final-build smoke test served every page correctly with a clean server log. All test data was removed and the documented empty state was restored and verified: every business table 0, `AdminRole=6` plus the migration-seeded configuration rows only (ShippingSetting 1, ShippingZone 1, BusinessSetting 10, PaymentSetting 2, ContentPage 3, HomeSection 4, NavigationItem 8 â€” all with the 8 November migration timestamps, untouched by testing), 6 migrations applied, `public/` back to its 4 baseline files, `.env.local` unchanged, and the placeholder payment environment variables existed only on terminated test-server processes and were never written to any file. The four fixes are uncommitted local edits (no Git repository is initialized). The verdict is unchanged from T061: local testing is COMPLETE and passing, but production remains NOT READY pending the owner actions (production database, durable image storage, payment account values, first Super Admin, approved supplier/product data, courier approvals, legal review, hosting/domain, backups/monitoring, and explicit approval). The full report with evidence is in `docs/LOCAL_TEST_REPORT.md`. No commit, push, deployment, reset, or destructive database command occurred.

**Background restoration â€” water-wave experiment removed (14 November 2026):** At the owner's request the 12 November animated flowing-water background, together with the earlier experimental coloured flowing-line style and the superseded Luxury Silk Waves layer, was removed completely and the last approved theme backgrounds were restored. The homepage again uses the owner-approved 8-10 November treatment: solid pure black `#000000` in the dark theme and the owner-supplied shopping background image fixed under its minimal ivory readability veil in the light theme; every non-homepage route again uses the static `.site-background--grid` geometric grid over the approved `172deg` theme gradient. This supersedes the 6 November Bright Gold Geometric Grid homepage layer, which the 8-10 November image treatment had already replaced before the wave experiment. Removed: `components/layout/FlowingWavesBackground.tsx`, the unrendered `components/layout/SilkWaves.tsx`, every `--flow-wave-*` and `--silk-*` token from both theme blocks, all `.flowing-waves*`, `.silk-waves`, and `.site-background--silk*` CSS, the four wave keyframes, the mobile wave simplification rules, the light-only homepage wave override, and the wave reduced-motion rule. `GeometricGrid.tsx` and `HomepageShoppingBackground.tsx` no longer render wave layers; no background animation, background SVG, filter, blend mode, `will-change`, or unused wave token remains. The missing owner asset was recovered from an owner file whose byte size (1,811,938) matches the image the 8 November verification recorded being served, and restored to `public/images/homepage-shopping-background.png`; the 404 is gone. Theme colours, surfaces, cards, header, footer, typography, the circular theme toggle, `js-theme` localStorage persistence, and pre-paint theme initialization were not changed. Browser verification on the production build at 1366x900 and 390x844 in both themes across `/`, `/collections`, `/search`, and `/privacy` (16 combinations) found exactly one static `.site-background` per route, dark homepage `rgb(0, 0, 0)` with no image, light homepage `rgb(251, 247, 239)` with the shopping image served (200), `geometric-grid` on all non-homepage routes, zero wave/silk nodes, zero background animations/SVGs/filters, `pointer-events: none`, no horizontal overflow, and no console errors, exceptions, or failed requests. The toggle switched `dark -> light` and `light -> dark`, updated its label, and persisted `js-theme` across reload in both directions. Gates: `npm test` 245/245, `npm run lint`, `npm run typecheck`, and `npm run build` passed (Next.js 16.4.5, 67 pages). Limitation: verification was headless Chrome, not a physical device, and screenshots were captured but not visually reviewed; the legacy `BrightGoldGrid.tsx` component and its `--home-grid-*` CSS remain in the repository unrendered because they are a documented earlier approved grid, not part of the wave experiment. Not deployed/committed/pushed.

**Advanced security hardening (12 November 2026):** T064 is DONE for its local, safe scope: a read-only security audit (`docs/SECURITY_AUDIT_T064.md`); administrator TOTP MFA with ten single-use recovery codes, AES-256-GCM secret encryption, replay protection, and Super Admin reset (always enforced in production); a fail-closed shared rate-limit adapter (`memory` for development/tests, Upstash Redis REST for production) with per-actor administrator limits and new payment-submission/return-request limits; explicit same-origin checks on authentication and profile actions; additional security headers and `private, no-store` for `/checkout/*`; extended environment validation and self-tests; local-only CI, CodeQL, and Dependabot configuration; WAF/bot guidance; and 13 new MFA tests plus extended security tests. The final gate suite passed: **245 tests**, typecheck, lint, contrast 43/43, Prisma valid and up to date with **7 migrations**, production build with **67 pages**, `npm audit --omit=dev` clean, and environment self-tests passed. No deployment, commit, push, account, credential, Upstash store, WAF rule, CI run, production database, or payment was created or contacted. Production remains **NOT READY (NO-GO)**; T044 stays BLOCKED on the owner actions in `docs/PRODUCTION_READINESS.md` Â§7 and Â§10.

**Scope consolidation note (8 November 2026; reconciled 10 November 2026):** The owner-approved T052=A scope implemented the cart, checkout, order, manual-payment, return, refund, supplier, product, and guarded admin workflows. That overlaps the older T017â€“T028 task entries. The reconciliation recorded above on 10 November 2026 closed T017, T018, T019, T021â€“T025B, T026 order administration, T027, T028, T039, and T043 as technically verified where evidence exists. T020 Cash on Delivery remains outside the approved scope; supplier availability verification, forwarding, fulfilment evidence, settlement, and the complete dropshipping journey remain BLOCKED under T018A, T026A, T026B, T027A, and T038A. Do not treat blocked supplier work as delivered.  
**Rule:** Do not mark a task DONE until its acceptance criteria have been verified.

**Client-approved business, returns, delivery, and payment update (7 November 2026):** T029A, T045, T046, T047, T048, and T051 are DONE as technical implementations. Formal legal review, final owner approval, the actual payment account numbers, and the checkout/payment step are not complete. T049, T050, T052, and T053 are BLOCKED. No payment has been processed or verified, no destination outside Pakistan has been enabled, and no legal or production-readiness claim is made. *This status was superseded by the implementation completion update below.*

**Implementation completion update (8 November 2026):** The owner-approved T049=A, T050=A, T052=A, and T053=A scopes and T013A=B scope were implemented. T052 cart, checkout, order, manual-payment, return, refund, supplier, product, and admin workflows are DONE as technical implementations. T013A supplier/agreement/product schema, onboarding, and publication safeguards are DONE; real supplier and product records remain BLOCKED because no approved data was supplied. T049 and T050 instructions and manual verification are implemented, but both methods remain unavailable because `PAYMENT_BANK_ACCOUNT_NUMBER`, `PAYMENT_BANK_ACCOUNT_HOLDER`, `PAYMENT_EASYPAISA_NUMBER`, and `PAYMENT_EASYPAISA_ACCOUNT_HOLDER` are absent. T053 policy preparation is complete, but formal legal review and final owner approval remain BLOCKED. No supplier, product, stock, order, payment, or admin account was invented. No payment has been received or verified, and no legal or production-readiness claim is made.

**Customization implementation update (9 November 2026):** T015 customization configuration and T016 customization persistence, plus the separate production-status workflow, are implemented as technical work. T015 and T016 are recorded as NEEDS_REVIEW rather than DONE because the catalogue, supplier-confirmation, and order tables are empty: no live product could be offered as customizable and no real order could display a stored customization. The code paths are covered by unit tests and typecheck/lint/contrast/build checks, but their acceptance criteria have not been verified against real records. T014 remains NOT_STARTED and blocked on approved supplier and product data. No supplier, product, confirmation, capability, or customer order was invented.

**Cross-cutting typography refinement (7 November 2026):** DONE for presentation verification, with no new task IDs and no task-status changes. The homepage hero is now the largest heading site-wide (800 italic, solid champagne `#E8DCC5` in dark and deep gold `#7A5A1E` in light; measured 41.6px at 375, 42.08px at 390, 54.176px at 768, 73.312px at 1366, and 75.68px at 1440). Page titles, section headings, and product names use a consistent italic display hierarchy, while body copy, navigation, buttons, labels, and controls remain upright. Font-role tokens and semantic heading classes live in `app/globals.css`; the preferred webfonts are listed first but not downloaded, and verified system fallbacks are used. `npm run lint`, `npm run typecheck`, `npm run check:contrast` (43/43), and `npm run build` pass, along with 70 browser checks across 5 viewports Ã— 2 themes Ã— 7 routes with no typography failures. The pre-existing 404 error-shell theme limitation and the intentionally empty catalogue remain unchanged and are documented in `DESIGN_SYSTEM.md`.

## Status Definitions

- `NOT_STARTED` â€” Work has not begun.
- `IN_PROGRESS` â€” Work is currently being performed.
- `BLOCKED` â€” Work cannot continue because a dependency or decision is missing.
- `DONE` â€” Acceptance criteria have been verified.
- `NEEDS_REVIEW` â€” Implementation exists but requires further checking or owner review.

---

## Phase 1 â€” Repository Audit and SDD

### T001 â€” Inspect the existing repository
**Status:** DONE

- [x] Inspect the project folder and current Git status.
- [x] Identify framework, package manager, dependencies, and scripts.
- [x] Review existing routes, components, styles, and tests.
- [x] Identify existing working features and missing requirements.

**Acceptance criteria:** A repository audit is recorded without unnecessary code changes.

**Verification (4 November 2026):** Audit recorded in `REPOSITORY_AUDIT.md`. Verified branch `main`, 8 commits, HEAD `2828901`, clean tree before the batch, no tags or remotes, 48 tracked files, and no secrets in tracked files. Confirmed Next.js 16.4.5 App Router with Cache Components, React 19.3.0, strict TypeScript, Tailwind CSS 4, ESLint 9, and npm 11.19.0 on Node 24.21.0. Reviewed every route, component, data module, style token, and script; no test framework or test files exist. Recorded implemented features, missing dependencies, documentation drift, and nine risks. T001 required inspection only; the five code files changed in this batch belong to T040/T041, and the only T001 changes are the audit record and a README link. `npm run lint`, `npm run typecheck`, `npm run check:contrast`, and `npm run build` passed before and after the batch.

**T003 note (historical):** T003A created the repository and baseline files but did not satisfy T001. The audit above was performed as its own task after the feature work it needed to inspect existed.

### T002 â€” Verify the four SDD documents
**Status:** DONE

- [x] Confirm `AGENTS.md` exists.
- [x] Confirm `spec.md` exists.
- [x] Confirm `plan.md` exists.
- [x] Confirm `tasks.md` exists.
- [x] Identify contradictions or unresolved decisions.

**Acceptance criteria:** All four documents are available and important conflicts are documented.

**Verification (3 November 2026):** All four documents were present and readable. Stack, brand palette, eight collections, COD, customization, security, and admin requirements were cross-checked. Conflicts and unresolved decisions were recorded and then carried into the T003 register in `plan.md` Â§5. Re-verified after the approved dropshipping update; supplier requirements and pending owner decisions are now documented.

### T003 â€” Confirm requirements and dependencies
**Status:** DONE

- [x] Identify required owner assets.
- [x] Identify database and environment requirements.
- [x] Identify payment-provider dependencies.
- [x] Identify domain and hosting decisions.
- [x] Record the first eligible implementation task.

**Acceptance criteria:** Dependencies and the next task are documented.

**Verification (3 November 2026; updated for dropshipping):** `plan.md` Â§5 now records owner and supplier assets, technical dependencies, payment and settlement scope, and PENDING decisions. The bootstrap task T003A is recorded as the next implementation task. `AGENTS.md`, `spec.md`, `plan.md`, and `tasks.md` now follow the approved dropshipping model. `Agents.md` was renamed to `AGENTS.md` with content unchanged in the earlier pass. No application code, packages, database, or deployment was created.

---

## Phase 1A â€” Bootstrap Baseline

### T003A â€” Create and verify the Next.js project baseline
**Status:** DONE  
**Completed:** 4 November 2026. Approved baseline implemented in the project folder. No feature work, database, payments, owner/supplier data, or deployment added.

- [x] Create a new Next.js App Router project in the approved project folder.
- [x] Enable TypeScript in strict mode.
- [x] Configure Tailwind CSS.
- [x] Configure ESLint.
- [x] Initialize Git if it is not already initialized.
- [x] Install only approved baseline dependencies required for the items above.
- [x] Create `.env.example` containing placeholders only; no real secrets.
- [x] Run the production build and verify it succeeds.
- [x] Confirm no features, database connection, payment logic, owner data, fake seed data, or deployment were added.

**Acceptance criteria:** The project builds successfully with Next.js App Router, strict TypeScript, Tailwind CSS, ESLint, an initialized Git repository, approved baseline dependencies only, and a placeholder-only `.env.example`. No application features, database, payment integration, owner data, or deployment exists. Evidence of the build result is recorded.

**Verification evidence (4 November 2026):**
- Next.js `16.4.5` with App Router (`app/`), React `19.3.0`, TypeScript `^5` with `"strict": true`.
- Tailwind CSS `^4` via the version-compatible `@tailwindcss/turbopack` integration; `app/globals.css` uses `@import "tailwindcss"`.
- ESLint `^9` with `eslint-config-next` `16.4.5`.
- Baseline dependencies only: `next`, `react`, `react-dom`; dev tooling for TypeScript, Tailwind, ESLint, and Node/React types.
- Git repository initialized on branch `main`. No prior Git history existed and no existing repository was reused.
- `.env.example` contains placeholder/commented values only and is committed; `.env*` remains ignored otherwise.
- `.gitignore` covers `node_modules`, `.next`, build output, environment files, and TypeScript build info.
- `npm run lint` â†’ exit 0.
- `npm run typecheck` â†’ exit 0 on a clean tree with no `.next` directory.
- `npm run build` â†’ exit 0; static routes `/` and `/_not-found` generated.
- No Prisma, PostgreSQL, payment provider, authentication, admin, catalogue, cart, checkout, owner/supplier data, or deployment configuration exists.
- `AGENTS.md`, `spec.md`, and `plan.md` were not modified; their SHA-256 hashes were unchanged by the bootstrap. `tasks.md` was updated only to record the verified T003A status and the still-blocked T001 audit.

**Out of scope:** Homepage, catalogue, cart, checkout, admin, Prisma/PostgreSQL, authentication, payment providers, environment secrets, production deployment.

---

## Phase 1B â€” SDD Alignment

### T003B â€” Align the SDD with the JS Jewellers brand, demo content, and payment scope
**Status:** DONE  
**Completed:** 4 November 2026. Documentation-only alignment; no application code, assets, packages, database, or deployments were changed.

- [x] Adopt JS Jewellers as the approved brand name in website text and metadata.
- [x] Record that the owner's existing logo must be used exactly and must not be replaced, and that the logo file is not present and must be supplied.
- [x] Approve demo products and demo images for development and preview only, clearly labelled and not orderable.
- [x] Confirm Cash on Delivery and Bank Transfer as the initial payment methods.
- [x] Defer Easypaisa and JazzCash.
- [x] Record that PostgreSQL/Prisma are not installed and T013 has not started.
- [x] Record that the domain is not finalized and Vercel is only a future hosting option.
- [x] Record that `constitution.md` and `specification.md` are absent and `spec.md` is the current specification.

**Acceptance criteria:** The governing documentation reflects the owner's confirmed brand, demo-content, and payment decisions consistently; no application code or assets are changed; completed task statuses and verification evidence are preserved; and remaining blockers are clearly recorded.

**Verification evidence (4 November 2026):**
- Confirmed the owner's logo is not in the repository: `public/` contains only `.gitkeep`, and `components/layout/SiteLogo.tsx` renders a text wordmark. No logo or image asset was created, replaced, or modified. The logo remains a PENDING owner-provided asset.
- Updated `AGENTS.md`, `spec.md`, `plan.md`, `tasks.md`, `README.md`, `DESIGN_SYSTEM.md`, `MARKETING_INTEGRATIONS.md`, and `PAYMENT_INTEGRATIONS.md` to use JS Jewellers and the confirmed decisions.
- Demo content is documented as development/preview only, clearly labelled, and not orderable; the cart, checkout, and order restrictions are explicit. No demo products or images were added in this task.
- Payment scope is documented as COD + Bank Transfer. Bank Transfer remains PENDING on owner-supplied bank details and a confirmed manual verification workflow. Easypaisa and JazzCash are recorded as DEFERRED.
- PostgreSQL is recorded as not installed/configured and T013 as not started. No database package, schema, migration, environment file, or connection was added.
- The domain remains unapproved; Vercel remains a future hosting option only. Nothing was deployed.
- Historical evidence in `REPOSITORY_AUDIT.md` and `QUALITY_VERIFICATION.md` is preserved unchanged, including the former brand name used at the time of those reports. Completed task statuses were not altered.
- The diff was reviewed: only the eight governing documentation files listed above were changed. Application code and assets were unchanged.
- `npm run lint`, `npm run typecheck`, `npm run check:contrast`, and `npm run build` were re-run after the documentation changes; all passed.

**Known limitations (as recorded 4 November 2026):**
- The owner's logo file is still missing, so no brand asset can be applied yet.
- The application code, visible copy, and metadata still use the former brand name and text wordmark until a separate approved brand-implementation task starts.
- Demo products and demo images are approved in policy but not implemented; that requires a separate approved task.

**Superseded (5 November 2026):** The owner supplied `public/Luxury Gold Jewelry Monogram Logo.png` and the Black Gold Galaxy theme replaced the former text wordmark and palette. The limitations above describe the position on 4 November 2026; see the consolidated theme note at the end of this tracker for current status. Demo products remain unimplemented and the production catalogue remains intentionally empty.

**Superseded payment scope (7 November 2026):** The 4 November 2026 decision recorded above (Cash on Delivery plus Bank Transfer, with Easypaisa deferred) was replaced by the client-approved methods **Bank Transfer (Islamic Bank)** and **Easypaisa**. Cash on Delivery is no longer in the approved scope. The historical checkboxes are preserved unchanged; see T020 and T049/T050 for the current position.

---

## Phase 2 â€” Foundation and Design

### T004 â€” Establish the approved design system
**Status:** DONE  
**Completed:** 4 November 2026. Approved colour, typography, spacing, and focus conventions implemented and verified. No store features were added.

- [x] Apply approved brand colours.
- [x] Establish typography and spacing.
- [x] Define reusable visual conventions.
- [x] Check text contrast and keyboard focus.

**Acceptance criteria:** Shared styling follows `spec.md` and remains readable.

**Verification evidence (4 November 2026):**
- `app/globals.css` defines only the approved palette as Tailwind theme tokens: Obsidian `#090909`, Charcoal `#191919`, Gold `#C6A15B`, Champagne `#E8DCC5`, White `#FFFFFF`.
- Typography uses a serif heading stack and a sans-serif body stack. No external webfont is downloaded.
- Spacing and layout tokens: fluid gutter, `4rem`/`6rem` section rhythm, `80rem` page container, and a restrained `0.125rem` radius.
- Reusable conventions defined: `container-page`, `surface-dark`, and `surface-muted`.
- Global `:focus-visible` style is a 2px obsidian outline with a 2px offset; dark surfaces use champagne for a visible ring.
- `DESIGN_SYSTEM.md` documents tokens, approved usage, contrast restrictions, examples, and verification.
- `scripts/check-contrast.mjs` and `npm run check:contrast` verify the documented WCAG pairs; all 12 checks passed.
- Gold on white is explicitly restricted at `2.43:1` and must not be used for normal text, icons, or light-surface focus rings.
- Browser verification via Chrome DevTools Protocol at a 390px viewport: body renders the sans stack in obsidian on white; the heading renders the serif stack at `36px`/weight `400`; supporting copy renders charcoal; pressing Tab produced `:focus-visible` on a button with a solid `2px` obsidian outline at `2px` offset.
- `npm run lint` â†’ exit 0. `npm run typecheck` â†’ exit 0. `npm run build` â†’ exit 0.
- Built CSS contains the palette, type, spacing, surface, and focus rules.
- No products, suppliers, prices, stock, reviews, database, payments, secrets, or deployment were added.

**Theme update (5 November 2026):** The owner-approved Black Gold Galaxy theme superseded the T004 colour tokens and surface conventions. T004 remains DONE; the updated palette, gradient, contrast rules, surface utilities, and the footer-rotation exception are documented in `DESIGN_SYSTEM.md` and verified in the consolidated theme note at the end of this tracker.

### T005 â€” Implement shared site layout
**Status:** DONE  
**Completed:** 4 November 2026. Shared header, responsive navigation, footer, and skip link implemented and verified. No store features were added.

- [x] Implement or refine header.
- [x] Implement navigation.
- [x] Implement footer.
- [x] Check mobile menu and keyboard operation.

**Acceptance criteria:** Shared navigation works on mobile and desktop.

**Verification evidence (4 November 2026):**
- `components/layout/SiteHeader.tsx` provides a responsive header with desktop navigation and a mobile disclosure menu.
- `components/layout/SiteFooter.tsx` provides footer navigation, the eight approved collections, policy links, and an honest contact placeholder. No policy wording, contact number, or WhatsApp number was invented.
- `components/layout/SiteLogo.tsx` provides the shared text wordmark used at the time of T005; the current code still renders the former brand name and is pending a separate brand-implementation task.
- `lib/site-navigation.ts` centralises primary, shop, collection, and policy links.
- `app/layout.tsx` now renders a skip link, header, semantic `<main id="main-content">`, and footer. `app/page.tsx` keeps the existing placeholder content inside the shared layout.
- The mobile toggle exposes `aria-expanded` and `aria-controls`; opening the menu, tabbing into links, and pressing Escape were verified.
- Escape closes the mobile menu and returns focus to the toggle button. Activating a link also closes the menu.
- Semantic landmarks verified: exactly one `<header>`, one `<main>`, and one `<footer>`; navigation elements are labelled.
- Browser verification at 390px: desktop navigation hidden, menu button visible, 13 mobile links available, panel closed by default.
- Keyboard verification: the skip link is the first tab stop, is visible when focused, targets `#main-content`, and shows a 2px obsidian ring. Opening the menu with Enter, tabbing to the first link, and closing with Escape all passed.
- Browser verification at 1280px: desktop navigation visible with five links, menu button hidden, and Home exposed as `aria-current="page"`.
- Footer uses the obsidian surface with champagne links (`14.67:1`); keyboard focus on a footer link produced a 2px champagne outline.
- No horizontal overflow at 360px, 390px, 768px, 1280px, or 1440px, including the open mobile menu.
- `npm run lint` â†’ exit 0. `npm run typecheck` â†’ exit 0. `npm run check:contrast` â†’ exit 0. `npm run build` â†’ exit 0.
- No products, prices, suppliers, reviews, database, payments, secrets, or deployment were added.

**Known scope boundary:** Collection, search, cart, and policy destinations are linked but not implemented; they belong to T008, T011, T017, and T029. The production build initially failed because a dynamic copyright year used `new Date()` during prerender under Cache Components; it was replaced with a static copyright line rather than forcing dynamic rendering.

### T006 â€” Implement homepage
**Status:** DONE  
**Completed:** 4 November 2026. Homepage hero, category navigation, product showcases, and honest empty states implemented and verified. No products, discounts, reviews, or delivery promises were invented.

- [x] Add hero content and Shop Now action.
- [x] Add category navigation.
- [x] Add New Arrivals.
- [x] Add Best Sellers.
- [x] Add Special Offers.
- [x] Add appropriate empty states.

**Acceptance criteria:** Homepage sections use configured data and do not invent products or discounts.

**Verification evidence (4 November 2026):**
- `app/page.tsx` composes the homepage inside the existing shared layout and adds accurate homepage metadata.
- `components/home/HomeHero.tsx` provides the dark hero, serif `h1`, supporting copy, a gold **Shop Now** link to `/collections`, and a **Search jewellery** link to `/search`.
- The hero contains a decorative campaign panel with the visible caption "Campaign imagery placeholder â€” awaiting owner-approved artwork." No unapproved image was used.
- `components/home/CategoryNavigation.tsx` renders all eight approved collections from `lib/site-navigation.ts`, linked to their planned collection routes.
- `components/home/HomeShowcase.tsx` provides a reusable section with clearly labelled **Placeholder** panels for New Arrivals, Best Sellers, Special Offers, and Featured Jewellery.
- Product sections use honest empty states because no configured product data exists. No product names, prices, stock counts, ratings, reviews, or sales rankings were fabricated.
- Special Offers states "No current offers" because no genuine configured discounts exist.
- WhatsApp contact was not added because no store number has been configured.
- Browser verification at 390px: one `h1`; section headings are Shop by category, New Arrivals, Best Sellers, Special Offers, and Featured Jewellery; all 8 category links resolve to the approved collection paths; 4 labelled placeholder sections are present.
- Browser verification at 1280px: desktop navigation visible, category grid uses 4 columns, and `h1` renders at 60px in the serif stack.
- Responsive checks at 360px, 390px, 768px, 1024px, 1280px, and 1440px: no horizontal overflow, including the open mobile menu. Category columns progress from 1 to 2 to 4 as the viewport grows.
- Keyboard verification from a fresh desktop load: the skip link is the first tab stop; Shop Now is the eighth tab stop with a visible 2px champagne outline (`14.67:1`) on the dark hero. The Search jewellery link also settles on the champagne ring.
- Mobile menu preserved: 13 links, `aria-expanded` switches correctly, and Escape closes the panel and returns focus to the toggle.
- Landmarks preserved: exactly one `<header>`, one `<main>`, and one `<footer>`.
- Automated page-text checks found no PKR/Rs price values, stock counts, star ratings, or delivery promises.
- `npm run lint` â†’ exit 0. `npm run typecheck` â†’ exit 0. `npm run check:contrast` â†’ exit 0 (all 12 checks). `npm run build` â†’ exit 0 with static `/` and `/_not-found`.
- Screenshots captured at 390px and 1280px for review; the temporary files are outside the repository.

**Known scope boundary:** Collection, search, cart, and policy destinations are linked but belong to T008, T011, T017, and T029. Homepage product areas remain empty states until approved supplier-backed product data exists. The hero campaign panel remains a labelled placeholder until the owner approves artwork, and WhatsApp access remains omitted until a store number is configured.

### T006A â€” Update homepage background to Bright Gold Geometric Grid
**Status:** DONE  
**Implemented:** 6 November 2026. The homepage-only Bright Gold Geometric Grid is implemented, browser-verified, and included in a passing repository-wide typecheck and production build.

- [x] Inspect the existing homepage and route-aware background implementation.
- [x] Add the homepage-only Bright Gold Geometric Grid without changing other routes.
- [x] Preserve the logo, hero artwork, hero content, header/navigation, section order, cards, footer, typography, and theme behaviour.
- [x] Verify dark and light themes, responsive widths, accessibility layering, and no horizontal overflow.
- [x] Obtain a clean repository-wide typecheck/build. The pre-existing `/privacy` and `/returns` `lastUpdated` errors were resolved outside this task.

**Acceptance criteria:** The homepage alone uses a bright champagne-gold geometric grid on a deep premium black base; every other route retains its existing background; content, logo, hero artwork, navigation, and theme persistence are unchanged; the layer is decorative, non-interactive, responsive, theme-aware, and overflow-free.

**Verification evidence (6 November 2026):**
- `components/layout/BrightGoldGrid.tsx` renders `data-background="bright-gold-geometric-grid"` with `aria-hidden="true"`.
- `components/layout/SiteBackground.tsx` selects it on `/` only; `GeometricGrid.tsx` remains the layer on all non-homepage routes.
- `app/globals.css` adds `--home-grid-*` tokens and a CSS-only grid: 1px bright champagne-gold major lines (`rgba(231,197,124,0.4)`), lower-opacity secondary lines (`rgba(194,154,69,0.15)`), restrained radial glows, and a soft readability scrim. Major cells are `56Ã—48px`, `64Ã—56px` at 768px, and `72Ã—60px` at 1024px.
- The dark theme uses a `#050505` base; the light theme uses `#FBF7EF` with deeper gold lines and does not force black.
- Browser verification at `375Ã—812`, `390Ã—844`, `768Ã—900`, `1366Ã—900`, and `1440Ã—900` in both themes: one background layer, `position: fixed`, `overflow: hidden`, `pointer-events: none`, `z-index: 0`, no animation, and no horizontal/body overflow; header, footer, hero, logo, hero artwork, CTA links, and 44Ã—44px theme toggle present; `/collections` and `/search` retained `data-background="geometric-grid"`; theme toggle persisted across reload; hero CTA navigated to `/collections`; reduced motion left the background static.
- `npm run lint` â†’ exit 0. `npm run check:contrast` â†’ exit 0 (35/35). `npm run typecheck` â†’ exit 0. `npm run build` â†’ exit 0 (20 pages). No warning or error references the homepage background files.
- `components/layout/SilkWaves.tsx` was retained at that stage but is no longer rendered; it was deleted on 14 November 2026 during the background restoration. No image, database, Prisma, product, supplier, order, payment, admin, or deployment file was changed.

**Known limitation:** none for this task. The older 404 error-shell theme flash remains pre-existing and unrelated.

### T007 â€” Verify responsive layouts
**Status:** DONE  
**Completed:** 4 November 2026. Shared header, mobile navigation, footer, homepage hero, category grid, and empty states verified at ten mobile, tablet, and desktop viewports. One card-height defect was found and fixed. No products, discounts, reviews, or delivery promises were added.

- [x] Test small mobile viewport.
- [x] Test tablet viewport.
- [x] Test desktop viewport.
- [x] Fix overflow, unreadable text, and broken layouts.

**Acceptance criteria:** Core pages remain usable at the tested sizes.

**Verification evidence (4 November 2026):**
- Tested viewports: 320Ã—568, 360Ã—800, 390Ã—844, 568Ã—320 (mobile), 768Ã—1024, 834Ã—1112, 1024Ã—768 (tablet), 1280Ã—900, 1440Ã—1000, and 1920Ã—1080 (desktop).
- No horizontal overflow at any viewport, including with the mobile menu open. Document scroll width matched the client width throughout.
- Header switches from the mobile menu toggle to desktop navigation at 768px. The toggle is 44Ã—44px and reachable as the third desktop/mobile tab stop.
- Category grid renders 1 column below 640px, 2 columns from 640px, and 4 columns from 1024px.
- Footer renders 1 column below 640px, 2 columns from 640px, and 4 columns from 1024px.
- Mobile menu opened at every mobile viewport with 13 links, all visible, `aria-expanded` set correctly, and no overflow. Enter opens the menu; Escape closes it, restores focus to the toggle, and updates the label.
- Keyboard tab order follows the visual order: skip link, header links, hero actions, category cards, empty-state links, then footer links. Every stop has a visible 2px focus ring with no clipping: obsidian on light surfaces and champagne on dark surfaces.
- Text checks found no clipped body text and no text below 12px. The only flagged clipping is the intentionally hidden `sr-only` skip link before focus, which becomes a visible 126Ã—44px control on focus.
- No overlapping interactive elements were detected at any viewport, and no element spilled outside the viewport.
- Empty-state panels stayed inside their containers at every viewport.
- **Defect found:** at 1024px and wider, the second category row rendered at `112/112/112/138px` because the grid item stretched but the card link did not, leaving the Customized Name Jewellery card 26px taller.
- **Fix:** added `h-full` to the category card link in `components/home/CategoryNavigation.tsx`. The second row now measures `138/138/138/138px` and the first row `112/112/112/112px`, with equal card bottoms in every row.
- After the fix, all responsive, keyboard, and menu checks were rerun with no regressions.
- `npm run lint` â†’ exit 0. `npm run typecheck` â†’ exit 0. `npm run check:contrast` â†’ exit 0 (all 12 checks). `npm run build` â†’ exit 0 with static `/` and `/_not-found`.
- Screenshots captured after the fix: `t007-320-top.png`, `t007-390-top.png`, `t007-390-menu.png`, `t007-768-top.png`, `t007-1024-top.png`, `t007-1440-top.png`, `t007-390-full.png`, and `t007-1440-full.png`. Temporary files are outside the repository.

**Known scope boundary:** This task verified layout only. Collection, search, cart, and policy destinations are still owned by T008, T011, T017, and T029. Some inline text links are narrower than 44px but at least 24px wide and 44px tall, meeting WCAG 2.2 AA target size; no visual change was made. The logo link measures 106Ã—25.3px and was left unchanged.

---

## Phase 3 â€” Catalogue

### T008 â€” Implement the eight collections
**Status:** DONE
**Completed:** 4 November 2026.

- [x] Women's Jewellery.
- [x] Men's Jewellery.
- [x] Bracelets.
- [x] Necklaces.
- [x] Rings.
- [x] Earrings.
- [x] Pearl Jewellery.
- [x] Customized Name Jewellery.

**Acceptance criteria:** Every collection is accessible and handles an empty catalogue correctly.

**Verification evidence (4 November 2026):**
- `lib/collections.ts` is the source of truth for the eight approved collections; `collectionLinks` in `lib/site-navigation.ts` now derives from it.
- `/collections` lists all eight collections with the correct `/collections/<slug>` hrefs, one `h1`, a breadcrumb, and no horizontal overflow at 360, 768, 1024, and 1440px.
- All eight `/collections/<slug>` routes return HTTP 200, render the expected collection name as the only `h1`, show the honest â€œNo products in this collection yetâ€ state, expose seven â€œOther collectionsâ€ links, and have no horizontal overflow.
- Unknown collection URLs return HTTP 404 with the branded not-found page. `proxy.ts` resolves this before rendering because Cache Components can otherwise emit a soft 404 after streaming starts.
- The final committed catalogue is intentionally empty; no invented products or collection content was added. Rendering with product data was verified separately for T009 and T010 using temporary fixtures that were removed before commit.
- `npm run lint`, `npm run typecheck`, `npm run check:contrast`, and `npm run build` all passed. Screenshots: `t008-collections-index.png`, `t008-collection-empty.png`, `t008-collections-mobile.png`.

### T009 â€” Implement product listing
**Status:** DONE
**Completed:** 4 November 2026.

- [x] Create reusable product cards.
- [x] Display available product images.
- [x] Display accurate names and prices.
- [x] Display availability.
- [x] Add useful empty states.

**Acceptance criteria:** Product cards render configured product data correctly.

**Verification evidence (4 November 2026):**
- Added reusable `ProductCard`, `ProductGrid`, `AvailabilityBadge`, and `ProductImageFrame` components, with product types, PKR formatting, and discount validation in `lib/catalogue.ts`.
- Verified with clearly labelled temporary fixtures that were removed before commit: a card rendered the product name, local image, `PKR 1,234`, valid original `PKR 1,500`, and â€œIn stockâ€; an invalid original price (`PKR 500` below the current price) was suppressed; a missing image showed the neutral â€œImage pendingâ€ placeholder.
- `next/image` loaded the local test image successfully, and the grid rendered 1 column on mobile, 2 at 768px, and 3 at 1024px and above with no horizontal overflow.
- A collection with no products rendered â€œNo products in this collection yetâ€ with a link back to all collections.
- No invented products ship in the final tree. Production listing data remains dependent on approved supplier-backed records in T013A/T014; live-data verification belongs to T014.
- `npm run lint`, `npm run typecheck`, `npm run check:contrast`, and `npm run build` all passed. Screenshot: `t009-collection-card.png`.

### T010 â€” Implement product details
**Status:** DONE
**Completed:** 4 November 2026.

- [x] Display product name and description.
- [x] Display product images.
- [x] Display current price.
- [x] Display original price only for valid discounts.
- [x] Display supplier-backed availability.
- [x] Handle unknown product URLs.

**Acceptance criteria:** Detail pages show correct information and handle unavailable products safely.

**Verification evidence (4 November 2026):**
- Added the `/products/[slug]` route and shared product-detail rendering with breadcrumbs, collection links, one `h1`, image gallery, current price, conditional original price, description, and availability.
- Verified with temporary fixtures that were removed before commit: the available fixture showed the name, description, `PKR 1,234`, valid original `PKR 1,500`, â€œIn stockâ€, and the supplier-verification date. The unavailable fixture showed â€œCurrently unavailableâ€, stated that the item â€œcannot be orderedâ€, suppressed its invalid original price, and displayed no purchase controls.
- No supplier identity, cost, SKU, or margin was rendered. Desktop and mobile layouts had no horizontal overflow and exactly one `h1`.
- Unknown product URLs return HTTP 404 with the branded not-found page. Under Cache Components, `notFound()` can run after streaming and produce a soft 404, so `proxy.ts` checks the slug before rendering and rewrites to `/not-found` with a 404 status and `X-Robots-Tag: noindex`. Verified `/products/not-a-product` and `/not-found` return 404.
- The final committed catalogue is intentionally empty. Live supplier-backed product data and availability remain dependent on T013A/T014.
- `npm run lint`, `npm run typecheck`, `npm run check:contrast`, and `npm run build` all passed. Screenshots: `t010-product-detail.png`, `t010-product-unavailable.png`, `t010-product-mobile.png`.

### T011 â€” Implement search, filtering, and sorting
**Status:** DONE  
**Completed:** 4 November 2026.

- [x] Search by product name.
- [x] Filter by collection.
- [x] Add price sorting where appropriate.
- [x] Add relevant supported filters.
- [x] Handle zero matching products.

**Acceptance criteria:** Controls return correct results and work on mobile.

**Verification evidence (4 November 2026):**
- Added `/search` as a server-rendered catalogue search page. `lib/catalogue-query.ts` validates untrusted URL values, filters by product name, collection, and availability, and sorts by price. `components/catalogue/SearchControls.tsx` is a native GET form, so results work without client-side JavaScript and every result set has a shareable URL. `components/catalogue/SearchExperience.tsx` renders results or honest empty states.
- Search matches product names case-insensitively and ignores surrounding or repeated whitespace. Collection filtering supports all eight approved collections, including products assigned to more than one collection. Availability filtering covers the three structured statuses: in stock, currently unavailable, and availability pending verification. Price sorting offers default order, low to high, and high to low with a deterministic name/slug tie-break.
- Verified with clearly labelled temporary fixtures that were removed before commit: `q=pearl` and `q=PEARL` returned only the pearl fixture; `collection=womens-jewellery` returned the two matching fixtures; `collection=rings` returned one; price ascending and descending orders were correct; each availability filter returned the expected subset; a combined search/collection/sort query returned the expected single result; unknown query values fell back to safe defaults; and a real form submission produced `/search?q=silver&collection=mens-jewellery&availability=all&sort=price-desc` with the correct single result.
- Zero-result searches show â€œNo products foundâ€, report â€œShowing 0 of 4 productsâ€, and name the searched term. With the production catalogue empty, `/search` shows â€œThe catalogue is emptyâ€ with the approved-data explanation while keeping the controls available. No invented products ship in the final tree.
- Accessibility and responsive checks: every control has a visible associated label; the search input is keyboard reachable with a 2px obsidian focus ring; controls use 16px input text; no horizontal overflow at 1280px or 390px; mobile controls stay inside the viewport, stack vertically, and measure at least 44px high.
- Regression smoke checks passed: `/`, `/collections`, `/collections/rings`, `/search`, and `/search?q=test` returned HTTP 200; unknown product and collection URLs still returned HTTP 404.
- `npm run lint`, `npm run typecheck`, `npm run check:contrast`, and `npm run build` all passed. Screenshots: `t011-search-desktop.png`, `t011-search-mobile.png`, `t011-search-zero.png`, `t011-search-empty.png`, `t011-search-empty-mobile.png`.

**Known scope boundary:** New-arrival and featured sorting from `spec.md` Â§14 are not implemented because the current `Product` model has no structured new-arrival or featured flags. Colour and size filters are likewise withheld until approved structured option data exists. Search, filtering, and sorting operate on the current in-memory `lib/catalogue.ts` source and will cover database-backed records once T014 replaces that data access. Pagination is not implemented; it belongs to a later listing task if the catalogue grows. Live product-data verification remains dependent on T013A/T014.

### T012 â€” Implement product image handling
**Status:** DONE
**Completed:** 5 November 2026.

- [x] Define an appropriate image storage strategy.
- [x] Add alternative text.
- [x] Optimize image delivery.
- [x] Maintain consistent image presentation.

**Acceptance criteria:** Images load appropriately and do not cause avoidable layout shifts.

**Verification evidence (5 November 2026):**
- Approved local development storage strategy implemented under `public/images/products/`. Product images are local raster files referenced as `/images/products/...`; production image storage remains deferred.
- Added `lib/product-images.ts`, which accepts only local product-image paths with `.avif`, `.jpg`, `.jpeg`, `.png`, or `.webp` extensions. External URLs, parent-directory traversal, query strings, fragments, unsupported formats, and empty/whitespace alternative text are rejected.
- `ProductImageFrame` now validates every image before rendering and falls back to the existing neutral â€œImage pendingâ€ placeholder for missing or invalid images. `ProductDetail` filters the gallery to valid images only. Product structured data includes only validated local images.
- Existing responsive `next/image` delivery is retained: fixed 4:5 frames, responsive `sizes`, and preload for the main product-detail image. No external image host or new dependency was added.
- Policy checks passed: 5 supported paths accepted, 10 unsafe/unsupported paths rejected, alternative text trimmed, and mixed image lists filtered correctly.
- A temporary, clearly labelled fixture route and 800Ã—1000 local PNG verified rendering at 1280Ã—900 and 390Ã—844. The valid image loaded with alt text â€œGold verification ringâ€ at a rendered 0.8 (4:5) ratio; an external URL and an empty-alt image both produced the â€œImage pendingâ€ placeholder. No rejected external image appeared in the DOM or structured data, the structured-data image list contained only the valid local image, there was no horizontal overflow, and no image request failed. The temporary route and fixture were removed before the final build.
- `npm run lint` â†’ exit 0. `npm run typecheck` â†’ exit 0. `npm run build` â†’ exit 0 with 18/18 pages. `npm run check:contrast` â†’ all 12 checks passed.
- No demo or real products, prices, suppliers, or orderability were added.

**Known scope boundary:** Local project storage is approved for development only. Production image storage is not decided; real supplier product images still require confirmed usage rights.

---

## Phase 4 â€” Database and Customization

### T013 â€” Configure PostgreSQL and Prisma infrastructure
**Status:** DONE
**Owner-approved scope (5 November 2026):** Option 1 â€” infrastructure-only. T013 covers PostgreSQL 18, Prisma 7, the dedicated local application role/database, environment configuration, and the migration workflow. It creates no domain tables; T013A and T014 own supplier and product data.

- [x] Verify authenticated access to the local PostgreSQL 18 installation.
- [x] Inventory existing roles and databases before creating anything; stop on an unexpected conflict.
- [x] Confirm the least-privilege application role `js_jewellers_app` and database `js_jewellers`; create them only if absent.
- [x] Install exactly `prisma@7.10.1`, `@prisma/client@7.10.1`, `@prisma/adapter-pg@7.10.1`, and a compatible `pg` driver.
- [x] Configure Prisma 7, including `prisma.config.ts`, with no domain models.
- [x] Configure the local `DATABASE_URL` through `.env.local`.
- [x] Set up and document the Prisma migration workflow.
- [x] Verify authenticated database connectivity and Prisma configuration (`validate`, `generate`, `migrate status`, and a read-only query).

**Acceptance criteria:** The dedicated application role and database authenticate over the local PostgreSQL 18 instance; the exact approved Prisma 7 packages are installed; `prisma.config.ts` loads `DATABASE_URL` from ignored `.env.local`; `prisma validate`, `prisma generate`, `prisma migrate status`, and a read-only database query succeed; the migration workflow is documented; no supplier, supplier-product, order cost-snapshot, product, or order tables are created; no credential appears in a tracked file or log.

**Verification evidence (6 November 2026):**
- PostgreSQL 18.6 service `postgresql-x64-18` is Running; `pg_isready` reports `localhost:5432 - accepting connections`.
- Authenticated `psql` login succeeded as `current_user=js_jewellers_app` in `current_database=js_jewellers` on server `18.6`. The role has `rolsuper=f`, `rolcreatedb=f`, `rolcanlogin=t`, and owns the `js_jewellers` database.
- `.env.local` exists, is ignored by `.gitignore` (`.env*`), and is not tracked. Search-string checks found no real credential in any tracked file; only `.env.example` (placeholders) and this documentation reference `DATABASE_URL`.
- Installed versions: `prisma@7.10.1`, `@prisma/client@7.10.1`, `@prisma/adapter-pg@7.10.1`, `pg@8.23.1`.
- `prisma validate` passed and `prisma generate` produced Prisma Client 7.10.1 in `generated/prisma`.
- No-DDL baseline `prisma/migrations/20261106000000_infrastructure_baseline/migration.sql` was applied with `npx prisma migrate deploy` (exit 0). `npm run prisma:status` reports `Database schema is up to date!` (exit 0).
- Post-migration inspection shows only `_prisma_migrations` in `public`; domain table count is `0`; the baseline is recorded as finished and not rolled back; a read-only `SELECT 1` succeeds.
- Migration workflow, secret handling, package versions, and the shadow-database caveat are documented in `DATABASE.md`.
- `npm run prisma:deploy` was added to `package.json`.

**Known limitation:** `npm run prisma:migrate` (`prisma migrate dev`) requires a shadow database. The `js_jewellers_app` role has `rolcreatedb=f`, so `migrate dev` will fail on its default shadow database. The verified apply path is `npm run prisma:deploy`; changing role privileges or adding a shadow database requires owner approval and was not done.

**Scope restrictions:**
- Do not create Supplier or SupplierProduct tables.
- Do not create order cost-snapshot tables.
- Do not invent supplier, settlement, delivery-cost, or order-transmission rules.
- Leave T013A blocked until its own requirements and supplier decisions are approved.
- Do not implement T014 or any other dependent task.
- Do not overwrite existing roles or databases or reset the database.

**Historical blocked evidence (5 November 2026, before the scope revision and local credentials):**
- PostgreSQL 18.6 is installed. Windows service `postgresql-x64-18` is RUNNING, and `pg_isready` reports `localhost:5432 - accepting connections`.
- `psql.exe`, `pg_isready.exe`, `createdb.exe`, and `pg_dump.exe` exist under `C:\Program Files\PostgreSQL\18\bin` but are not on `PATH`.
- `pg_hba.conf` requires `scram-sha-256` for local and loopback connections. A passwordless probe (`psql -w`) failed with `fe_sendauth: no password supplied`; no `PGPASSWORD` or `pgpass.conf` is configured.
- No authenticated SQL login had been verified, and the dedicated `js_jewellers_app` role and `js_jewellers` database had not been created.
- The original checklist named supplier, supplier-product cost, availability, and order cost-snapshot tables. That scope conflicted with T013A and the pending order/payment decisions; the owner resolved it on 5 November 2026 by approving the infrastructure-only scope above.

### T013A â€” Implement supplier and supplier-product data model
**Status:** TECHNICAL IMPLEMENTATION COMPLETE (8 November 2026); REAL-DATA ONBOARDING BLOCKED
**Blocked by:** No owner-approved supplier identity, agreement, SKU, cost, stock, or image-rights data has been supplied. The schema, onboarding, and publication safeguards are implemented without inventing records.

- [x] Define Supplier records with internal identity, contact details, agreed terms, and status.
- [x] Link each product to its actual supplier and record the supplier SKU.
- [x] Store supplier cost separately from the JS Jewellers selling price.
- [x] Calculate selling margin from verified cost and selling price.
- [x] Record supplier availability status and the last verification timestamp.
- [x] Prevent a published or orderable product from existing without a supplier link.
- [x] Create and apply additive, data-preserving migrations.
- [x] Verify supplier data cannot be read through public data access.
- [ ] Load real supplier identities, agreements, SKUs, costs, stock, and image rights (BLOCKED: owner supply required).
- [ ] Verify real supplier availability before publishing any product (BLOCKED: owner supply required).

**Acceptance criteria:** The schema supports supplier-linked products, separate supplier cost and selling price, calculated margin, and availability tracking. Migrations are applied without data loss, public queries expose no supplier-private fields, and no fake supplier data is created.

**Implementation evidence (8 November 2026):** Additive migrations `20261108000000_supplier_catalogue_orders` and `20261108010000_admin_panel` are applied; `prisma migrate status` reports the schema up to date. Publication and orderability blockers are enforced in `lib/suppliers/publication.ts`, server-side ordering re-checks them inside the order transaction, and public queries in `lib/storefront/products.ts` select only public columns. Admin-only supplier, agreement, product, cost, stock, and image-rights screens are guarded by database-backed sessions and permissions. Database inspection shows `Supplier=0`, `SupplierAgreement=0`, `Product=0`, and `ProductImage=0`; no data was invented.

**Real-data blocker evidence (8 November 2026):**
- The following approved information is still missing: supplier identities and contact details; agreed supplier terms and status; supplier-product links and SKUs; supplier costs; supplier availability status and verification method; supplier image-usage rights.
- No supplier record, agreement, product, image, cost, SKU, or stock value has been created. The database counts for those tables are zero. Creating invented supplier or product data remains prohibited by `AGENTS.md` and `spec.md`.
- The onboarding and publication workflows are ready, but a real product cannot be published or ordered until the owner supplies that evidence and an administrator records it.

### T014 â€” Implement product and collection data access
**Status:** BLOCKED (data-access implementation complete 10 November 2026; acceptance blocked by T013A real-data onboarding)
**Blocked by:** No approved supplier, product, collection, image, price, or availability records exist. The database has `Product=0` and `Supplier=0`.

- [x] Read product records from the data layer.
- [x] Read collection records.
- [x] Read supplier-linked availability without exposing supplier identity or cost.
- [x] Validate required fields.
- [x] Handle database errors appropriately.

**Acceptance criteria:** Catalogue data comes from the configured data source rather than hardcoded fake catalogue data, and public queries expose neither supplier identity nor cost.

**Implementation evidence (10 November 2026):** `lib/storefront/products.ts` reads only `PUBLISHED` products from PostgreSQL through Prisma, selects public columns only, and degrades to an empty catalogue on database failure instead of returning hardcoded or fake products. `lib/storefront/orderable.ts` resolves availability and orderability blockers from supplier verification, agreement, publication, stock, and image-rights evidence without projecting supplier identity, supplier cost, or margin to public pages. Collection data remains the approved fixed collection configuration in `lib/collections.ts`; no fake collection records were created. Static review and the publication test suite pass. **Acceptance cannot be observed against live records** because there are no products or suppliers; T013A remains blocked on owner-supplied approved data.

### T015 â€” Implement customization configuration
**Status:** NEEDS_REVIEW (technical implementation complete 9 November 2026; end-to-end acceptance verification blocked by T014)
**Blocked by:** T014 real product and supplier-confirmation data. The `Product`, `Supplier`, and `ProductCustomizationConfirmation` tables are empty, so no real product can be observed being offered as customizable.

- [x] Identify customizable products.
- [x] Confirm the assigned supplier can fulfil each approved customization.
- [x] Define approved font options.
- [x] Define approved colour options.
- [x] Validate customer-entered text.
- [x] Reject unsupported options.

**Acceptance criteria:** Only valid customization choices can be submitted, and only products confirmed by their supplier are offered as customizable.

**Implementation evidence (9 November 2026):**

- `lib/customization/config.ts` defines the owner-approved fonts (Classic, Elegant, Script, Modern, Bold, Handwriting / Calligraphy) and colours (Gold, Silver, Rose Gold, Platinum, Antique Gold), the 20-character text limit, and the approved-option filters. It resolves an effective configuration only when the product toggle is on, a confirmation exists, that confirmation belongs to the product's currently assigned supplier, and the confirmed option lists contain at least one approved value.
- `lib/admin/customization.ts` records the supplier confirmation and enables or disables customization. Enabling without a matching confirmation throws `NOT_CONFIRMED`. `lib/admin/products.ts` disables customization and deletes the now-stale confirmation when a product's assigned supplier changes.
- `lib/actions/cart.ts` parses and validates submitted customization server-side before writing the cart. `lib/orders/create.ts` re-resolves the live configuration and revalidates inside the order transaction, so stale or tampered selections cannot reach an order.
- `components/cart/AddToCartForm.tsx` renders only the supplier-approved fonts and colours for an eligible product. The product page receives the public configuration from `lib/storefront/orderable.ts`, which exposes no supplier identity or cost.
- `tests/customization.test.mjs` verifies the approved option sets, the 20-character limit, rejection of unknown, duplicate, unconfirmed, and now-disabled options, rejection of malformed stored values, and cart revalidation.
- `npm run test` â†’ 98 pass / 0 fail; `npm run typecheck`, `npm run lint`, `npm run check:contrast` (35/35), and `npm run build` pass.
- Acceptance is not observed against live records: database inspection shows `Product=0`, `Supplier=0`, and `ProductCustomizationConfirmation=0`. Creating a fake supplier, product, or confirmation remains prohibited.

**Remaining owner decision:** The optional additional-instructions field reuses the existing 1000-character free-text convention from `lib/checkout/validation.ts` customer notes. The owner has not approved a different maximum length or content policy for customization instructions; this needs confirmation before it is treated as final.

### T016 â€” Persist customization details
**Status:** NEEDS_REVIEW (technical implementation complete 9 November 2026; end-to-end acceptance verification blocked by T014)
**Blocked by:** T014 real product and order data. The `Order` and `OrderItem` tables are empty, so no real order can be created to display the stored customization.

- [x] Save name/text with the cart item.
- [x] Save selected font.
- [x] Save selected colour.
- [x] Preserve values when the cart changes.
- [x] Include customization in the stored order.

**Acceptance criteria:** The exact selected customization is visible in the resulting order.

**Implementation evidence (9 November 2026):**

- Additive migration `20261109000000_product_customization` is applied and `prisma migrate status` reports the schema up to date. It adds `Product.customizationEnabled`, `ProductCustomizationConfirmation`, `Order.productionStatus`, `OrderProductionStatusEvent`, and the immutable `OrderItem` snapshot columns `customizationText`, `customizationFont`, `customizationColour`, and `customizationInstructions`.
- `lib/cart/calculations.ts` preserves validated customization when items are merged and quantities change, and revalidates it against the live product configuration in `validateCart`. `lib/cart/server.ts` returns the stored customization on cart lines.
- The cart, checkout, and checkout-review pages display the stored selection. `lib/orders/create.ts` revalidates customization inside the order transaction and writes the exact approved labels into the order-item snapshot.
- `app/(site)/orders/[orderNumber]/page.tsx` and `app/admin/(dashboard)/orders/[id]/page.tsx` display that snapshot through `components/customization/CustomizationSummary.tsx`.
- `tests/customization.test.mjs` verifies that add/merge/quantity updates preserve customization, invalid stored customization is dropped, and cart validation rejects unapproved or now-disabled selections.
- `npm run test` â†’ 98 pass / 0 fail; `npm run typecheck`, `npm run lint`, `npm run check:contrast` (35/35), and `npm run build` pass.
- Acceptance is not observed end to end: database inspection shows `Order=0`, `OrderItem=0`, and `Product=0`. Creating a fake customer order remains prohibited.

**Additional production-status scope implemented with T016 (9 November 2026):**

- `lib/orders/production-status.ts` defines the four separate production statuses (Pending, Confirmed, In Production, Completed) and a linear transition graph: `PENDING â†’ CONFIRMED â†’ IN_PRODUCTION â†’ COMPLETED`.
- `lib/admin/orders.ts` provides `updateProductionStatus`, which is reachable only through the `orders.manage`-guarded `updateProductionStatusAction` in `lib/actions/admin.ts`. It validates the target, rejects skipped transitions, requires a note, writes `OrderProductionStatusEvent`, and writes an `AdminAuditLog` entry.
- Payment verification, order-status changes, and fulfilment never modify `Order.productionStatus`, so a verified payment cannot auto-complete production. Customer and admin order pages show the current production status and its event history.
- `tests/production-status.test.mjs` verifies the four statuses, label stability, linear transitions, the terminal completed state, the state guard, and separation from fulfilment vocabulary.
- Production status is not covered by the original T016 checklist; it is recorded here because it was implemented in the same approved batch. Live manipulation is unverified because no order exists.

---

## Phase 5 â€” Cart and Checkout

### T017 â€” Implement cart operations
**Status:** DONE
**Completed:** 10 November 2026.

- [x] Add an item.
- [x] Change quantity.
- [x] Remove an item.
- [x] Display item subtotals.
- [x] Display the order total.
- [x] Preserve product options and customization.

**Acceptance criteria:** Cart operations work and totals are consistent with server-validated prices.

**Verification evidence (10 November 2026):** `lib/actions/cart.ts`, `lib/cart/calculations.ts`, `lib/cart/server.ts`, `components/cart/AddToCartForm.tsx`, and `app/(site)/cart/page.tsx` implement add, quantity update, and remove operations. The cart cookie stores only product IDs, quantities, and validated customization; duplicate lines merge, quantities clamp to 1â€“10, and the cart is capped at 20 lines. Line subtotals and the order total are calculated from the server-side product price, never from the cookie. Customization selections survive add/update operations and are revalidated against the live supplier-confirmed configuration. `tests/cart.test.mjs` and `tests/customization.test.mjs` pass, including a tampered-cookie HTTP check on the production build: fake items were rejected and no browser-supplied price was rendered.

### T018 â€” Implement price and supplier-availability validation
**Status:** DONE
**Completed:** 10 November 2026.

- [x] Revalidate product prices on the server.
- [x] Revalidate supplier availability on the server.
- [x] Validate discount eligibility.
- [x] Reject unavailable items.
- [x] Prevent browser-submitted totals from being trusted.

**Acceptance criteria:** Manipulated client prices or invalid or unverified supplier availability cannot determine the final order total.

**Verification evidence (10 November 2026):** `lib/cart/calculations.ts` prices every line from the server `OrderableProduct` record and rejects missing, unavailable, unpriced, over-stock, or invalidly customized items. `lib/storefront/orderable.ts` and `lib/suppliers/publication.ts` require supplier verification, an approved agreement, publication evidence, and confirmed stock where applicable. `lib/orders/create.ts` re-resolves the live product data and revalidates the cart inside the order transaction, so a stale or tampered cart cannot set the order total. Discount display metadata comes only from server product records (`hasValidDiscount`); there is no coupon or customer-entered discount path, and no browser-supplied discount or total is accepted. `tests/cart.test.mjs` and `tests/publication.test.mjs` pass, and the tampered-cookie HTTP check confirmed that a forged `unitPriceMinor` and quantity did not price the cart.

**Limitation:** No live order could be created because the catalogue and payment configuration are empty; see T038/T038A.

### T018A â€” Verify supplier availability before order acceptance and forwarding
**Status:** BLOCKED
**Blocked by:** Approved supplier availability-verification method and freshness window. The schema and orderability guards exist, but no approved method, freshness threshold, or verifier workflow has been supplied.

- [ ] Use the owner-approved verification method and freshness window.
- [ ] Record availability status, who verified it, and when.
- [ ] Block checkout acceptance when an item is unavailable or unverified.
- [ ] Recheck availability during admin order review before forwarding.
- [ ] Handle supplier cancellation or discrepancy without inventing availability.
- [ ] Test unavailable and stale-verification cases.

**Acceptance criteria:** No order can be accepted or forwarded while any item's supplier availability is unverified, stale, or unavailable.

**Implementation evidence (10 November 2026):** Availability status (`IN_STOCK`, `OUT_OF_STOCK`, `VERIFICATION_PENDING`), last-verification timestamp, and verifier fields exist, and checkout/order creation are blocked when publication or stock evidence fails. Those controls are not the same as the missing owner-approved verification method and freshness window, so the task remains BLOCKED rather than DONE. No availability was verified or invented. The courier eligibility gates added under T057 are destination and courier-approval checks, not supplier-availability verification: order acceptance is refused for ineligible international destinations for courier reasons, while supplier availability remains unverified. This does not advance T018A.

### T019 â€” Implement checkout form
**Status:** DONE
**Completed:** 10 November 2026.

- [x] Customer name.
- [x] Mobile number.
- [x] Full delivery address.
- [x] Payment method.
- [x] Order summary.
- [x] Server-side validation and clear errors.

**Acceptance criteria:** Invalid or incomplete checkout submissions are rejected with useful messages.

**PENDING OWNER CONFIRMATION:** who collects payment and who pays delivery charges. Do not present either as confirmed at checkout.

**Verification evidence (10 November 2026):** `components/checkout/CheckoutForm.tsx` collects name, email, mobile number, city, address lines, postal code, optional notes, and an approved configured payment method; `app/(site)/checkout/page.tsx` renders the server-priced order summary and the published 4â€“7 day delivery estimate. `lib/checkout/validation.ts` normalises input and returns field-level errors for missing/invalid names, email, phone, address, postal code, unsupported payment methods, control characters, an unaccepted policy, and a missing/malformed idempotency key. `tests/checkout.test.mjs` passes for all valid and invalid cases. The pending owner confirmation is still displayed as an unconfirmed operational gap; checkout does not claim who collects payment or who pays delivery.

### T020 â€” Implement Cash on Delivery
**Status:** BLOCKED â€” **NOT IN THE CLIENT-APPROVED PAYMENT SCOPE (7 November 2026)**
**Blocked by:** Cash on Delivery is not part of the approved payment list. Do not implement or offer it unless the owner separately approves it and confirms its settlement workflow.

- [ ] Add COD as an available payment method only if separately approved.
- [ ] Save the selected payment method.
- [ ] Keep customer payment status separate from order status and supplier settlement.
- [ ] Show clear checkout information without claiming the settlement workflow is confirmed.
- [ ] Record the COD settlement workflow as PENDING until the owner approves it.

**Acceptance criteria:** A valid COD order can be created without falsely claiming that payment has been received or that supplier settlement is resolved.

**Superseding decision:** The client-approved methods are Bank Transfer (Islamic Bank) and Easypaisa. COD is no longer part of the approved scope.

**Status evidence (10 November 2026):** No COD option, field, or workflow was added. Only the two approved methods exist in `lib/payments/config.ts` and `lib/payments/reference.ts`. Cod must not be implemented without a new owner decision.

### T021 â€” Implement order creation
**Status:** DONE
**Completed:** 10 November 2026.

- [x] Create a unique order reference.
- [x] Save customer and delivery details.
- [x] Save item and price snapshots.
- [x] Save the assigned supplier, supplier-cost snapshot, selling-price snapshot, and calculated margin per item.
- [x] Save customization details.
- [x] Save shipping and total amounts.
- [x] Handle duplicate submissions safely.

**Acceptance criteria:** A successful submission creates one persistent, internally consistent order with traceable supplier and cost snapshots.

**Verification evidence (10 November 2026):** `lib/orders/create.ts` validates the signed checkout draft, re-reads the cart, revalidates every product and payment method, and creates the order in one transaction. `lib/orders/order-number.ts` generates a UTC date-stamped unique reference and an unguessable access token. Each `OrderItem` stores immutable product, SKU, unit-price, line-total, supplier ID/name, supplier-cost, margin, currency, and customization snapshots. Totals are computed from persisted line values, and the unique idempotency key prevents duplicate orders on repeated submission. `tests/orders.test.mjs` verifies order-number and token behaviour and the status transition rules. **Live acceptance limitation:** no order was created because the catalogue and payment configuration are empty; this remains part of the blocked T038/T038A journey.

### T022 â€” Implement order confirmation
**Status:** DONE
**Completed:** 10 November 2026.

- [x] Display order reference.
- [x] Display a safe order summary without supplier details.
- [x] Provide the next steps without claiming the supplier has confirmed or shipped the order.
- [x] Handle failed order creation.

**Acceptance criteria:** Confirmation is shown only after successful order creation and never implies unverified supplier fulfilment.

**Verification evidence (10 November 2026):** `app/(site)/orders/[orderNumber]/page.tsx` renders only after `getOrderForCustomer` validates the order number and access token. The customer projection in `lib/orders/queries.ts` excludes supplier identity, cost, margin, contacts, agreements, and internal notes. The page displays the order reference, safe line summary, customer/payment status, and honest next steps; it states that payment is verified manually and does not claim supplier confirmation, forwarding, or shipment. Invalid or failed lookups render not-found content. The payment and return forms are token-bound and server-validated.

---

## Phase 6 â€” Secure Administration

### T023 â€” Implement administrator authentication
**Status:** DONE
**Completed:** 10 November 2026.

- [x] Select a suitable authentication approach.
- [x] Securely hash passwords if password authentication is used.
- [x] Implement secure session handling.
- [x] Configure protected routes and server operations.

**Acceptance criteria:** Unauthorized visitors cannot access protected administration functions.

**Verification evidence (10 November 2026):** Authentication uses email/password with salted scrypt hashes (`lib/admin/auth-crypto.ts`, `lib/admin/auth.ts`), never plaintext or reversible storage. Sessions are opaque random tokens whose SHA-256 hashes are stored in `AdminSession`; cookies are HTTP-only, SameSite=Lax, path-scoped, and Secure in production, with expiry, revocation, and last-seen refresh (`lib/admin/session.ts`). `/admin/(dashboard)/layout.tsx` calls `requireAdminSession()`, and admin server actions call `authorizeAdminRequest`. The unauthenticated HTTP check returned no admin content and a redirect to `/admin/login?status=required`. `tests/admin-auth.test.mjs` and `tests/admin-setup.test.mjs` pass. **No administrator account exists**; the owner must create the first Super Admin through `/admin/setup`.

### T024 â€” Enforce server-side authorization
**Status:** DONE
**Completed:** 10 November 2026.

- [x] Verify permissions on protected reads.
- [x] Verify permissions on protected mutations.
- [x] Protect order and customer information.
- [x] Protect supplier identity, contacts, costs, agreements, and margins.
- [x] Test unauthorized requests.

**Acceptance criteria:** Access control does not rely solely on hidden buttons or client-side checks, and supplier data is unavailable to unauthorized users.

**Verification evidence (10 November 2026):** Every admin dashboard page calls `requireAdminPage()` with the relevant permission, and every admin mutation calls `authorizeAdminRequest()` / `authorizeSuperAdminRequest()` server-side (`lib/actions/admin.ts`, `lib/actions/admin-guard.ts`). Navigation visibility is presentation only; it does not grant access. Supplier identity, contacts, agreements, costs, notes, margins, and customer data are selected only by admin projections (`lib/orders/queries.ts`, `lib/admin/suppliers.ts`). `tests/admin-permissions.test.mjs` verifies permission matching, Super Admin boundaries, and default routing. Unauthenticated `/admin` and `/admin/orders` HTTP checks exposed no admin content or protected data.

### T025 â€” Implement product administration
**Status:** DONE
**Completed:** 10 November 2026.

- [x] Create products.
- [x] Edit products.
- [x] Manage images with confirmed usage rights.
- [x] Assign collections.
- [x] Update selling prices and genuine discounts.
- [x] Update availability from verified supplier status.
- [x] Configure customization choices only after supplier confirmation.
- [x] Ensure supplier fields are never exposed on customer-facing pages.

**Acceptance criteria:** Authorized administrators can manage products and changes persist without exposing supplier data.

**Verification evidence (10 November 2026):** `lib/admin/products.ts` and `app/admin/(dashboard)/products` implement create/edit, publication state, collection assignment, selling price, discount display, image records with rights status, availability, and supplier assignment. Publication is blocked unless supplier verification, an approved agreement, SKU, cost, image rights, content, and stock evidence are present (`lib/suppliers/publication.ts`). Customization can be enabled only with a matching supplier confirmation and is disabled when the supplier changes (`lib/admin/customization.ts`). Product writes are audited. Public product projections select no supplier fields, and the security scan found no supplier-cost or supplier-identity exposure in customer pages. No product or image was created because no approved data exists; that is T013A/T014, not a missing administration feature.

### T025A â€” Implement supplier management in admin
**Status:** DONE
**Completed:** 10 November 2026.

- [x] Create and edit supplier records.
- [x] Record supplier contact details, agreed terms, and status internally.
- [x] Restrict supplier management to authorized admins.
- [x] Keep an audit trail of supplier-record changes.
- [x] Prevent supplier data from appearing on public pages or APIs.
- [x] Do not create fake suppliers or imply an automatic integration.

**Acceptance criteria:** Authorized admins can manage real supplier records, changes persist, and unauthorized users cannot read supplier data.

**Verification evidence (10 November 2026):** `lib/admin/suppliers.ts` and `app/admin/(dashboard)/suppliers` implement supplier create/edit, contacts, status, verification, agreements, and private notes. Each create/update/agreement/note action writes an `AdminAuditLog` entry with the actor. Access is restricted by `suppliers.view` / `suppliers.manage` server-side checks. Public queries in `lib/storefront/products.ts` and the customer order projection select no supplier fields. No supplier was created (`Supplier=0`); fake records and automatic integrations are explicitly prohibited.

### T025B â€” Assign products to suppliers and record costs, prices, and margin
**Status:** DONE
**Completed:** 10 November 2026.

- [x] Assign each product to its actual supplier.
- [x] Record the supplier SKU.
- [x] Record supplier cost separately from the JS Jewellers selling price.
- [x] Calculate selling margin from verified values.
- [x] Preserve cost history or snapshots when supplier cost changes.
- [x] Prevent publishing or ordering a product without a supplier link and verified cost.
- [x] Verify supplier cost and margin remain private.

**Acceptance criteria:** Every orderable product is linked to its supplier with separate, traceable cost and selling-price values and a correctly calculated margin.

**Verification evidence (10 November 2026):** Product records require supplier ID, supplier SKU, `supplierCostMinor`, and `sellingPriceMinor`; the admin parses non-negative minor-unit values and records the margin. Publication and ordering blockers reject missing supplier links or unverified costs. Each order line stores an immutable snapshot of the supplier ID/name, supplier cost, selling price, and margin at the time of order. Product create/update actions are audited. Public projections exclude cost and margin. No product was created (`Product=0`), so live data remains blocked under T013A; the implementation and privacy behaviour are verified through code review, static checks, and the publication tests.

### T026 â€” Implement order administration
**Status:** DONE
**Completed:** 10 November 2026.

- [x] View orders.
- [x] View relevant order details and supplier assignments.
- [x] View customization details.
- [x] Confirm or cancel orders after admin review.
- [x] Update approved customer-facing statuses only with supporting evidence.
- [ ] Record customer payment verification and supplier settlement separately.

**Acceptance criteria:** Authorized staff can manage orders and unauthorized users cannot, without advancing statuses on unverified assumptions.

**Verification evidence (10 November 2026):** `app/admin/(dashboard)/orders` and `lib/admin/orders.ts` provide the order queue and detail view with customer/delivery data, line items, supplier assignments, customization, payment events, production events, returns, and internal notes. Confirm/cancel and production transitions use explicit allowed-transition tables and require an evidence note; every change writes a status event and an audit log. Customer payment submission and admin verification are separate states (`PENDING` â†’ `SUBMITTED` â†’ `VERIFIED`/`REJECTED`). Access is permission-guarded server-side. **Supplier settlement is not recorded:** no settlement field or model exists, the decision is unapproved, and T027A remains BLOCKED. No settlement is claimed or invented. This limitation is the only unchecked item and does not block order administration.

### T026A â€” Forward orders to suppliers and record evidence
**Status:** BLOCKED
**Blocked by:** No owner-approved supplier order-transmission method exists, and no structured forwarding-evidence fields exist in the schema.

- [ ] Review the order and verify supplier availability before forwarding.
- [ ] Use the owner-approved supplier order-transmission method.
- [ ] Record the forwarding method, timestamp, authorized admin, reference, and what was sent.
- [ ] Prevent duplicate forwarding of the same order.
- [ ] Advance to "Forwarded to Supplier" only after the forward is actually recorded.
- [ ] Share only the minimum customer delivery information required.
- [ ] Handle failed or disputed forwarding honestly.

**Acceptance criteria:** An order can be forwarded through the approved method with a complete audit record, and no supplier forwarding is claimed without evidence.

**Status evidence (10 November 2026):** The `FORWARDED` order state and an admin note field exist, but a free-text note is not a structured transmission record and cannot prove a supplier received anything. The schema has no forwarding method, timestamp, recipient, transmitted-content, reference, or duplicate-forward guard. No order was forwarded. The owner must approve the method and evidence fields before this task can proceed. The per-order courier fields added under T057 (`courierCode`, `courierTrackingNumber`, `courierFulfilmentStatus`) record the store's own courier booking after an order is confirmed; they are not supplier-forwarding evidence, and choosing or booking a courier never marks an order as forwarded to a supplier.

### T026B â€” Track supplier fulfilment and update customer status
**Status:** BLOCKED
**Blocked by:** No approved supplier-fulfilment evidence workflow; supplier confirmation, shipping, delivery, delay, cancellation, and discrepancy evidence are not modelled.

- [ ] Maintain supplier-fulfilment status separately from the customer-facing status.
- [ ] Record supplier confirmations, shipping evidence, delivery evidence, delays, cancellations, and discrepancies.
- [ ] Update the customer-facing status only when evidence supports the change.
- [ ] Display an order status timeline without exposing supplier details.
- [ ] Handle supplier cancellation or non-fulfilment without inventing shipment data.
- [ ] Test status transitions and evidence requirements.

**Acceptance criteria:** Supplier fulfilment is traceable, and customer-facing statuses advance only with recorded evidence.

**Status evidence (10 November 2026):** Order status and production status are separate, linear, evidence-note-gated workflows, and the customer page shows a timeline without supplier details. However, production status is not a supplier-fulfilment record, and the schema has no supplier confirmation, shipping evidence, delivery evidence, delay, or discrepancy fields. No supplier fulfilment was recorded or claimed. `lib/admin/orders.ts` and `lib/orders/production-status.ts` provide the foundation only; the owner decision and evidence model are still required. `CourierFulfilmentStatus` (added under T057) models only the store-booked courier shipment lifecycle with manual, admin-recorded transitions and no automatic `DELIVERED` state; it is not a supplier-fulfilment record, and supplier confirmations, shipping evidence, delays, and discrepancies remain unmodelled.

### T027 â€” Implement basic reports
**Status:** DONE
**Completed:** 10 November 2026.

- [x] Show order counts from real records.
- [x] Calculate sales from stored order data.
- [x] Define treatment of cancelled, returned, and refunded orders.
- [x] Handle empty data.
- [x] Avoid fabricated report values.

**Acceptance criteria:** Report totals can be traced to actual stored records and documented calculation rules.

**Verification evidence (10 November 2026):** `lib/admin/reports.ts` and `app/admin/(dashboard)/reports` calculate order counts, sales, supplier cost, margin, and refunds from stored orders and order-line snapshots for a selected date range. Cancelled orders are excluded from sales and profit; refunds are reported separately so gross sales are never presented as net revenue. Empty ranges render zero totals from real records rather than sample values. Every figure is traceable to persisted data and the documented rules in the module. The database currently has `Order=0`, so the report correctly shows an empty state; this is the intended behaviour, not fabricated data.

### T027A â€” Record supplier costs, delivery costs, and calculate actual profit
**Status:** BLOCKED
**Blocked by:** Supplier settlement, delivery-cost responsibility, and the actual-profit formula are unapproved. No settlement or delivery-cost fields exist.

- [ ] Store the supplier-cost snapshot used for each order item.
- [ ] Record the customer payment amount and status.
- [ ] Record delivery cost and who bears it.
- [ ] Record supplier settlement separately from customer payment.
- [ ] Calculate actual profit from recorded values using the owner-approved formula.
- [ ] Define how cancellations, returns, refunds, and failed payments affect profit.
- [ ] Show sales, supplier cost, delivery cost, and actual profit separately.
- [ ] Reconcile report totals to stored records.
- [ ] Never present estimated or unverified values as actual profit.

**Acceptance criteria:** Actual profit is calculated from verified recorded costs and payments, and every report value can be traced to stored records and documented rules.

**Partial implementation evidence (10 November 2026):** Order items already store an immutable supplier-cost snapshot, and reports show recorded sales, supplier cost, margin, and refunds separately. Customer payment amount/status is recorded through `PaymentEvent`. The remaining requirements â€” delivery cost and responsibility, supplier settlement, the approved actual-profit formula, and profit treatment for cancellations/returns/refunds/failed payments â€” have no approved decision or schema support. No delivery cost, settlement, or actual profit is recorded or claimed. Under T057 an approved courier charge can now be snapshotted on the order (`shippingMinor`) and shown to the customer separately, but only from owner-approved per-destination values; who bears Pakistan delivery cost (currently free store-borne shipping), supplier settlement, and the approved actual-profit formula are still undecided, so this task remains BLOCKED.

---

## Phase 7 â€” Customer Support and Policies

### T028 â€” Implement privacy-preserving order tracking
**Status:** DONE
**Completed:** 10 November 2026.

- [x] Define a safe lookup method.
- [x] Avoid relying on a guessable order number alone.
- [x] Display only the information appropriate to the customer.
- [x] Show valid customer-facing statuses without exposing supplier identity, cost, or contacts.
- [x] Do not display a supplier status until it is supported by recorded evidence.

**Acceptance criteria:** A customer cannot retrieve another customer's private order information using a guessed reference or see internal supplier data.

**Verification evidence (10 November 2026):** `app/(site)/orders/lookup/page.tsx` requires the order number plus the email used at checkout, rate limited to 8 attempts per 10 minutes per IP. `getOrderAccessTokenByLookup` compares the normalised email in constant time and returns the access token only on a match. Viewing the order additionally requires that unguessable token, compared in constant time. The customer projection excludes supplier identity, cost, margin, contacts, agreements, and internal notes. Status output uses only recorded order/payment/production states and does not claim supplier confirmation or shipment without evidence. An unknown order or wrong token produced no order data in the HTTP check. **Finding:** the streamed order shell returns HTTP 200 with not-found content rather than a hard 404; this is recorded in `docs/RELEASE_REVIEW.md`.

### T029 â€” Add privacy and return/exchange policy pages
**Status:** DONE
**Completed:** 6 November 2026; the owner approved the draft-with-pending-labels approach.

- [x] Create the required page routes (`/privacy` and `/returns`).
- [x] Add policy text using the owner-supplied draft wording; final owner approval and legal review are still outstanding, and every unapproved detail is explicitly labelled **PENDING OWNER APPROVAL**.
- [x] Include the disclosure that customer information may be shared with the relevant supplier only to the extent necessary for order fulfilment.
- [x] Clearly identify returns, exchanges, and damaged-product responsibility as PENDING until the owner approves it.
- [x] Clearly identify any content still awaiting approval, including retention, security, third-party, payment, shipping-cost, and refund details.
- [x] Link policies from the footer (`/privacy` and `/returns`); the checkout link is deferred because checkout (T019) does not exist yet.

**Acceptance criteria:** Policy pages are accessible, do not invent legal or business commitments, and do not misstate supplier or returns responsibilities.

**Verification evidence (6 November 2026):**
- Added `app/privacy/page.tsx`, `app/returns/page.tsx`, and shared `components/policies/PolicyLayout.tsx`. The existing footer policy links now resolve; `lib/site-navigation.ts` was updated only to document the new routes.
- The owner-supplied draft wording was integrated into both pages. The privacy draft publishes 10 sections: Introduction; Information We May Collect; How We Use Information; Sharing Information with Suppliers; Payment Information; Data Retention and Security; Cookies and Third-Party Services; Customer Privacy Requests; Contact; Policy Updates.
- The returns draft publishes 11 sections: Return Period; How to Request a Return; Damaged, Defective, or Incorrect Products; Change-of-Mind Returns; Faulty, Damaged, or Incorrect Orders; Refund Method; Exchanges; Jewellery Condition and Exceptions; Supplier-Fulfilled Orders; Contact; Policy Updates.
- Owner-supplied terms are published only as proposed draft terms: the 14-day return period, Bank Transfer as the preferred refund method where lawful, change-of-mind return-shipping responsibility, supplier-fulfilled order handling, and the statement that mandatory consumer rights are unaffected. Each is visibly marked as pending final approval and legal review.
- Both pages use the approved theme tokens and editorial typography. Direct loads returned HTTP 200 with exactly one `h1`, a visible `PENDING OWNER APPROVAL` notice, and no empty headings. The footer renders `Privacy Policy â†’ /privacy` and `Returns & Exchanges â†’ /returns`.
- Browser verification with Chrome DevTools Protocol covered both themes at `1440Ã—900`, `390Ã—844`, and `320Ã—700` (12 combinations). Every combination had one visible `h1`, a visible pending notice, zero horizontal overflow, correct dark/light backgrounds and theme-aware text colours, and no broken images.
- Footer navigation from the homepage reached `/privacy` and `/returns` in both themes in all four checks. The accessibility tree exposed exactly one level-1 heading per page; older route content remained only as a `display:none` cached segment with `checkVisibility: false`.
- Keyboard Tab produced a solid 2px champagne focus ring on every focused control at desktop and mobile widths. The skip link, header controls, menu button, and theme toggle were all reachable.
- Wording audit found no actual email address, phone number, WhatsApp number, WhatsApp link, `mailto:` link, `tel:` link, or bracketed placeholder rendered as a real contact. The Contact sections render only `Business email: PENDING OWNER APPROVAL` and `WhatsApp Business: PENDING OWNER APPROVAL`, each explicitly noting that no official address or number has been supplied.
- The phrase "14 days" appears only as the owner-supplied proposed return period, immediately qualified as pending approval and subject to applicable consumer law. The only "guarantee" hit is the disclaimer "does not promise a particular retention period or security guarantee". No named supplier, invented warranty, or claimed legal compliance appears.
- The only browser console 404 is the pre-existing `/cart?_rsc=...` prefetch from the shared header. It also occurs on `/` and is unrelated to T029; the cart belongs to T017 and was not implemented.
- `npm run lint` â†’ exit 0. `npm run typecheck` â†’ exit 0. `npm run check:contrast` â†’ exit 0 (35/35). `npm run build` â†’ exit 0, with `/privacy` and `/returns` prerendered as static routes (20 pages total).
- Both routes set `noIndex: true` and are intentionally excluded from the current indexable set until the owner approves final wording. Metadata uses the existing `pageMetadata` helper, so no production domain was invented.
- Protected assets were unchanged: logo SHA-256 `EE8C2CB3AA155110E01226DEDFE1FEACE973BF8C2F86341D2D3F4D34CF9ED133`; hero SHA-256 `DDB47B44AF99ED8D3024FC4FD087FB10C2B3DD7D40C6068C66CDDAE79ECC0741`.
- Screenshots: `t029-privacy-{dark,light}-{desktop,mobile,mobile-small}.png` and `t029-returns-{dark,light}-{desktop,mobile,mobile-small}.png` in the verification temp directory; full results in `t029-report.json`.

**Remaining owner decisions:** final approval of the legal wording and completion of legal review; confirmed retention periods; security arrangements; cookie, analytics, and third-party disclosures; payment-verification details; jurisdiction-specific requirements; the refund timeline; jewellery condition requirements and exclusions; shipping-cost responsibility; the supplier return workflow; the approved customer-request process; and removal of `noindex` after approval.

**Follow-up:** T029A was updated on 7 November 2026 with the client-approved business email, Pakistan 3-day/25%/75% returns, country-aware international configuration, 4â€“7 day delivery estimate, and payment-handling wording. The policy routes remain `noindex` pending formal legal review.

**Superseded content (7 November 2026):** The 14-day return period, Bank Transfer-only preferred refund method, non-clickable email placeholder, and `PENDING OWNER APPROVAL` contact evidence recorded in this section describe the position on 6 November 2026. They were replaced by the client-approved terms in T029A, T045, and T046. The historical evidence is preserved unchanged.

### T029A - Update policies with confirmed business details and client-approved terms
**Status:** DONE (technical implementation); formal legal review remains BLOCKED under T053.
**Completed:** 7 November 2026.

- [x] Publish the confirmed brand **JS Jewellers**, legal/business name **JS Jewellery**, and location **Karachi, Sindh, Pakistan** on the policy pages and footer.
- [x] Publish **mahria9315@gmail.com** as a clickable `mailto:` link and **+92 333 9422818** as an accessible `https://wa.me/923339422818` link.
- [x] Publish the client-approved Pakistan **3-day** change-of-mind window, **25% deduction**, and **75% refund**, with the PKR 10,000 â†’ PKR 2,500 â†’ PKR 7,500 worked example.
- [x] State that the deduction applies only to eligible change-of-mind returns where legally permitted, and never to defective, faulty, damaged, incorrect, or legally protected returns.
- [x] Add country-aware international terms through `lib/returns-policy.ts`; Pakistan is the only configured destination and all others show â€œreturn terms require confirmation.â€
- [x] Publish the **4â€“7 day** delivery estimate on `/shipping`, `/returns`, and product details as an estimate only.
- [x] Keep the pending-approval notice and all policy routes `noindex`.
- [x] Preserve the Black Gold Galaxy design, dark/light themes, responsive layout, and accessibility conventions.
- [ ] Complete formal legal review and final owner approval (T053).
- [ ] Confirm the refund timeline, retention periods, security arrangements, return address, and supplier return workflow (T053).
- [x] Add the checkout-stage policy and delivery disclosure when checkout (T019) is implemented (T052).
- [ ] Remove `noindex` only after approval (T053).

**Acceptance criteria:** The policies contain only confirmed business details and client-approved terms, keep statutory safeguards intact, do not invent international rules, expose the email and WhatsApp links correctly, publish the delivery estimate as an estimate, and remain honest about pending legal review.

**Verification evidence (7 November 2026):**
- `lib/site.ts` now holds the confirmed email, `mailto:` URL, WhatsApp values, and 4â€“7 day delivery constants. `PolicyContact.tsx` and `SiteFooter.tsx` render the email as a clickable link and keep the WhatsApp link accessible.
- The privacy page has 12 sections and accurately states that Bank Transfer (Islamic Bank) and Easypaisa are approved, that both remain unavailable until their server-only account values are configured, and that account details are server-only and never public. An 8 November 2026 update added the implemented checkout/payment-step wording.
- The returns page has 18 sections, publishes the 3-day / 25% / 75% terms and the worked example, and explicitly separates the deduction from defective, faulty, damaged, incorrect, and legally protected returns.
- `lib/returns-policy.ts` is the maintainable country configuration. `components/policies/CountryReturnPolicy.tsx` displays Pakistan's configured terms and â€œreturn terms require confirmationâ€ for every unconfigured destination.
- `app/shipping/page.tsx` publishes the 4â€“7 day estimate without inventing courier, tracking, charge, customs, or guaranteed-date details. The estimate also appears in the returns policy and `ProductDetail.tsx`.
- `docs/legal-policy-research.md` and `spec.md`/`plan.md` record the updated implementation state and outstanding legal checks.
- `npm run lint`, `npm run typecheck`, `npm run check:contrast`, and `npm run build` passed. `/privacy`, `/returns`, and `/shipping` returned HTTP 200. Browser, theme, responsive, keyboard, link, and payment-secret checks are recorded in the final verification report.
- Checkout-stage disclosure is now implemented in `components/checkout/PlaceOrderForm.tsx` (returns acceptance and privacy link) and in the checkout/review order summaries (delivery estimate).
- Formal legal review and final owner approval were **not** obtained and are not claimed.

**Remaining owner decisions:** formal legal review; final approval of legal wording; confirmed retention periods; security arrangements; any future cookies/analytics/third-party services; payment-verification operating procedure and account values; refund timeline; return address; supplier return workflow; final jewellery condition/exclusion list; formal legal review of the implemented checkout-stage disclosure; removal of `noindex` after approval; and review before enabling any province or country outside the researched Pakistan/Sindh scope.

### T030 - Configure WhatsApp contact
**Status:** DONE
**Completed:** 6 November 2026; browser and link verification re-run 7 November 2026.

- [x] Obtain the approved business number: **+92 333 9422818** (international `923339422818`), confirmed by the owner.
- [x] Configure the public contact link to `https://wa.me/923339422818` in the shared footer and on both policy pages.
- [x] Test the link on mobile and desktop widths in both themes.
- [x] Avoid exposing an unapproved number: no other phone number is published. The confirmed business email is published separately.

**Acceptance criteria:** The link opens the intended business contact when configured.

**Verification evidence (7 November 2026):**
- Every rendered WhatsApp anchor uses exactly `https://wa.me/923339422818`, with visible number text and an accessible â€œopens WhatsApp in a new tabâ€ note.
- All WhatsApp anchors use `target="_blank"` and `rel="noopener noreferrer"`.
- `https://wa.me/923339422818` returned HTTP 200.
- Headless browser checks covered `/privacy` and `/returns` in dark and light themes at 1440Ã—900, 768Ã—1024, 390Ã—844, and 320Ã—700 (16 combinations); the link was visible and correctly configured in every combination.
- Keyboard Tab checks confirmed the link is reachable with a solid 2px focus ring.
- Scope limitation: the public link is in the shared footer (so it appears on every page, including the homepage) and in the policy contact sections. No dedicated contact page, header contact entry, or chat widget was added. The WhatsApp account ownership beyond the owner-confirmed number was not independently verifiable.

### T031 â€” Implement reviews if approved for MVP
**Status:** BLOCKED
**Blocked by:** The owner has not confirmed whether reviews are in the MVP or approved a moderation workflow.

- [ ] Define the review submission model.
- [ ] Add moderation or approval status.
- [ ] Prevent fabricated review content.
- [ ] Display only approved genuine reviews.

**Acceptance criteria:** Reviews shown publicly are genuine submitted content and are handled according to the approved workflow.

**Status evidence (10 November 2026):** No review model, submission form, moderation queue, or public review display exists. No review content was invented. This task must not start until the owner approves reviews and their moderation rules.

---

## Phase 8 â€” SEO and Integrations

### T032 â€” Implement page metadata
**Status:** DONE
**Completed:** 4 November 2026.

- [x] Add page titles.
- [x] Add descriptions.
- [x] Configure canonical URLs where appropriate.
- [x] Add social-sharing metadata.

**Acceptance criteria:** Main pages have appropriate, non-duplicated metadata.

**Verification:** `lib/site.ts` provides the shared brand, default description, configurable base URL, and per-page title/description/canonical/Open Graph/Twitter helpers. `app/layout.tsx` sets `metadataBase` and a `%s | JS Jewellers` title template. Home, collections, collection detail, search, and product routes use unique titles and descriptions; search is `noindex, follow`. Collection summaries were aligned to the official JS Jewellers name. A production build was inspected: titles, descriptions, canonicals, Open Graph, and Twitter tags were present and non-duplicated. **Remaining production configuration:** `NEXT_PUBLIC_SITE_URL` must be set to the owner-approved domain when it is finalized (T042); no domain was invented. The local fallback is `http://localhost:3000`.

### T033 â€” Implement sitemap and robots rules
**Status:** DONE
**Completed:** 4 November 2026.

- [x] Generate a sitemap.
- [x] Verify public page inclusion.
- [x] Exclude private admin pages and sensitive endpoints.
- [x] Verify robots behaviour.

**Acceptance criteria:** Sitemap and robots responses match the approved indexation strategy.

**Verification:** `app/sitemap.ts` emits `/`, `/collections`, the eight collection routes, and any real product routes. `app/robots.ts` allows public pages and disallows `/admin`, `/api`, `/account`, `/cart`, `/checkout`, `/orders`, `/search`, and `/not-found`, and publishes the sitemap URL. Production-build responses were checked: the sitemap contained the ten expected public URLs and zero product URLs because the production catalogue is empty; `robots.txt` contained the expected rules; search metadata was `noindex, follow`; and an unknown product URL returned HTTP 404. A build using the reserved `example.test` base URL produced that host without code changes, confirming the base URL is configurable. **Remaining production configuration:** set `NEXT_PUBLIC_SITE_URL` to the approved domain before deployment.

### T034 â€” Implement accurate structured data
**Status:** DONE
**Completed:** 4 November 2026.

- [x] Add appropriate product structured data.
- [x] Use real prices and availability.
- [x] Avoid invented ratings or reviews.
- [x] Validate generated output.

**Acceptance criteria:** Structured data reflects actual configured product information.

**Verification:** `lib/structured-data.ts` builds schema.org `Product` JSON-LD only from a configured `Product` record: name, description, URL, brand, optional absolute image URLs, and an `Offer` with the configured PKR price. `in_stock` maps to `InStock`, `out_of_stock` maps to `OutOfStock`, and `verification_pending` emits no `Offer` so availability is not claimed. No `aggregateRating` or `review` data is emitted. Temporary, clearly labelled local fixtures were used in a production build to validate the output: the in-stock record produced price `1250.00` PKR and `InStock`, and the pending record produced no `Offer`; neither produced ratings or reviews. The fixtures were removed afterwards. The final build has no product URLs because the production catalogue is intentionally empty; structured data will appear automatically when approved product records are added by T014.

### T035 â€” Document marketing integrations
**Status:** DONE  
**Completed:** 4 November 2026.

- [x] Record Meta Pixel requirements.
- [x] Record Google Analytics requirements.
- [x] Record Instagram integration needs.
- [x] Identify required credentials and consent behaviour.
- [x] Integrate only approved, configured services.

**Acceptance criteria:** Integrations are labelled accurately as working, pending, or blocked.

**Verification evidence (4 November 2026):**
- Added `MARKETING_INTEGRATIONS.md`, covering Meta Pixel, Meta advertising, Google Analytics 4, Instagram, and search-engine tools, with inputs from `spec.md` Â§15â€“Â§16, `AGENTS.md` Â§6/Â§9/Â§11, and `plan.md` Â§5.1.
- Every integration is labelled **BLOCKED** or **PENDING**; none is labelled WORKING. Meta Pixel, Meta advertising, GA4, and Instagram are BLOCKED on owner-provided credentials, an approved consent mechanism, and approved privacy wording. Search-engine tools are PENDING the approved domain and hosting.
- Recorded the required identifiers and credentials without values, including ownership, secure-storage expectations, and the rule that credentials are never committed or pasted into chat. No credential was created or configured.
- Documented consent behaviour: no non-essential tracking before consent, no pre-ticked or asymmetric choices, withdrawal support, data minimisation, no personal data in analytics, and no unsupported legal-compliance claim. The privacy-policy wording remains PENDING.
- Documented an activation gate that requires owner approval, secure credentials, approved consent and privacy wording, review, and recorded testing before any integration can be marked WORKING.
- No tracking script, tag manager, SDK, cookie, paid service, environment variable, network call, or dependency was added. No service was integrated, so the â€œintegrate only approved, configured servicesâ€ requirement is satisfied by not integrating any unapproved service.

### T036 â€” Evaluate payment-provider integrations
**Status:** DONE  
**Completed:** 4 November 2026.

- [x] Document the COD settlement workflow as PENDING until the owner confirms who collects payment and who pays the supplier.
- [x] Verify Easypaisa merchant/API requirements.
- [x] Verify JazzCash merchant/API requirements.
- [x] Define bank-transfer verification.
- [x] Document customer-payment and supplier-settlement responsibilities separately.
- [x] Document provider access and approval dependencies.
- [x] Test real integrations only when authorized and credentials are available.

**Acceptance criteria:** No payment provider or settlement workflow is described as working without a tested implementation and owner-approved terms.

**Verification evidence (4 November 2026):**
- Added `PAYMENT_INTEGRATIONS.md`, covering COD, bank transfer, Easypaisa, JazzCash, and the separation of customer payment from supplier settlement.
- Every method is labelled **PENDING**, **BLOCKED**, or **OUT OF SCOPE**; none is labelled WORKING. COD is PENDING because who collects payment, who pays the supplier, delivery-cost responsibility, evidence, and reconciliation are unconfirmed. Bank transfer is BLOCKED on approved bank details and a verification workflow. Easypaisa and JazzCash are BLOCKED on merchant eligibility, access, and provider approval. Card payments remain out of scope, and card details must never be stored.
- COD documentation records the decision points and three illustrative settlement models, explicitly marked as not approved or selected. It does not choose a model on the ownerâ€™s behalf.
- Public provider research was performed on 4 November 2026 and recorded with sources: the official Easypaisa business site and corporate onboarding portal confirm a merchant/business offering and onboarding channel; the official JazzCash Payment Gateway page confirms an online gateway with mobile-account and voucher flows, real-time confirmation, and applicable MDR. These pages do not establish the store's eligibility, access, or approval. The official JazzCash sandbox documentation could not be retrieved, so its API details are explicitly marked unverified.
- Bank-transfer verification is documented as manual: approved bank details, customer proof, verification by an authorised administrator against the actual bank record, recorded verifier/time/reference, and no automatic Paid status. No bank details were added.
- Customer payment and supplier settlement are documented as separate records with separate statuses, evidence, and permissions. Paying a supplier is explicitly not evidence of customer payment, and neither proves fulfilment.
- Documented provider access dependencies, security constraints (server-side totals, callback verification, idempotency, no card data, no secrets in source), the testing policy, and an activation gate.
- No payment package, checkout route, order model, webhook, credential, account, or environment variable was added. No real or simulated payment was made; the â€œtest only when authorizedâ€ requirement is satisfied by performing no provider test without authorization.

**T003B scope update (4 November 2026):** The owner confirmed the then-current payment scope as Cash on Delivery plus Bank Transfer only. Easypaisa and JazzCash were deferred at that time, and `PAYMENT_INTEGRATIONS.md` recorded them as DEFERRED. The T036 evidence above records the status at the time of T036 and is preserved unchanged.

**Superseded payment scope (7 November 2026):** The client approved **Bank Transfer (Islamic Bank)** and **Easypaisa** as the payment methods. Cash on Delivery is no longer part of the approved scope. `PAYMENT_INTEGRATIONS.md`, `spec.md`, `plan.md`, and `AGENTS.md` now reflect the approved list; T049 and T050 remain BLOCKED on the secure supply of account details and on checkout.

---

## Phase 9 â€” Quality Assurance

### T037 â€” Run static checks
**Status:** DONE  
**Completed:** 4 November 2026.

- [x] Run linting.
- [x] Run TypeScript checks.
- [x] Run the production build.
- [x] Resolve or document failures.

**Acceptance criteria:** Relevant checks pass, or remaining failures are clearly documented.

**Verification evidence (4 November 2026):**
- `npm run lint` â€” passed with no errors or warnings.
- `npm run typecheck` â€” passed (`tsc --noEmit`, no errors).
- `npm run check:contrast` â€” passed all 12 WCAG checks: body text on white 19.91:1; secondary text on white 17.58:1; text on champagne 14.67:1; text on obsidian 19.91:1; text on charcoal 17.58:1; champagne on obsidian 14.67:1; gold on obsidian 8.20:1; gold on charcoal 7.24:1; obsidian on gold 8.20:1; obsidian focus ring on white 19.91:1; champagne focus ring on obsidian 14.67:1; gold on white 2.43:1 (correctly required to remain decorative).
- `npm run build` â€” passed with Next.js 16.4.5 (Turbopack). Compiled successfully; TypeScript finished; 16/16 static pages generated. Routes built: `/`, `/_not-found`, `/collections`, `/collections/[slug]` (partially prerendered, with eight collection paths), `/not-found`, `/products/[slug]` (partially prerendered), and `/search` (partially prerendered). Proxy middleware built successfully.
- Environment recorded: Node.js 24.21.0, npm 11.19.0. No unresolved build, lint, type, or contrast failures.
- Known limitation: a pre-existing development-time warning on `/collections/[slug]` (route `params` accessed outside `<Suspense>`) was previously observed during T011. It does not fail lint, typecheck, or the production build and is not caused by T035â€“T037, but remains an existing quality issue outside this batchâ€™s scope.

### T038 â€” Test the customer journey
**Status:** BLOCKED
**Blocked by:** No approved real or test supplier/product records exist (`Product=0`) and no payment method is configured, so the full journey cannot be executed without inventing data or performing a prohibited payment.

- [ ] Browse collections.
- [ ] Search for products.
- [ ] Open product details.
- [ ] Add/remove items from the cart.
- [ ] Change quantities.
- [ ] Customize an eligible product.
- [ ] Submit valid and invalid checkout forms.
- [ ] Place a Bank Transfer or Easypaisa test order.
- [ ] Verify order persistence and confirmation.
- [ ] Verify no supplier identity, cost, contact, or margin appears publicly.

**Acceptance criteria:** The full test journey works using test data and no real customer orders are created accidentally.

**Partial verification (10 November 2026):** Unit and static coverage now verifies collections and navigation integrity, search/filter/sort and query sanitisation, empty-catalogue states, cart add/update/remove, quantity clamping, pricing only from server records, customization persistence and revalidation, invalid checkout validation, the exactly-two approved payment methods, order-number and access-token generation, publication/orderability gates, production-status transitions, returns/refund arithmetic, admin role and navigation restrictions, report ranges and money formatting, the public supplier-data boundary, security headers, and the error/not-found pages. New suites: `storefront.test.mjs`, `structured-data.test.mjs`, `request-security.test.mjs`, `payment-methods.test.mjs`, `admin-navigation.test.mjs`, `returns-policy.test.mjs`, `admin-reports.test.mjs`, and `privacy-guards.test.mjs`. A real open-redirect defect in `safeRelativePath` (backslash and control-character bypass) was found and fixed with regression coverage. No product, customization, valid checkout, or order could be exercised end to end because the catalogue and payment configuration are empty. No test record or fake order was created; T038A likewise remains blocked. Courier eligibility and safety are covered by the new `tests/couriers.test.mjs` (30 tests; suite total 197): fail-closed international gating, charges and estimates only from approved destination values, the unchanged Pakistan fallback, jewellery-category coverage, tracking-reference and URL-template validation, courier-fulfilment transitions, permission reuse without a courier-specific permission, no Cash on Delivery, and the generalised checkout country validation. No courier, destination, charge, or shipment record was invented for testing.

### T038A â€” Test the complete dropshipping order journey
**Status:** BLOCKED
**Blocked by:** Approved real or test supplier/product data, approved forwarding and settlement decisions, and configured payment methods are all absent. Creating fake records is prohibited.

- [ ] Create approved test supplier and supplier-linked product records; do not invent production suppliers.
- [ ] Assign supplier, cost, selling price, and availability.
- [ ] Verify unavailable or stale availability is blocked.
- [ ] Place a test Bank Transfer or Easypaisa order.
- [ ] Review the order and verify availability in admin.
- [ ] Record test forwarding through the approved method without contacting a real supplier unless authorized.
- [ ] Record supplier fulfilment evidence and update the customer-facing status.
- [ ] Record customer payment, supplier cost, delivery cost, supplier settlement, and actual profit.
- [ ] Verify supplier details remain private throughout.
- [ ] Confirm no automatic integration or shipment is claimed without evidence.

**Acceptance criteria:** The complete dropshipping journey works end to end with approved test data, from supplier-product setup through order forwarding, fulfilment tracking, and traceable profit recording.

**Status evidence (10 November 2026):** The unit-level foundations exist, but no supplier/product/order journey was executed because there is no approved data, payment method, forwarding method, fulfilment evidence model, or settlement model. Publication and orderability blockers, customer-versus-admin order projections, payment-method exposure, and supplier-data privacy are now covered by unit and static tests (`publication.test.mjs`, `payment-methods.test.mjs`, `privacy-guards.test.mjs`), but none of this exercises a real supplier-product setup, order forwarding, fulfilment, or settlement because those records and decisions do not exist. No fake supplier, product, confirmation, order, or customer was created. The remaining journey is blocked by T013A, T018A, T026A, T026B, T027A, T049, and the owner's test-data authorization. Courier booking and tracking likewise cannot be exercised end to end: neither courier is approved (both restrict jewellery under their standard terms), no destination charge or estimate is approved, and no administrator account exists to record a booking. No courier record was created to force the journey.

### T039 â€” Test security and authorization
**Status:** DONE
**Completed:** 10 November 2026.

- [x] Test unauthorized admin access.
- [x] Test invalid inputs.
- [x] Test manipulated prices.
- [x] Test unavailable or unverified supplier availability.
- [x] Test private order access controls.
- [x] Test supplier data exposure through pages, APIs, errors, and logs.
- [x] Check secret handling and logs.

**Acceptance criteria:** Relevant access and validation checks pass and identified risks are documented, including any supplier-data exposure risk.

**Verification evidence (10 November 2026):**
- **Unauthorized admin access:** `/admin` and `/admin/orders` returned no admin content or protected data; the response carried an RSC redirect to `/admin/login?status=required`. Page and action guards are server-side.
- **Invalid inputs:** checkout validation and admin input parsers reject malformed, missing, control-character, unsupported-method, and unaccepted-policy values; covered by `tests/checkout.test.mjs` and related suites.
- **Manipulated prices:** a forged `js_cart` cookie with fake product IDs, a forged `unitPriceMinor`, and quantity 999 was rejected; no price or subtotal from the cookie was rendered.
- **Availability:** publication/orderability blockers require supplier verification, approval, evidence, and stock; `tests/publication.test.mjs` passes.
- **Private orders:** order number plus email lookup is rate limited and constant-time; viewing requires the unguessable access token. An unknown/wrong-token order exposed no order data.
- **Supplier exposure:** public product projections and the customer order projection exclude supplier identity, cost, margin, contacts, agreements, and notes; no supplier data appeared in checked HTTP responses. Internal supplier references are confined to admin code and the internal customization resolver.
- **Secrets and logs:** no real secret, payment value, or database value is present in source, documentation, or client bundles; `.env*` is ignored except `.env.example`; built client bundles contained none of the checked server variable names. The only new log call is the error boundary logging the error object.
- **Headers:** nosniff, frame denial, referrer policy, permissions policy, and COOP are present; admin and order routes send `private, no-store`.
- **Automated checks:** 153/153 tests pass; typecheck, lint, contrast, and the production build pass; Prisma schema and migrations are valid.

**Documented risks:** no CSP or HSTS; soft 200 redirect/not-found statuses under streaming; in-memory single-instance rate limiting; token-bearing order URLs; no MFA, monitoring, backup test, or independent penetration test. Full details and remediation items are in `docs/RELEASE_REVIEW.md` Â§2.

### T040 â€” Test responsive design and accessibility
**Status:** DONE

- [x] Check mobile layouts.
- [x] Check tablet layouts.
- [x] Check desktop layouts.
- [x] Test keyboard navigation.
- [x] Check labels and contrast.
- [x] Check image alternative text.

**Acceptance criteria:** Core pages are usable across tested sizes and basic accessibility checks are satisfied.

**Verification (4 November 2026):** Evidence recorded in `QUALITY_VERIFICATION.md` Â§2-Â§5. Tested 11 widths from 320 to 1440 px on `/`, `/collections`, `/collections/customized-name-jewellery`, and `/search`, plus axe-core at five viewports on those routes, filtered search, and the branded 404. Zero horizontal overflow and zero header overlap; navigation switches at 768 px; the mobile menu opens, closes with Escape, and restores focus. One `h1` per page, one header/main/footer, named landmarks, labelled fields, no duplicate IDs, and no unlabelled images. After fixes: 0 axe violations on all 30 page/viewport combinations, every keyboard stop shows a visible 2 px focus ring, and all visible controls are at least 24x24 px. Three verified defects were fixed: the logo accessible-name mismatch (`SiteLogo.tsx`), the skip link not moving focus (`app/layout.tsx`), and duplicate `aria-current` links (`SiteHeader.tsx`). Limitations: no real images or screen-reader testing; Chrome only; no formal WCAG conformance claim.

### T041 â€” Review performance
**Status:** DONE

- [x] Check image sizes and loading.
- [x] Review avoidable client-side JavaScript.
- [x] Measure page performance.
- [x] Record the test environment and results.

**Acceptance criteria:** Measured results and known performance limitations are documented.

**Verification (4 November 2026):** Evidence recorded in `QUALITY_VERIFICATION.md` Â§6-Â§11. Three cold runs per page and profile on the production build: mobile median LCP 504-600 ms with 4x CPU and slow-4G throttling, desktop median LCP 120-156 ms, CLS 0 everywhere, TBT approximately 0 ms, and 162-172 KB total transfer including 142 KB of shared compressed JavaScript. No third-party scripts and no images exist yet. One verified defect was fixed: `/search` produced 0.1706 CLS from a Suspense fallback swap. The route now blocks (`instant = false`), awaits `searchParams`, and renders final content directly; it is dynamic (`Æ’`) and measured CLS 0 in all runs. Limitations: localhost and synthetic throttling, Chrome only, no real images or field data, and no INP because no interactive customer flow exists.

---

## Phase 10 â€” Release Preparation

### T042 â€” Prepare deployment configuration
**Status:** BLOCKED
**Blocked by:** No approved hosting provider, production domain, production database, or deployment credentials have been supplied. Deployment prerequisites are documented in `docs/PRODUCTION_READINESS.md`.

- [ ] Select the approved hosting provider.
- [ ] Configure environment variables.
- [ ] Configure production database access.
- [ ] Verify migration and recovery procedures.
- [ ] Confirm domain requirements.

**Acceptance criteria:** Deployment prerequisites are documented without exposing secrets.

**Status evidence (10 November 2026):** The required environment-variable names, migration commands, hosting requirements, domain-dependent settings, backup/restore items, and rollback requirements are documented without secret values. No provider, domain, production database, credential, or deployment was configured. The task remains blocked because the owner has not supplied or approved those external inputs.

### T043 â€” Complete release review
**Status:** DONE
**Completed:** 10 November 2026.

- [x] Review specification acceptance criteria.
- [x] Review security and test results, including supplier-data privacy.
- [x] Confirm approved supplier list, agreements, costs, and order-transmission method.
- [x] Confirm settlement, delivery-cost, and returns decisions are approved or clearly marked PENDING.
- [x] List unfinished tasks.
- [x] List external dependencies.
- [x] Prepare owner handover notes.

**Acceptance criteria:** The owner receives an accurate readiness report covering the dropshipping workflow and unresolved supplier decisions.

**Verification evidence (10 November 2026):** `docs/RELEASE_REVIEW.md` records the implemented scope, exact test/build/migration results, read-only database state, T039 security checks and residual risks, supplier/settlement/delivery/returns decision status, release blockers, external dependencies, owner handover notes, and a gate-by-gate checklist. The review confirms that the supplier list, agreements, costs, and order-transmission method are **not** confirmed because none were supplied; settlement and actual profit remain unapproved; and returns/delivery are technically published but legally pending. Recommendation: **NO-GO** for production.

### T044 â€” Obtain production approval
**Status:** BLOCKED â€” **NO-GO**
**Blocked by:** Explicit owner production approval has not been given, and the release gates for approved catalogue/supplier data, payment values, hosting/domain/credentials, legal review, backups, and monitoring are unsatisfied.

- [ ] Present release readiness to the owner.
- [ ] Confirm the approved supplier workflow, settlement, delivery, and returns terms.
- [ ] Confirm production settings and domain.
- [ ] Obtain explicit approval before publishing.
- [ ] Record the deployment result if authorized.

**Acceptance criteria:** Production deployment is performed only after explicit approval.

**Status evidence (10 November 2026; refreshed 11 November 2026):** `docs/PRODUCTION_READINESS.md` presents the readiness position and a go/no-go checklist to the owner, refreshed under T059 with current verification numbers (210 tests, 63 build pages, 5 migrations, 4 supported courier codes) and a consolidated 13-item deployment checklist. It records that production approval, supplier workflow, settlement, delivery-cost responsibility, domain, hosting, credentials, legal review, and live data are **not** confirmed. The owner setup path is documented for the owner in `docs/OWNER_SETUP_GUIDE.md`. No production deployment was performed or authorized. T044 cannot be marked DONE until the owner explicitly approves production after the blocking gates are closed.

---

## Phase 15 â€” Client-Approved Business, Returns, Delivery, and Payment Update

### T045 - Publish the approved business email
**Status:** DONE
**Completed:** 7 November 2026.

- [x] Publish **mahria9315@gmail.com** in the shared business configuration.
- [x] Render it as a clickable `mailto:mahria9315@gmail.com` link in `PolicyContact.tsx` and `SiteFooter.tsx`.
- [x] Keep the existing WhatsApp link accessible and unchanged.
- [x] Do not invent a street address, registration number, tax number, or other business detail.

**Acceptance criteria:** The approved email is consistently displayed as a working `mailto:` link, and the WhatsApp link still works.

**Verification evidence:** The email appears on `/privacy`, `/returns`, `/shipping` (through the shared footer), and every page using the footer. All rendered email anchors use exactly `mailto:mahria9315@gmail.com`; no placeholder remains.

### T046 - Implement the approved Pakistan return and refund policy
**Status:** DONE (technical implementation); formal legal review remains under T053.
**Completed:** 7 November 2026.

- [x] Publish the **3-day from delivery** change-of-mind window for Pakistan.
- [x] Publish the **25% deduction** of the customer's paid amount and the **75% refund**.
- [x] Show the worked example: PKR 10,000 â†’ PKR 2,500 deduction â†’ PKR 7,500 refund.
- [x] Apply the deduction only to eligible change-of-mind returns where legally permitted.
- [x] State that the deduction never applies to defective, faulty, damaged, incorrect, or legally protected returns.
- [x] Keep statutory remedies separate and state that they are not reduced.
- [x] Explain the request process and customer-support contact.
- [x] Keep the page `noindex` and visibly marked pending legal review.
- [x] Display the terms at checkout before purchase when checkout (T019) exists (T052).

**Acceptance criteria:** The approved Pakistan terms are clear, the example is arithmetically correct, and the safeguards for protected returns are explicit.

**Verification evidence (7 November 2026):** `/returns` returned HTTP 200 and its rendered HTML contains the 3-calendar-day window, 25% deduction, 75% refund, and the worked PKR 10,000 â†’ 2,500 â†’ 7,500 example. It also contains section 6 (â€œWhen the 25% Deduction Does Not Applyâ€) listing defective, faulty, damaged, incorrect, and legally protected returns, and section 9 keeps statutory remedies separate. The route is `noindex` and shows the pending-review notice. Browser checks covered 1440Ã—900, 768Ã—1024, 390Ã—844, and 320Ã—700 in both themes, with no horizontal overflow, no broken images, and a visible `h1`. No country outside Pakistan is enabled; the checkout-stage disclosure was added later and is recorded below. `npm run lint`, `npm run typecheck`, `npm run check:contrast`, and `npm run build` passed; the only browser console errors were the pre-existing `/cart?_rsc=...` 404 caused by the unimplemented cart (T017).

**Checkout-stage evidence (10 November 2026):** `components/checkout/PlaceOrderForm.tsx` now requires the customer to accept the returns policy before placing an order, states the 3-day change-of-mind window and the 25% deduction where lawful, notes that protected cases are handled separately, and links to `/returns`. It also links to `/privacy` for the delivery-details disclosure. `app/(site)/checkout/page.tsx` and the review page show the order summary and the 4â€“7 day delivery estimate. The `/cart?_rsc` 404 is resolved because the cart exists.

### T047 - Implement country-aware international return and refund configuration
**Status:** DONE (framework and unconfigured fallback); no country outside Pakistan is enabled.
**Completed:** 7 November 2026.

- [x] Separate the Pakistan policy from the international position.
- [x] Add a maintainable configuration in `lib/returns-policy.ts`.
- [x] Resolve the customer's destination through the configuration.
- [x] Show Pakistan's configured terms only for Pakistan.
- [x] Show â€œreturn terms require confirmationâ€ for every unconfigured destination.
- [x] State that a 25% deduction applies internationally only where the destination's law permits it and it is disclosed before purchase.
- [x] State that the deduction never applies to defective, damaged, incorrect, or legally protected returns.
- [x] Do not claim worldwide compliance or guaranteed worldwide returns.
- [x] Do not enable a destination whose rules have not been researched and approved.

**Acceptance criteria:** Selecting Pakistan shows the configured terms; selecting any unconfigured country shows that its return terms require confirmation and does not invent a window or deduction.

**Verification evidence (7 November 2026):** The `/returns` country selector was driven in a headless production browser. The default `PK` selection showed the configured 3-day, 25%, and 75% terms. Selecting United Arab Emirates (`AE`), United States (`US`), and â€œOther country / not listedâ€ (`XX`) each replaced the terms with â€œReturn terms require confirmationâ€ and did not show a 3-day window or 25% deduction. Switching back to `PK` restored the Pakistan terms. The selector is keyboard-focusable with a visible 2px focus ring. No country outside Pakistan has a configured policy.

### T048 - Publish the approved 4â€“7 day delivery estimate
**Status:** DONE (estimate published; operational details remain pending).
**Completed:** 7 November 2026.

- [x] Add the **4â€“7 days** estimate to central configuration.
- [x] Publish it on the new `/shipping` page.
- [x] Publish it in the returns policy.
- [x] Publish it in product details where appropriate.
- [x] Present it as an estimate, not a guaranteed date.
- [x] Do not invent courier names, tracking, charges, customs arrangements, or guaranteed dates.
- [x] Keep destination serviceability configurable and do not enable a new destination.
- [x] Show the estimate at checkout when checkout (T019) exists (T052).

**Acceptance criteria:** The estimate is visible in the approved locations and never presented as a guarantee.

**Verification evidence (7 November 2026):** `/shipping` and `/returns` returned HTTP 200 and both contain the â€œ4â€“7 daysâ€ estimate; `/shipping` explicitly states it is not a guaranteed delivery date and does not publish a courier, tracking promise, charge, or customs arrangement. The `/shipping` route appears in the footer navigation. Browser checks covered 1440Ã—900, 768Ã—1024, 390Ã—844, and 320Ã—700 in both themes with no horizontal overflow or broken images. **Limitation:** the production catalogue is empty, so no live product-detail route exists to verify the product panel end to end; that panel was verified by typecheck, production build, and code review only. The checkout-stage display was added later and is recorded below.

**Checkout-stage evidence (10 November 2026):** The estimate is displayed as an estimate, not a guarantee, in the checkout order summary (`app/(site)/checkout/page.tsx`) and on the checkout review page (`app/(site)/checkout/review/page.tsx`). The text states that delivery is estimated at 4â€“7 days for Pakistan after the order is confirmed and is not a guaranteed date. No courier, tracking, charge, or customs commitment was added.

**Courier-stage evidence (10 November 2026):** T057 added optional courier-backed shipping display at checkout. The selectable country list now comes from the configured couriers, and the review page shows an indicative courier charge and estimate only when an approved destination exists, framed as an estimate rather than a guaranteed date, with a warning notice when a destination is no longer eligible. While no courier is approved, checkout is unchanged: Pakistan only, free shipping, and the published 4â€“7 day store estimate. No courier name, charge, or delivery date was invented; the authoritative charge is computed inside the order-creation transaction, not from the review-page display.

### T049 - Configure Bank Transfer (Islamic Bank) payment instructions
**Status:** BLOCKED (workflow implemented 8 November 2026; account values missing)
**Blocked by:** The exact account number and confirmed account-holder name have not been supplied. The method stays unavailable at checkout and no instructions are rendered until both `PAYMENT_BANK_ACCOUNT_NUMBER` and `PAYMENT_BANK_ACCOUNT_HOLDER` are configured.

- [x] Record Bank Transfer (Islamic Bank) as an approved method.
- [x] Add server-only configuration names and a safe status check.
- [ ] Obtain the exact account number through a secure channel; never print or commit it.
- [ ] Confirm whether an account-holder name may be displayed.
- [x] Display instructions only at the payment step after Bank Transfer is selected.
- [x] Implement and verify the manual payment-verification workflow.

**Acceptance criteria:** Instructions appear only at the payment step, come from server-only configuration, and are never exposed in public pages or client bundles.

**Implementation evidence (8 November 2026):** `lib/payments/config.ts` requires both the account number and account holder before the method counts as configured, and the approved display name is fixed to **Islamic Bank**. `lib/orders/create.ts` refuses an order whose payment method is unconfigured. Instructions are read only in server components after method selection. Manual customer submission and admin verification/rejection use the server-enforced `PENDING â†’ SUBMITTED â†’ VERIFIED/REJECTED` workflow with `PaymentEvent` and audit records. Local `.env.local` has neither bank key, so the method remains unavailable and no instruction was displayed. No value was printed or committed.

### T050 - Configure Easypaisa payment instructions
**Status:** BLOCKED (workflow implemented 8 November 2026; account values missing)
**Blocked by:** The Easypaisa number and confirmed account-holder name have not been supplied. The method stays unavailable at checkout and no instructions are rendered until both `PAYMENT_EASYPAISA_NUMBER` and `PAYMENT_EASYPAISA_ACCOUNT_HOLDER` are configured.

- [x] Record Easypaisa as an approved method.
- [x] Add server-only configuration names and a safe status check.
- [ ] Obtain the Easypaisa number through a secure channel; never print or commit it.
- [ ] Confirm whether an account-holder name may be displayed.
- [x] Display instructions only at the payment step after Easypaisa is selected.
- [x] Implement and verify the manual payment-verification workflow.

**Acceptance criteria:** Instructions appear only at the payment step, come from server-only configuration, and are never exposed in public pages or client bundles.

**Implementation evidence (8 November 2026):** `lib/payments/config.ts` requires both the Easypaisa number and account holder before the method counts as configured. The same server-only instruction and manual-verification workflow applies. Local `.env.local` has neither Easypaisa key, so the method remains unavailable. No value was printed or committed.

### T051 - Implement secure server-side payment configuration
**Status:** DONE (configuration boundary only; no payment processing).
**Completed:** 7 November 2026.

- [x] Create `lib/payments/config.ts` for server-only payment values.
- [x] Use non-public environment-variable names only.
- [x] Never use `NEXT_PUBLIC_` for private account numbers.
- [x] Add placeholder names only to `.env.example`.
- [x] Add a safe status summary that exposes booleans and variable names, never values.
- [x] Add a guard that fails if the module is imported into browser code.
- [x] Verify no private payment value appears in `.next/static`, tracked files, or public HTML.

**Acceptance criteria:** Payment configuration is server-only, no secret is committed or bundled, and no payment is claimed as processed.

**Verification evidence (7 November 2026):** `lib/payments/config.ts` is not imported by any component or page, so no payment value can reach a client bundle. A repository scan found no public-prefixed payment, bank, or Easypaisa variable references. `.env.local` contains **0** `PAYMENT_` keys, so no real account value is configured. `.next/static` contains **0** references to the payment environment-variable names, and the public HTML for `/`, `/privacy`, `/returns`, and `/shipping` contains none either. The only account-number-like pattern in those pages is the intentionally public WhatsApp number. `.env.example` contains placeholder names with empty values only. No payment has been processed, received, or verified.

### T052 - Implement the cart, checkout, order, manual-payment, and refund workflow
**Status:** DONE (technical implementation, 8 November 2026); live payments remain blocked by T049/T050 values and admin bootstrap
**Scope:** Owner-approved option A â€” full cart, checkout, order, delivery, manual payment, return, and refund workflow.

- [x] Document the dependency in `PAYMENT_INTEGRATIONS.md` and the SDD.
- [x] Prepare the server-only payment configuration boundary.
- [x] Implement cart, checkout, order-confirmation, order-lookup, and payment steps.
- [x] Show Bank Transfer/Easypaisa instructions only after method selection.
- [x] Show the 4â€“7 day estimate and the applicable return terms before order completion.
- [x] Record payment status without claiming receipt or verification.
- [x] Enforce server-side pricing, stock, shipping, country, quantity, and payment-method validation.
- [x] Prevent duplicate orders with an idempotency key and a unique database constraint.
- [x] Create orders inside a database transaction with atomic stock reservation and cost snapshots.
- [x] Implement customer payment submission and admin-only verification/rejection with audit history.
- [x] Implement return requests and server-calculated refunds (25% change-of-mind only where permitted; protected cases in full).
- [x] Test duplicate protection, invalid input, transitions, refunds, and secret non-exposure.

**Acceptance criteria:** Payment instructions and policy disclosures exist only in a real, tested checkout flow, and no fake payment functionality is created.

**Implementation evidence (8 November 2026):** Routes `/cart`, `/checkout`, `/checkout/review`, `/orders/[orderNumber]`, `/orders/lookup`, and the guarded `/admin` order/payment/return screens are built. Checkout accepts Pakistan only and displays the 4â€“7 day estimate as an estimate, not a guarantee. Orders are created in `lib/orders/create.ts` inside `db.$transaction`, re-check publication/orderability evidence, recompute every price from the database, reserve tracked stock atomically, snapshot supplier cost/margin, and use a unique `idempotencyKey`. The customer can only submit a payment reference; only an administrator can verify or reject it, and every change writes `PaymentEvent` plus `AdminAuditLog`. Refunds are calculated server-side. `npm run lint`, `npm run typecheck`, `npm run check:contrast`, `npm run build`, and 69 `node --test` tests pass. Empty-cart checkout redirects to `/cart?error=empty`; unauthenticated `/admin` redirects to `/admin/login`. The production catalogue is empty, so a complete real-customer order was not executed. No payment was received or verified.

### T053 - Complete policy review and launch readiness
**Status:** BLOCKED (technical policy preparation complete 8 November 2026; formal legal review and final approval outstanding)
**Blocked by:** Formal legal review, final owner approval, the payment account details, and the return/refund operational decisions.

- [ ] Obtain formal legal review of the privacy, returns, and shipping content.
- [ ] Obtain final owner approval of the legal wording.
- [ ] Confirm the refund timeline, retention periods, security arrangements, return address, and supplier return workflow.
- [ ] Confirm delivery charges, courier, tracking, and customs arrangements before publication.
- [x] Complete the checkout-stage policy, return, payment, and delivery disclosures.
- [ ] Remove `noindex` only after approval.
- [x] Keep international delivery/returns unconfigured and state that other countries require confirmation.
- [x] Confirm no payment account value appears in public files, logs, or reports.

**Acceptance criteria:** The site is not presented as legally approved or production-ready until every item above is actually complete and evidenced.

**Implementation evidence (8 November 2026):** Checkout requires explicit policy acceptance and records the policy version. It shows the 4â€“7 day estimate as an estimate and the 25%/75% change-of-mind terms separately from protected remedies. `/privacy`, `/returns`, and `/shipping` remain `noindex` with pending-review notices; no legal approval is claimed. Only Pakistan is enabled. Scans of 21 static JS bundles and the captured public HTML found no private payment environment key names or assignments.

**Courier evidence (10 November 2026; updated 11 November 2026):** Courier decisions are modelled with fail-closed gating and no courier credentials stored (the provider-specific integrations were later replaced by the generic owner-managed registry under T060), but the delivery-charge, courier, tracking, and customs confirmation above remains open: no courier company is even added yet, no courier account is verified, no jewellery acceptance or destination charge is approved, and customs arrangements are unconfirmed, so nothing about courier service is presented to customers as arranged.

### T054 - Implement secure one-time first administrator setup
**Status:** DONE (implemented and statically verified 9 November 2026); live first-admin account creation remains an owner/deployment action and must not be performed automatically.

- [x] Keep `/admin/login` for normal administrator sign-in.
- [x] Add a secure `/admin/setup` page accessible only while no administrator account exists.
- [x] Require email, password, password confirmation, and a server-configured one-time setup secret (`ADMIN_SETUP_SECRET`).
- [x] Validate the setup secret only on the server with constant-time comparison; never expose it to the browser, logs, source code, or client responses.
- [x] Create exactly one initial Super Admin using the existing scrypt password hashing, DB-backed server session, and permission system.
- [x] Prevent concurrent first-admin claims with a database transaction and transaction-scoped PostgreSQL advisory lock.
- [x] Permanently disable first-time setup once any administrator account exists; `/admin/setup` redirects and cannot register.
- [x] No public registration, default credentials, or automatic account creation.
- [x] Require the website ownerâ€”not the developerâ€”to create and own the first Super Admin during handover; no developer-owned account may be created or retained.
- [x] Enforce server-side that only the active Super Admin role can create or change administrator accounts, reset passwords, clear lockouts, or edit role permissions.
- [x] Reserve `users.manage` and `roles.manage` for the Super Admin role and reject attempts to grant them to another role.
- [x] Hide Super Admin-only navigation and pages from other roles while keeping server-side enforcement authoritative.
- [x] Document setup and safe secret generation in README and `.env.example`.
- [x] Preserve existing admin panel, database, permissions, and uncommitted work.

**Acceptance criteria:** The first Super Admin can be created only by the website owner through the protected first-time setup flow or the owner-run break-glass recovery script, only when no administrator exists, and only with server-side secret validation. No credentials or secrets are exposed. After setup, only the active Super Admin role can manage administrator accounts or role permissions; `users.manage` and `roles.manage` cannot be granted to another role, and the last active Super Admin cannot be disabled or demoted.

**Verification (9 November 2026):** `npm run lint`, `npx tsc --noEmit`/`npm run typecheck`, `npm run check:contrast`, and `npm run test` passed (76 tests, 0 failed, including `tests/admin-setup.test.mjs`). A production build was started and `.next` build artifacts/`BUILD_ID` were updated, but the final terminal summary could not be captured cleanly because a stale/held `.next/lock` from that build process blocked a second confirmation build; the lock/process was left untouched per instructions. HTTP smoke checks against the existing local server (`http://localhost:3000`): `/admin/login` returned `307` to `/admin/setup` because no administrator account exists, `/admin/setup` returned `200` and rendered the first-time setup form without exposing secret values, `/shipping` and `/privacy` returned `200`. No account was created, no credentials were supplied, and no commit/push/deploy/reset was performed.

**Verification (9 November 2026; ownership hardening follow-up):** `npm run lint`, `npm run typecheck`, `npm test`, `npm run check:contrast`, and `npm run build` passed (78 tests, 0 failed, including new `tests/admin-permissions.test.mjs` assertions for the fixed `SUPER_ADMIN` role key and reserved account/role permissions). The follow-up added `authorizeSuperAdminRequest`/`requireSuperAdminActor`/`requireSuperAdminPage`, switched all administrator-user and role actions/pages to Super Admin-only enforcement, blocked `users.manage`/`roles.manage` from being granted to non-Super roles, and hid those navigation items from other roles. Read-only HTTP smoke checks against the local production server on port 3107 confirmed `/admin/login` redirects to `/admin/setup` while no administrator exists, `/admin/setup` renders without a redirect, and unauthenticated `/admin/users` and `/admin/roles` redirect to `/admin/login?status=required`. No account was created, no bootstrap was run, and no commit/push/deploy/reset was performed.

**Blocked/owner action (client handover):** The website owner must perform the following, and the developer must not create an administrator account:
1. The developer configures the database and applies migrations without creating any administrator account.
2. The owner generates a long random setup secret locally.
3. The owner sets it as the server-only `ADMIN_SETUP_SECRET` in the target deployment (or supplies it through a secure handover channel), and starts/redeploys the application.
4. The owner visits `/admin/setup` while no administrator exists and creates the first Super Admin with their own name, email, and password.
5. The owner signs in at `/admin/login`, confirms `/admin/setup` is permanently disabled, and removes `ADMIN_SETUP_SECRET` if desired.
6. The owner creates any staff accounts from `/admin/users` and assigns each staff member's role; only the Super Admin can do this.
The break-glass bootstrap script remains an owner-run recovery option only and is not the normal handover path.

### T055 - Expand self-service admin controls for routine owner operations
**Status:** DONE (technical implementation and automated verification, 10 November 2026); live admin use remains an owner action because no administrator account exists.

- [x] Audit the existing admin routes, navigation, permissions, actions, models, and tests before changing anything.
- [x] Read saved business contact details, opening hours, and the Pakistan delivery estimate from the database and use them on the storefront, with the owner-confirmed `lib/site.ts` values as safe fallbacks.
- [x] Make the homepage hero eyebrow, heading, description, image, image alternative text, and both call-to-action labels/destinations editable, with safe URL and image-path validation.
- [x] Render the configured homepage showcase image and call to action instead of ignoring them.
- [x] Add notification preference storage for new orders, submitted payments, return requests, low stock, and a recipient email; clearly state that no messages are sent until an email provider is configured.
- [x] Add supplier archive and restore lifecycle actions, refusing archive while published products are linked to the supplier and confirming the action in the UI.
- [x] Keep the only approved payment methods as Bank Transfer (Islamic Bank) and Easypaisa, and keep both unavailable until their server-only account details are configured.
- [x] Add validation, confirmation prompts, empty states, and error messages for the new controls.
- [x] Add automated tests for public-setting fallbacks, hero safety, setting validation, supplier archive guards, and image-upload validation.
- [x] Preserve existing branding, themes, design, database records, and uncommitted work; use no destructive database command.

**Deferred by scope decision:** collections management and payment-evidence attachments were not added in this batch. Supplier-dependent onboarding, forwarding, fulfilment, settlement, and live payment verification remain blocked under their existing tasks because no approved supplier, product, order, payment, or customer records exist.

**Acceptance criteria:** The owner can edit the audited routine website and business settings from the existing admin panel without developer help, the storefront reflects valid saved values with safe fallbacks, private supplier/customer/payment data is not exposed, unapproved business features stay disabled, and the new logic is covered by automated checks.

**Verification (10 November 2026):** `npm test` passed with 167 tests and 0 failures, including the new `tests/admin-self-service.test.mjs`. `npm run typecheck`, `npm run lint`, `npm run check:contrast` (43/43), `npm run build` (63 pages generated), `npx prisma validate`, and `npm run prisma:status` all passed; the database schema is up to date with 4 migrations. No supplier, product, order, payment, customer, or administrator record was created, and no commit, push, deployment, reset, or destructive database command was performed. End-to-end admin use was not possible because no administrator account exists; the owner must perform the one-time `/admin/setup`.

### T056 - Add local-development product image upload to the product editor
**Status:** NEEDS_REVIEW (implemented and unit/build verified 10 November 2026; no administrator account exists for an end-to-end upload check, and production image storage is still undecided).

- [x] Accept only JPEG, PNG, WebP, or AVIF files up to 8 MB with 3-250 characters of alternative text.
- [x] Verify the leading file signature so a renamed non-image file cannot be stored.
- [x] Store accepted files under `public/images/products/uploads/` with a generated safe file name.
- [x] Create the `ProductImage` record, register the image in the media library, and write an administrator audit entry.
- [x] Add a remove action that deletes the product image record, its local uploaded file, and the matching media-library index entry.
- [x] Add upload and remove controls with confirmation, an empty state, and a clear local-development-only warning to the product editor.
- [x] Raise the server-action body limit to accommodate the 8 MB upload ceiling.
- [x] Add automated tests for MIME, size, alternative text, safe file naming, image signatures, and supported upload paths.
- [ ] Verify an upload end to end in the running admin panel with a real administrator account.
- [ ] Choose and implement production-durable image storage.

**Acceptance criteria:** An authorized administrator can upload a valid local image to a product, see it in the product editor, and remove it, while invalid files and unsafe paths are rejected. Production storage must be decided before this is treated as release-ready.

**Verification (10 November 2026):** `npm test` passed with 167 tests and 0 failures, including the new upload-validation cases. `npm run typecheck`, `npm run lint`, `npm run check:contrast` (43/43), and `npm run build` (63 pages generated) passed. No image was uploaded because no administrator account exists. Local filesystem storage is not production-durable and is recorded as an open owner decision.

### T057 - Add named-provider courier support with safe gating and tracking (superseded by T060)
**Status:** DONE as a historical technical implementation (10 November 2026); the provider-specific courier integrations and references from this task were removed on 11 November 2026 by T060, which restored a generic, provider-independent, owner-managed courier registry. The gating architecture below survives unchanged; only the provider-specific parts were removed.

- [x] Research the two selected couriers (one Pakistan domestic, one international) from official sources only, recording URLs and access dates (10 November 2026). The provider research record was later deleted with T060.
- [x] Record both couriers as configurable, independently administered records with states `NOT_CONFIGURED`, `PENDING_VERIFICATION`, `APPROVED`, `ACTIVE`, and `SUSPENDED`.
- [x] Store charges and delivery-time estimates only as approved per-destination values; a null charge or estimate is never offered, quoted, or charged.
- [x] Gate Pakistan orders on a fully approved domestic courier configuration (verified account, accepted jewellery categories, approved destination); otherwise keep the existing free-shipping, 4â€“7 day store-estimate behaviour without rejecting the order.
- [x] Gate international orders on a fully approved international courier destination plus approved jewellery categories covering every ordered item, failing closed with `DELIVERY_UNAVAILABLE` otherwise.
- [x] Compute the courier decision inside the order-creation transaction and snapshot the charge, estimate, and courier identity on the order.
- [x] Offer only eligible countries at checkout and re-validate the selected country server-side in both checkout actions.
- [x] Show an indicative, clearly non-guaranteed shipping line on the checkout review page with a warning when a destination is no longer eligible.
- [x] Keep courier tracking separate from order status and payment status, with no automatic `DELIVERED` transition.
- [x] Let an administrator record a validated tracking reference and manual courier-fulfilment transitions with audit logging.
- [x] Show courier tracking to the customer only when an approved URL template and a real reference exist.
- [x] Reuse the existing `shipping.manage` and `orders.manage` permissions; add no courier-specific permission.
- [x] Keep Cash on Delivery unavailable without separate owner approval.
- [x] Add automated tests for eligibility, fail-closed gating, charge sources, tracking validation, permissions, and payment-method limits.

**Acceptance criteria:** A courier is offered or charged only through owner-approved values; ineligible destinations fail safely; estimates are never guarantees; courier tracking never advances order or payment status automatically; and no courier approval, price, time, coverage, or credential is invented.

**Official-source verification (10 November 2026):** The two couriers' published terms were checked from their official websites (jewellery prohibited or restricted under standard terms, one tracking format published as exactly 10 digits, the other unpublished, and a published insurance pricing example). The research record with URLs, access dates, quotes, and limitations was kept in a research document that was later deleted by T060 on 11 November 2026 together with all provider-specific references. No courier account was created and no courier was contacted.

**Implementation evidence (10 November 2026):** `lib/couriers/config.ts` fixed the two supported couriers with their scopes, validated tracking references (one exact-length rule plus generic guardrails), and enforced https tracking-URL templates with a single placeholder. `lib/couriers/selection.ts` resolved each order's courier decision from courier state, account verification, jewellery acceptance, approved categories, and approved destination values; Pakistan never rejects and keeps the existing behaviour unless the domestic courier is fully approved, while international orders fail closed without a fully approved destination. `lib/orders/create.ts` applied that decision inside the creation transaction, writing `shippingMinor`, `totalMinor`, the delivery estimate, `courierCode`, and `courierName`. `lib/couriers/public.ts` listed eligible countries and provided the indicative values shown on the checkout review page. The admin shipping page configured each courier independently, and activation was server-blocked until the account was `VERIFIED`, jewellery acceptance was `ACCEPTED`, and at least one eligible destination existed. The admin order page recorded the tracking reference and fulfilment transitions with audit logging, and the customer order page showed the courier name, shipping breakdown, and tracking link only from approved values. `tests/couriers.test.mjs` added 30 tests. All provider-specific parts of this evidence (fixed codes, exact tracking-format rule, per-provider notices) were later removed by T060; the generic gating, snapshots, and admin workflows remain.

**Verification (10 November 2026):** `npm test` passed with 197 tests and 0 failures, including the new courier suite. `npm run typecheck`, `npm run lint` (after escaping one apostrophe in the new admin component), `npm run check:contrast` (43/43), `npm run build` (63 pages generated), `npm run prisma:validate`, and `npm run prisma:status` all passed. The additive migration `20261110000000_courier_integrations` was applied with the documented `npm run prisma:deploy`; it creates only new enums, tables, and nullable/defaulted order columns and seeds nothing. No courier, destination, charge, booking, shipment, or credential record was created. End-to-end admin use was not possible because no administrator account exists.

**PENDING OWNER CONFIRMATION (superseded by T060's owner actions for the generic registry):**
1. Jewellery acceptance â€” every researched courier restricted or prohibited jewellery under its standard terms, so a courier must confirm in writing that it will carry JS Jewellers' jewellery before `jewelleryAcceptance` is set to `ACCEPTED`.
2. Courier accounts â€” no account was created or contacted; `accountVerification` stays `UNVERIFIED` until the owner opens and verifies accounts, so the activation guard cannot pass.
3. Approved charges and estimates per destination â€” nothing is offered or charged until an administrator enters approved values.
4. Tracking-reference formats â€” the generic 4â€“40 character validation is a guardrail, not any courier's official rule.
5. Cash on Delivery â€” remains out of scope; a courier offering COD does not make it available here without separate approval.

### T058 - Research a national postal insured-post provider and add it as a separate potential shipping provider (superseded by T060)
**Status:** DONE as a historical technical implementation (11 November 2026); the provider-specific records, research documentation, and references from this task were removed on 11 November 2026 by T060, which made the courier registry provider-independent and owner-managed. No courier of any kind is approved, verified, or operational â€” every remaining step is an owner action recorded under T060.

- [x] Research domestic insured-post eligibility for jewellery using only the two official sources the owner specified (the operator's official FAQ and its tracked-mail services page), both accessed 10 November 2026. The research record was later deleted with T060.
- [x] Record that the official FAQ permits jewellery domestically only through inland post insured.
- [x] Record that the official FAQ permits jewellery internationally only through foreign insured parcel post, and that the operator's express-mail page prohibits precious metals and stones for that service, so no express-mail-based service is modelled.
- [x] Document insurance limits, declared-value requirements, and compensation conditions honestly: the reviewed pages publish express-mail compensation limits as context only, and publish no insured-post insurance limits â€” recorded as PENDING OWNER CONFIRMATION, never invented.
- [x] Document booking (counter service with a despatch note), tracking (the operator's official tracking site, no published reference format), foreign-parcel delivery advice, customs documentation requirements, and the absence of any published insured-post collection/business arrangement.
- [x] Record that value-payable letter/parcel services exist but do not enable COD here without separate approval.
- [x] Implement the postal provider as a separate potential provider supported by the existing architecture: two records (domestic inland insured post, international foreign insured parcel post) so domestic and international eligibility were configured separately.
- [x] Start both records at `PENDING_VERIFICATION`; do not activate merely because the FAQ mentions insured jewellery.
- [x] Keep jewellery acceptance `NOT_ACCEPTED` by default and keep every existing activation gate (verified account, recorded jewellery acceptance with evidence, eligible destination with approved charge and estimate).
- [x] Keep the previously selected providers first in courier precedence so the unapproved postal records could not change any customer-facing behaviour.
- [x] Invent no rates, delivery estimates, insurance values, coverage, or tracking formats; charges and estimates remain administrator-entered approved values only.
- [x] Add automated tests for the new codes, scopes, initial statuses, precedence, fail-closed gating, delivery-list behaviour, and generic tracking guardrails.
- [x] Require no database migration (courier codes are data rows created only through admin actions; `Order.courierCode` is a plain string column).

**Acceptance criteria:** The provider was researchable, configurable, and approvable per service without ever appearing to customers before the owner completed every approval gate; no value, limit, coverage, or format was invented; and existing courier behaviour was unchanged. These records were later removed by T060; the generic gates remain.

**Official-source verification (10â€“11 November 2026):** Recorded with URLs, access dates, quoted facts, and limitations in a research document that was later deleted by T060: jewellery only via insured-post services; express-mail compensation limits apply to the express service only and are context, not insured-post terms; despatch note and customs declaration required for foreign parcels; delivery advice available for a nominal fee; a single official tracking site; the operator never asks for online payment through its website. The operator was NOT contacted, no account was created, and no rate, insurance value, coverage claim, or reference format was invented.

**Implementation evidence (11 November 2026):** `lib/couriers/config.ts` added the two postal codes, a fixed scope map, and initial statuses where both postal rows started `PENDING_VERIFICATION`; tracking-reference validation stayed generic guardrails because no official format was published. `lib/couriers/selection.ts` resolved couriers through fixed candidate lists with every gate unchanged and fail-closed behaviour unchanged. `lib/admin/settings.ts` created the postal rows only through admin actions with the same activation guards; the admin shipping page and `CourierSettingsSection.tsx` rendered all four couriers with courier-specific jewellery notices. `tests/couriers.test.mjs` grew from 30 to 43 tests. No migration was needed; `prisma migrate status` still reported 5 migrations and up to date. All provider-specific parts of this evidence (fixed codes, scope map, initial statuses, fixed candidate lists, per-courier notices) were later removed by T060.

**Verification (11 November 2026):** `npm test` passed with 210 tests and 0 failures, including 13 new cases (scopes, initial statuses, candidate precedence, `PENDING_VERIFICATION` never serving Pakistan, approved-destination charging, category fallback, international fail-closed, delivery-list gating, tracking guardrails). `npm run typecheck`, `npm run lint`, `npm run check:contrast` (43/43), `npm run build` (63 pages), `npm run prisma:validate`, and `npm run prisma:status` all passed. Customer-facing behaviour is unchanged: Pakistan-only checkout, free shipping, the 4â€“7 day store estimate, no COD, and no international destinations.

**PENDING OWNER CONFIRMATION (superseded by T060's owner actions for the generic registry):**
1. Written confirmation that inland insured post is available for this store's jewellery, including insurance limits, declared-value requirements, and compensation conditions.
2. Written confirmation of foreign insured parcel post availability per destination, including customs documentation, destination restrictions, insurance limits, and compensation conditions.
3. The official tracking URL template and tracking-reference format (none published on the reviewed pages).
4. Business/collection arrangements and any account or bulk-customer setup (none was created; no provider was contacted).
5. Approved charges and estimates per destination â€” nothing is offered or charged until an administrator enters approved values.

### T059 - Final handover completion: owner setup guide, deployment checklist, and full re-verification
**Status:** DONE (documentation and verification, 11 November 2026); owner actions (first Super Admin creation, payment values, supplier data, courier confirmations, legal review, hosting, and deployment approval) remain recorded under their existing tasks and are not closed by this task.

- [x] Re-audit the mandatory project documents and the courier, payment, setup, admin, and policy implementations before changing anything.
- [x] Confirm the jewellery acceptance safety correction stands: jewellery acceptance is `NOT_ACCEPTED` by default for every courier, and admin notices warn against recording acceptance without the courier company's own written confirmation. (The per-provider notices checked here were later replaced by one generic notice under T060.)
- [x] Review Bank Transfer and Easypaisa configuration: both remain unavailable until owner-approved server-only account values are set; enabling is server-blocked without them; account numbers cannot be entered into CMS fields; instructions render only after a configured method is selected; COD remains absent from the payment enum.
- [x] Verify the `/admin/setup` flow: available only while no administrator exists, requires the server-only `ADMIN_SETUP_SECRET` compared in constant time, one-time creation with advisory lock, scrypt hashing, Super Admin permission boundaries, and no developer-created account.
- [x] Produce the owner-facing setup guide `docs/OWNER_SETUP_GUIDE.md` (first Super Admin creation, everyday administration map, payment and courier configuration, remaining owner actions, security rules) without exposing any secret value.
- [x] Verify admin-panel self-service coverage for products, categories, brands, media, suppliers, inventory, orders, payments, returns/refunds, customers, homepage/content/navigation/CMS, business contact and WhatsApp, shipping and courier destinations, SEO, users/roles, and audit logs; record that product variants were never in the approved specification (the approved customization flow covers per-order personalisation).
- [x] Refresh `docs/PRODUCTION_READINESS.md` with current facts (5 migrations, 210 tests, 63 build pages, 4 courier codes) and add a consolidated 13-item deployment checklist covering build requirements, env vars, PostgreSQL, migrations, image storage, domain/DNS, HTTPS, security-header and rate-limiting limitations, backup/restore, logging/monitoring, owner handover actions, and explicit approval.
- [x] Inspect privacy, shipping, and returns policies: no unsupported delivery promises, the 25% deduction is explicitly excluded for defective/damaged/incorrect/legally protected returns, and international destination rules are never presented as universally approved; the clause list for legal review is maintained in `docs/legal-policy-research.md` Â§6.
- [x] Re-run the full verification suite on the final state (11 November 2026).

**Acceptance criteria:** The owner can take over the site without developer help, every remaining owner action is documented and honest, no readiness claim is made without evidence, and no unsafe or invented value is introduced.

**Verification (11 November 2026):** `npm test` passed with 210 tests and 0 failures. `npm run typecheck`, `npm run lint`, `npm run check:contrast` (43/43), `npm run build` (63 pages), `npm run prisma:validate`, and `npm run prisma:status` (5 migrations, up to date) all passed. Live end-to-end testing of admin flows, real payment verification, courier acceptance, and real customer ordering remains blocked because no administrator account exists and no live accounts/data were supplied; those remain recorded under T054 (owner-run setup), T049/T050 (payment values), T058/T057 (courier confirmations), T013A (supplier data), and T053 (legal review). Mobile and desktop layout verification is covered by the existing T040 responsive evidence (70 browser checks across 5 viewports) and the current contrast suite; no new browser session was performed in this task. No deployment, commit, push, reset, or destructive database command occurred.

### T060 - Remove provider-specific courier integrations and restore a generic, owner-managed courier registry
**Status:** DONE (technical implementation, automated verification, and documentation scrub, 11 November 2026); no courier company is predefined, added, approved, or operational â€” courier companies, accounts, jewellery acceptance, charges, destinations, estimates, and activation are entirely owner actions through the Admin Panel from now on.

- [x] Audit every provider-coupled surface before editing: courier constants and registries, selection and eligibility rules, tracking validation, admin shipping UI, checkout and order courier logic, public order tracking UI, research and handover documentation, tests, and task descriptions.
- [x] Remove the fixed courier code registry (`SUPPORTED_COURIER_CODES`, scope/status/code maps, display names, and the `isSupportedCourierCode` guard) so no courier company is hardcoded anywhere.
- [x] Replace fixed per-provider candidate lists with deterministic iteration over the in-scope, owner-created courier rows; if several couriers are fully approved for one destination, the first by company name (then code) is used, and every gate still applies to every courier.
- [x] Keep every fail-closed gate unchanged: verified account, recorded jewellery acceptance with evidence, active verified destination, approved charge and approved estimates, category coverage per ordered item, server-blocked activation, no automatic `DELIVERED`, COD unavailable.
- [x] Remove the provider-specific tracking-format rule (one exact 10-digit requirement) and keep only the generic 4â€“40 character guardrails, because no courier's published format may be assumed.
- [x] Add generic courier creation in the Admin Panel: courier company name, delivery scope (Pakistan domestic or international), and optional contact details; the code is derived from the owner-entered name and made unique; the record starts `NOT_CONFIGURED`/`UNVERIFIED`/`NOT_ACCEPTED`.
- [x] Replace the per-provider jewellery notices with one generic written-confirmation notice.
- [x] Preserve owner-managed destinations, charges, and estimates as approved, explicit values only; invent no rate, estimate, coverage, tracking URL, or courier data.
- [x] Delete the courier research document and remove every provider reference from active documentation (README, DATABASE, owner setup guide, production readiness, task tracker) and from tests; keep the applied historical migration files untouched because editing applied migrations breaks checksums.
- [x] Keep suppliers, products, catalogue, image upload, inventory, categories, brands, payments, policies, theme, and all unrelated functionality unchanged; add no supplier, product, courier, charge, or destination record.
- [x] Re-run the full verification suite on the changed state (11 November 2026).

**Acceptance criteria:** No courier company name, code, rate, tracking format, or approval is hardcoded, assumed, or invented anywhere in active code, UI, configuration, documentation, or tests; the courier registry is fully owner-managed through the Admin Panel; existing gating, checkout behaviour, and all unrelated functionality are unchanged; and every existing verification check passes.

**Implementation evidence (11 November 2026):** `lib/couriers/config.ts` now contains only generic enums, code derivation (`deriveCourierCode`), and generic validation (https tracking templates, 4â€“40 character tracking references). `lib/couriers/selection.ts` resolves couriers by scope in a deterministic company-name order with unchanged gates and unchanged fail-closed decisions. `lib/admin/settings.ts` adds `createCourier` (name, scope, optional contact details; starts unapproved) and drops the supported-code guards; `unconfiguredCourierForAdmin` is gone because no courier exists before the owner creates it. `lib/actions/admin-content.ts` adds `createCourierAction`. `components/admin/CourierSettingsSection.tsx` uses one generic jewellery notice and generic tracking help; `app/admin/(dashboard)/settings/shipping/page.tsx` renders the owner's courier rows plus an add-courier form with an empty state. `lib/admin/orders.ts` validates tracking references with the courier's stored name. `tests/couriers.test.mjs` was rewritten with generic fixture couriers only (204 tests total in the suite). `docs/courier-research.md` was deleted; README, DATABASE.md, `docs/OWNER_SETUP_GUIDE.md` Â§6, `docs/PRODUCTION_READINESS.md`, and this tracker were scrubbed. The additive migration `20261111000000_courier_contact_details` adds the optional `Courier.contactDetails` column only and seeds nothing. The historical migration `20261110000000_courier_integrations` is untouched; provider names appear there only in immutable comments.

**Verification (11 November 2026):** `npm test` passed with 204 tests and 0 failures (the courier suite was rewritten from 43 provider-coupled tests to 37 generic-registry tests). `npm run typecheck`, `npm run lint`, `npm run check:contrast` (43/43), `npm run build` (63 pages), `npm run prisma:validate`, and `npm run prisma:status` (6 migrations, up to date) all passed. Customer-facing behaviour is unchanged: Pakistan-only checkout, free shipping, the published 4â€“7 day store estimate, no COD, and no international destinations. No courier company, destination, charge, estimate, booking, shipment, account, or credential record was created. No commit, push, deployment, reset, or destructive database command occurred.

**PENDING OWNER ACTIONS (through the Admin Panel, in this order):**
1. Add each courier company you use (name, delivery scope, optional contact details) â€” adding is configuration, never approval.
2. Verify each courier account with an evidence reference.
3. Obtain and record each courier company's own written jewellery acceptance and the approved jewellery categories.
4. Add each destination with approved charges and estimate days, verified against courier confirmation.
5. Activate a courier only after every gate passes; the server refuses activation until then.


### T061 - Complete production-readiness audit and prepare the deployment handover
**Status:** DONE (full audit, complete verification suite, one safe hosting-compatibility fix, and documentation refresh, 11 November 2026); audit only â€” no deployment, no domain, no production database, no accounts, and no credentials were created or contacted, and the overall verdict remains **NO-GO** (T044 stays BLOCKED on owner actions).

- [x] Re-read AGENTS.md, spec.md, plan.md, tasks.md, DESIGN_SYSTEM.md, DATABASE.md, `docs/PRODUCTION_READINESS.md`, and `docs/OWNER_SETUP_GUIDE.md`, and verify the current repository state instead of relying on earlier reports.
- [x] Verify the approved business rules are preserved in code: JS Jewellers brand, Pakistan market, Bank Transfer (Islamic Bank) plus Easypaisa only, COD impossible (enum, validation, and tests), generic owner-managed courier registry with fail-closed activation gates, intentionally empty supplier/product catalogue, and owner-created first Super Admin.
- [x] Audit Vercel/serverless hosting compatibility: Next.js 16.4.5 with Cache Components and partial prefetching, `proxy.ts` compiled into the Node-runtime middleware bundle (the `pg`/Prisma runtime files appear in the middleware file trace, so no Edge-runtime incompatibility), server/client component boundaries, no API route handlers, read-only-filesystem hazards, and the Git-ignored generated Prisma client.
- [x] Audit the database layer: schema validation, the 6 applied additive migrations and their history, PostgreSQL compatibility, 71 unique/index constraints across 35 models, referential integrity via cascade/restrict rules, lazy client creation, and the requirement for a separate production database, role, and tested connection.
- [x] Audit product image storage: uploads write only to `public/images/products/uploads/` with server-side MIME, magic-byte, size (8 MB), and alt-text validation, path-traversal protection, and `products.manage` authorization â€” but the storage is local-filesystem only, Git-ignored, and documented as development-only, so it is BLOCKED for production until the owner chooses and provisions durable object storage.
- [x] Audit administrator authentication and one-time setup: transaction-scoped PostgreSQL advisory lock around first-admin creation, server-only `ADMIN_SETUP_SECRET` with constant-time comparison and a hidden form when unset, scrypt hashing (N=16384, r=8, p=1) with per-hash salts, database-backed opaque session tokens with hashes only, 8-hour fixed expiry, revocation on password/role changes, DB-backed 5-attempt/15-minute lockout, per-page and per-action permission checks, Super Admin boundary rules, and the owner-run break-glass bootstrap script.
- [x] Audit payments: exactly two manual methods, fail-closed environment gating (both number and holder required before a method appears at checkout), server-only account values that never reach client bundles or logs, mandatory admin notes with audited VERIFIED/REJECTED transitions that nothing auto-verifies, server-authoritative recomputed pricing inside a transaction, signed 30-minute checkout draft cookie, database-enforced idempotency keys, and no COD anywhere.
- [x] Audit security posture: application security headers, `private, no-store` on order/admin routes, httpOnly cookies, constant-time comparisons, input validation, audit logging, `npm audit` results, and the documented gaps (no CSP/HSTS yet, in-process rate limiting, no MFA, no centralised logging).
- [x] Run the complete verification suite on the current tree, twice where a change followed.
- [x] Implement the single clearly-required safe fix for hosting compatibility: `postinstall` Prisma Client generation (a fresh clone or Vercel `npm ci` â†’ `next build` previously failed because `generated/prisma` is Git-ignored), matching the official Vercel and Prisma 7 guidance for custom-output clients.
- [x] Refresh the stale readiness documentation with the verified current numbers and record every remaining owner-action blocker.

**Acceptance criteria:** Every claimed readiness state is backed by evidence from the current tree; verification commands are run with their actual results recorded; only clearly-required, behavior-preserving local fixes are made; documentation is updated honestly without overwriting history; all remaining external dependencies are recorded as owner actions rather than assumed complete; and no deployment, account, or data-creation action is performed.

**Implementation evidence (11 November 2026):** One code change: `package.json` now runs `prisma generate` on `postinstall` (verified: `npm run postinstall` regenerated the client with exit 0), which fixes a fresh-clone/Vercel build failure identified against the Vercel Next.js 16 + Prisma guidance for Git-ignored custom-output clients (`generated/prisma` matched by `.gitignore` line 46, previously generated only by the manual `npm run prisma:generate`). `README.md` documents the new script. `docs/PRODUCTION_READINESS.md` was refreshed with the verified current state (6 migrations, 204 tests, dependency-audit row, the migration list including `20261111000000_courier_contact_details`, provider-neutral courier wording replacing the stale superseded-provider sentence, the `postinstall` step in the deployment process, and the Vercel request-body-size note on the image-storage decision). No other file changed; no business logic, theme, page, policy, schema, or test was modified.

**Verification (11 November 2026):** `npm test` passed twice (204 tests / 0 failures, before and after the postinstall change); `npm run typecheck` passed twice; `npm run lint` passed; `npm run check:contrast` passed (43/43); `npm run build` passed (63 pages, proxy compiled as Node-runtime middleware); `npm run prisma:validate` reported the schema valid; `npm run prisma:status` reported 6 migrations applied and up to date; `npm audit --omit=dev` reported 0 vulnerabilities (production dependencies clean) and the full `npm audit` reported 8 moderate advisories confined to the development-only lint toolchain (`eslint-config-next` â†’ `typescript-eslint` â†’ `minimatch`), left unfixed because the suggested `--force` remedy would change pinned dependency versions. No commit, push, deployment, reset, or destructive database command occurred.

**Audit verdict:** NOT READY TO DEPLOY. Everything controllable from the repository is implemented, tested, and verified, but production still requires owner/external actions: production PostgreSQL provisioning and migration execution, durable object storage for product images (local uploads are BLOCKED for production), payment account values via server environment variables, the first Super Admin via `/admin/setup`, approved supplier and product data, courier companies added and fully approved through the Admin Panel, formal legal review of policy wording, hosting/domain/secrets configuration, backups and monitoring at the hosting layer, and explicit written deployment approval. Known non-blocking limitations are recorded in `docs/PRODUCTION_READINESS.md` (no CSP/HSTS yet; in-process rate limiting implies a single-instance deployment or a shared store; the CMS payment `enabled`/label fields are informational and checkout availability is governed by environment configuration; the customer payment-submission action has no dedicated rate limit; and image uploads cannot work on Vercel until object storage is chosen, also because Vercel caps request bodies near 4.5 MB).


### T062 - Local end-to-end testing, bug fixing, and clean-state restoration
**Status:** DONE (full local test pass of the running production build against the agreed 15-item checklist, four confirmed defects fixed and re-verified, all test data removed and the documented empty state restored, 11â€“12 November 2026); local testing COMPLETE and passing â€” the production verdict remains **NOT READY (NO-GO)** on the unchanged external owner actions recorded in T061.

- [x] Test the running production build (`next build` + `next start`), not dev mode, with real HTTP flows, cookie jars, multipart uploads, headless Chrome via CDP with axe-core, and read-only PostgreSQL inspection.
- [x] Verify the 15 checklist items: setup-secret detection; first Super Admin setup with duplicate protection; admin login/logout/session; dashboard and navigation; supplier and product create/edit with safe isolated test data; image upload including rejection of non-images; order listing, details, and status updates including invalid-transition rejection; Bank Transfer/Easypaisa configuration without exposing values; COD impossible; generic courier creation with fail-closed activation; customer, homepage, navigation, SEO, customization, settings, and admin-role workflows; unauthorized access blocked; missing env vars producing safe errors; database connection and migration status; responsive layout and accessibility.
- [x] Fix only confirmed defects, each behavior-preserving, and re-run the affected flows plus the full gate suite after every fix.
- [x] Use isolated local test data with placeholder values only; never write payment test values to `.env.local` or print them; keep them only on terminated test-server processes.
- [x] Remove all test data and restore the documented empty state; verify the final database, filesystem, and `.env.local`.
- [x] Re-run the complete verification suite on the final build and smoke-test it read-only (no new data).
- [x] Record findings, observations, incidents, owner actions, and the verdict in `docs/LOCAL_TEST_REPORT.md`.

**Acceptance criteria:** Every checklist item is verified against the real production build with evidence; every confirmed defect is fixed with its root cause and fix evidence recorded; every fix is followed by the relevant flow re-test and the full quality gates; all local test data (database rows, uploaded files, environment values) is removed and the documented baseline state is verified; no business rule, schema, policy, theme, or scope is changed; no deployment, commit, push, or destructive command occurs; and the final report records tests passed/failed, bugs fixed, files changed, blockers, owner actions, local-testing completeness, and the production verdict.

**Bugs found and fixed (4, all uncommitted local edits â€” no Git repository is initialized):**
1. `lib/db.ts` â€” **production PrismaClient connection leak.** The client was cached on `globalThis` only when `NODE_ENV !== "production"`, so in production each fresh module instance opened a new PostgreSQL pool, exhausting `max_connections` (Prisma P2037) under traffic. Now cached in every environment; verified flat 5â€“10 connections across 15 rapid requests.
2. `lib/admin/settings.ts` â€” **courier activation deadlock.** `updateCourierStatus` evaluated destination eligibility against the courier's *stored* pre-activation status while eligibility requires ACTIVE, so no fully-approved courier could ever be activated. It now evaluates against the target status; the account-verification and jewellery-acceptance gates are still enforced explicitly beforehand and every destination gate remains fail-closed (re-verified: activation is still blocked when any gate is missing).
3. `app/admin/(dashboard)/page.tsx` â€” **axe definition-list violation (serious).** A `Link` sat as a sibling of `dt`/`dd` inside a `dl`; it is now wrapped in `dd`. Verified 0 axe violations on `/admin` after the fix.
4. `app/(site)/checkout/review/page.tsx` â€” **deterministic `Date.now()` prerender error.** With `cacheComponents` + `partialPrefetching`, the route's empty PPR shell triggered an instrumented request-time pass that evaluated the signed-draft expiry check (`verifyPayload` in `lib/security/signed-payload.ts`), logging `Route "/checkout/review": Next.js encountered the unstable value Date.now() while prerendering` on every fresh server's first authenticated review render (reproduced on two consecutive builds). The page now awaits `connection()` before reading the draft cookie (the Next.js-prescribed remedy) and builds as fully Dynamic; the identical reproduction is clean and the full order flow passes.

**Observations recorded without code changes:** the homepage axe color-contrast flag is a scroll-reveal transitional state (partial opacity at 1280Ã—800 page load; the fully-revealed state measures â‰ˆ8:1 with 0 violations, reduced-motion users get instant full opacity, and `check:contrast` passes 43/43); `/shipping` never publishes courier names by design; the no-payment-env checkout replaces the form with the warning notice by design; admin payment verification before customer submission is correctly rejected; admin routes under streaming return 200 with the redirect in the RSC payload and serve no page content; files added to `public/` after `next start` are 404 until restart; the path-based image delete does not remove disk files by design; a product with zero images is non-orderable by design; and the `Missing origin header` Server Actions warnings are benign no-JS test noise.

**Verification (11â€“12 November 2026):** All 15 checklist items PASS. After each fix: `npm test` 204/204, `npm run typecheck`, `npm run lint`, and the affected flows re-run. Final pass: `npm test` 204/204; `npm run typecheck` pass; `npm run lint` pass; `npm run check:contrast` 43/43; `npm run prisma:validate` valid; `npm run prisma:status` 6 migrations applied and up to date; `npm run build` pass (compiled 7.0s, 63/63 pages, `/checkout/review` Dynamic); read-only smoke test of the final build served every checked page correctly with a clean server log. Database restored and verified: every business table 0, `AdminRole=6`, only the migration-seeded configuration rows remain (ShippingSetting 1, ShippingZone 1, BusinessSetting 10, PaymentSetting 2, ContentPage 3, HomeSection 4, NavigationItem 8, all carrying the 8 November 2026 migration timestamps, untouched by testing). `public/` restored to its 4 baseline files; `.env.local` unchanged with no payment keys. Environment incidents (stale-server `.next` corruption, transient viewport-dependent axe flags) were recovered and documented in the report. No commit, push, deployment, reset, or destructive database command occurred.

**Files changed:** `lib/db.ts`, `lib/admin/settings.ts`, `app/admin/(dashboard)/page.tsx`, `app/(site)/checkout/review/page.tsx`, plus this tracker update and the new `docs/LOCAL_TEST_REPORT.md`. No schema, migration, policy, business-rule, theme, or test changes.

**Full report:** `docs/LOCAL_TEST_REPORT.md` (checklist table, four bug records with root cause/fix/evidence, observations, incidents, cleanup evidence, final gate results, owner actions, local-testing completeness, and the verdict).


### T063 - Implement every safe local production-readiness item and document the remaining owner actions
**Status:** DONE for the local, safe scope (12 November 2026). No deployment, commit, push, account creation, credential creation, production database access, payment processing, or destructive database operation occurred. Production remains **NOT READY (NO-GO)** on the unchanged external owner actions; T044 stays BLOCKED.

- [x] Audit the repository read-only before changing anything: AGENTS/spec/plan/tasks, design and database docs, readiness and owner guides, environment handling, storage, payments, admin permissions/sessions, suppliers, couriers, legal pages, logging, and build/hosting assumptions.
- [x] Phase 1 â€” Neon PostgreSQL readiness: added `lib/env/production.ts` and `scripts/check-production-env.mjs` (production/development reports plus `--self-test`), validated the pooled TLS `DATABASE_URL`, added optional `DATABASE_POOL_MAX`, confirmed the per-process Prisma client caching fix, and added `env:check`/`env:check:dev` scripts.
- [x] Phase 2 â€” Vercel Blob product images: installed the official `@vercel/blob` SDK, added a local/Blob/unconfigured-production storage abstraction with exact-object deletion and fail-closed production behaviour, accepted validated Blob URLs in product inputs and admin media, added Blob image remote patterns, and kept local development storage separate. Added a `zod` override because the Blob dependency chain pinned a vulnerable transitive version; `npm audit --omit=dev` is clean.
- [x] Phase 3 â€” payments: made `PAYMENT_BANK_DISPLAY_NAME` optional with the approved â€œIslamic Bankâ€ fallback, kept Bank Transfer/Easypaisa on the existing server-only variable names, validated account values structurally without logging, and kept each method unavailable until both its number and holder exist.
- [x] Phase 4 â€” Super Admin: verified that administrator sessions are database-backed opaque tokens, corrected documentation that wrongly listed `ADMIN_SESSION_SECRET` as required, and documented first-admin setup plus `ADMIN_SETUP_SECRET` rotation/removal.
- [x] Phase 5 â€” demo products: added `lib/demo-products.ts`, made explicit `DEMO` records visible in the admin list/edit/preview, and blocked demo publication/orderability in `lib/suppliers/publication.ts`; no demo records or seed data were added.
- [x] Phase 6 â€” suppliers: audited the evidence gates and added the dedicated `suppliers.verify` server guard so `suppliers.manage` alone cannot mark a supplier `VERIFIED`; wrote `docs/SUPPLIER_ONBOARDING.md`.
- [x] Phase 7 â€” couriers: audited and preserved the fail-closed account/jewellery/destination/charge/estimate gates and wrote `docs/COURIER_ONBOARDING.md`; no courier was added or activated.
- [x] Phase 8 â€” legal drafts: added draft `/terms` and kept `/privacy`, `/terms`, `/returns`, and `/shipping` marked **PENDING OWNER APPROVAL** with `noindex`; updated footer navigation and tests.
- [x] Phase 9 â€” backup/restore: added guarded `scripts/database-backup.mjs`, `scripts/database-restore.mjs`, and shared helpers; the restore target comes only from `RESTORE_DATABASE_URL`, the same-database guard is enforced, nothing auto-runs, and `backups/` is Git-ignored. Wrote `docs/BACKUP_RESTORE.md`; Neon PITR is documented as unverified until the plan is checked.
- [x] Phase 10 â€” monitoring/security: added structured JSON logging with credential/contact/query-string redaction, an `instrumentation.ts` `onRequestError` hook, a conservative CSP, production-only HSTS, and header tests; wrote `docs/MONITORING_AND_SECURITY.md` without claiming any external monitoring service is active.
- [x] Phase 11 â€” testing: ran the full gate suite after the changes and recorded the results below.

**Files changed/added (all local, uncommitted):** `package.json`, `package-lock.json`, `.env.example`, `.gitignore`, `next.config.ts`, `instrumentation.ts`, `lib/env/production.ts`, `scripts/check-production-env.mjs`, `lib/storage/product-image-storage.ts`, `lib/product-images.ts`, `lib/admin/product-images.ts`, `lib/admin/media.ts`, `lib/admin/products.ts`, `lib/payments/config.ts`, `lib/demo-products.ts`, `lib/suppliers/publication.ts`, `lib/actions/admin.ts`, `lib/site-navigation.ts`, `lib/logging/logger.ts`, `scripts/support/database-tools.mjs`, `scripts/database-backup.mjs`, `scripts/database-restore.mjs`, `app/(site)/terms/page.tsx`, the admin product list/edit/preview pages, tests (`demo-products`, `product-image-storage`, `logging`, `backup-scripts`, plus updates to `publication`, `payments`, `storefront`, and `privacy-guards`), and documentation (`docs/PRODUCTION_READINESS.md`, `docs/OWNER_SETUP_GUIDE.md`, `docs/SUPPLIER_ONBOARDING.md`, `docs/COURIER_ONBOARDING.md`, `docs/BACKUP_RESTORE.md`, `docs/MONITORING_AND_SECURITY.md`, `README.md`, and this entry). No schema, migration, business-rule, theme, or policy-position change was made.

**Verification (12 November 2026):** `npm test` 227 passed / 0 failed; `npm run typecheck` pass; `npm run lint` pass; `npm run check:contrast` 43/43; `npm run prisma:validate` valid; `npm run prisma:status` 6 migrations applied and up to date; `npm run build` pass (64 pages); `node scripts/check-production-env.mjs --self-test` pass; `npm run env:check:dev` pass; `npm run db:backup:check` pass (local, connection details hidden); backup and restore self-tests pass; `npm audit --omit=dev` clean (full audit: 7 moderate, development-only lint toolchain). No production database, payment credential, account, or deployment was used.

**Remaining owner actions:** create GitHub/Vercel/Neon accounts or access; provision Neon PostgreSQL and supply `DATABASE_URL`; create a Vercel Blob store and supply `BLOB_READ_WRITE_TOKEN`; supply `NEXT_PUBLIC_SITE_URL`, `CHECKOUT_DRAFT_SECRET`, and the Bank Transfer/Easypaisa values securely (not `ADMIN_SESSION_SECRET`); run approved production migrations with `prisma migrate deploy`; create the first Super Admin via `/admin/setup` and remove/rotate `ADMIN_SETUP_SECRET`; add genuine suppliers, products, and courier confirmations; obtain legal approval; configure backups, Neon PITR verification, restore rehearsal, monitoring, and alerting; complete final production testing; and give explicit written deployment approval.

**Verdict:** the locally controllable production-readiness work is complete and verified. Production remains **NOT READY (NO-GO)** until the owner actions above are completed and approved. T044 remains BLOCKED.


---

### T064 - Advanced production security hardening and final live-deployment preparation
**Status:** DONE for the local, safe scope (12 November 2026). No deployment, commit, push, account creation, credential creation, production database access, service provisioning, payment processing, or destructive database operation occurred. Production remains **NOT READY (NO-GO)**; T044 stays BLOCKED.

- [x] Phase 1 - read-only security audit before changing anything: reviewed authentication/sessions, authorization, input handling, rate limiting, headers, logging, secrets handling, dependencies, database access, storage, payment/courier fail-closed gates, and deployment assumptions. Findings recorded in `docs/SECURITY_AUDIT_T064.md`.
- [x] Phase 2 - administrator MFA: installed `otpauth@9.6.0` (MIT), added additive `AdminMfaCredential`/`AdminMfaRecoveryCode` models and migration `20261112000000_admin_mfa`, and implemented `lib/admin/mfa-crypto.ts` (AES-256-GCM secret envelope, scrypt-hashed recovery codes), `mfa-policy.ts` (always enforced in production, opt-in via `ADMIN_MFA_REQUIRED=true` in development), `mfa.ts`, `mfa-challenge-token.ts`, and `mfa-challenge.ts`.
- [x] Phase 3 - MFA flow: password-only login with an enrolled authenticator issues a signed five-minute HTTP-only challenge cookie; a database session is created only after TOTP or recovery-code verification. TOTP replay is prevented by a stored time-step counter. Unenrolled sessions are restricted to `/admin/mfa`. Added `/admin/mfa`, `/admin/mfa/verify`, and `/admin/mfa/codes`, plus `MfaVerifyForm`, `MfaEnrollmentConfirmForm`, and `MfaRecoveryRegenerateForm`. Recovery codes are shown once via a short HTTP-only cookie and stored only as hashes. A Super Admin can reset another administrator's MFA from the user detail page, with audit logging.
- [x] Phase 4 - session and guard integration: extended `lib/admin/session.ts` and `lib/admin/guard.ts` with MFA-aware authorization (`allowUnenrolled` only on the MFA and account surfaces), and refactored `lib/admin/auth-crypto.ts` to expose generic `hashScryptValue`/`verifyScryptValue` reused for recovery codes.
- [x] Phase 5 - shared rate limiting: replaced `lib/security/rate-limit.ts` with an async adapter supporting `memory` (development/test) and Upstash Redis REST over `fetch`, with fail-closed behaviour and a three-second timeout. Production refuses an unset provider and refuses `memory` unless `RATE_LIMIT_ALLOW_MEMORY_IN_PRODUCTION=true` is a deliberate, documented decision. Added `lib/security/admin-rate-limit.ts` (30/5 min for sensitive permissions and Super Admin actions, 180/5 min standard) and wired it into administrator mutations; updated every call site and added payment-submission and return-request limits.
- [x] Phase 6 - origin and header hardening: added `lib/security/action-origin.ts` and explicit same-origin checks on sign-in, first-admin setup, logout, MFA, password change, and recovery-code dismissal. Extended `next.config.ts` with CORP, `X-Permitted-Cross-Domain-Policies: none`, `X-DNS-Prefetch-Control: off`, and `private, no-store` for `/checkout/*`; the error boundary no longer logs the raw error object.
- [x] Phase 7 - environment validation: extended `lib/env/production.ts` and `scripts/check-production-env.mjs` with `ADMIN_MFA_ENCRYPTION_KEY`, `ADMIN_MFA_CHALLENGE_SECRET`, `RATE_LIMIT_PROVIDER`, and the Upstash values; the self-test covers missing/short MFA keys, memory limiting in production, missing/non-Upstash URLs, and confirms reports never contain secret values.
- [x] Phase 8 - CI and scanning configuration (local only): added `.github/workflows/ci.yml` (typecheck, lint, tests, contrast, Prisma validate/deploy against an ephemeral service container, build, and production-dependency audit), `.github/workflows/codeql.yml`, and `.github/dependabot.yml`. They are **not pushed or activated**; no branch protection, secret scanning, or auto-merge is enabled.
- [x] Phase 9 - WAF/bot guidance (documented only): wrote `docs/WAF_AND_BOT_PROTECTION.md` with baseline edge rules, bot-policy decisions, and alert ownership. No WAF, CDN rule, challenge page, provider account, or API key exists.
- [x] Phase 10 - security tests: added `tests/mfa.test.mjs` (13 tests) and extended `tests/security.test.mjs`, `tests/logging.test.mjs`, `tests/privacy-guards.test.mjs`, and `tests/request-security.test.mjs`.
- [x] Phase 11 - documentation: added `docs/ADMIN_MFA.md`, `docs/RATE_LIMITING.md`, `docs/WAF_AND_BOT_PROTECTION.md`, `docs/CI_AND_DEPENDENCY_SCANNING.md`, and `docs/SECURITY_CHECKLIST.md`; updated `docs/MONITORING_AND_SECURITY.md`, `docs/OWNER_SETUP_GUIDE.md`, `docs/PRODUCTION_READINESS.md`, `README.md`, and `.env.example`.
- [x] Phase 12 - final local gates: ran the full suite after all changes (results below).

**Files changed/added (all local, uncommitted):** `prisma/schema.prisma`, `prisma/migrations/20261112000000_admin_mfa/migration.sql`, `lib/admin/mfa.ts`, `lib/admin/mfa-crypto.ts`, `lib/admin/mfa-policy.ts`, `lib/admin/mfa-challenge.ts`, `lib/admin/mfa-challenge-token.ts`, `lib/admin/auth-crypto.ts`, `lib/admin/session.ts`, `lib/admin/guard.ts`, `lib/security/rate-limit.ts`, `lib/security/admin-rate-limit.ts`, `lib/security/action-origin.ts`, `lib/actions/admin.ts`, `lib/actions/admin-content.ts`, `lib/actions/orders.ts`, `lib/actions/checkout.ts`, `app/admin/mfa/page.tsx`, `app/admin/mfa/verify/page.tsx`, `app/admin/mfa/codes/page.tsx`, the MFA components, `app/admin/account/page.tsx`, `app/admin/users/[id]/page.tsx`, `next.config.ts`, `app/error.tsx`, `lib/logging/logger.ts`, `lib/env/production.ts`, `scripts/check-production-env.mjs`, `.env.example`, `.github/workflows/ci.yml`, `.github/workflows/codeql.yml`, `.github/dependabot.yml`, the test files listed above, and the documentation listed above. No storefront UI, branding, design-token, or approved business-rule change was made.

**Verification (12 November 2026):** `npm test` **245 passed / 0 failed** (up from 227; includes the 13 MFA tests); `npm run typecheck` pass; `npm run lint` pass; `npm run check:contrast` 43/43; `npm run prisma:validate` valid; `npm run prisma:status` **7 migrations applied and up to date**; `npm run build` pass (**67 pages**, including the three new MFA routes); `node scripts/check-production-env.mjs --self-test` all cases pass; `npm audit --omit=dev` **0 vulnerabilities**; `npm run db:backup:check` pass (local prerequisites); `npm run db:restore:check` correctly fails because no backup file and no `RESTORE_DATABASE_URL` exist (owner action). No production database, MFA key, authenticator secret, recovery code, Upstash credential, WAF rule, CI run, or deployment was created or contacted.

**Remaining owner actions:** generate `ADMIN_MFA_ENCRYPTION_KEY` and store it in the hosting secret manager (optionally set `ADMIN_MFA_CHALLENGE_SECRET`); provision an Upstash Redis store and set `RATE_LIMIT_PROVIDER=upstash`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN`; create the first Super Admin and enrol an authenticator, storing recovery codes offline; enrol every staff account; configure an edge/WAF and bot protection with alert ownership; review and deliberately commit the CI/CodeQL/Dependabot files and enable them with branch protection and secret scanning; provision hosting, domain, Neon PostgreSQL, and Vercel Blob; supply payment values, approved supplier/product data, and courier confirmations; obtain legal approval; configure backups, PITR verification, restore rehearsal, monitoring, and alerting; complete final production testing; and give explicit written deployment approval.

**Verdict:** the locally controllable T064 security-hardening work is complete and verified. Production remains **NOT READY (NO-GO)** because the owner/external gates above are incomplete. T044 remains BLOCKED.


---

## Identified Task Gaps â€” To Schedule

These gaps were found during T003 and the dropshipping update. They are recorded here but are **not approved or scheduled** yet. Prefer extending the existing task where noted rather than renumbering the tracker.

1. **Bootstrap baseline** â€” added as T003A.
2. **Cart persistence/session model** â€” T017 covers cart operations but not persistence across reloads or the chosen session model. Extend T017.
3. **Admin role model** â€” T023/T024 cover authentication and authorization but not the owner/staff role decision or least-privilege boundaries. Extend T023/T024 after the owner decision. The owner/Super Admin boundary was implemented during the T054 ownership-hardening follow-up; the owner/staff role model still needs a permanent decision record.
4. **Real data and supplier onboarding** â€” no task covers loading owner-approved supplier records, products, collections, images, costs, and availability, or confirming image usage rights. Add a data-loading task before catalogue completion; do not invent data.
5. **Reviews decision** â€” T031 is conditional. It must not start until the owner confirms whether reviews are in the MVP and approves moderation.
6. **Notifications** â€” email/SMS are not required by the specification. Add a task only if the owner approves them.
7. **Release-gate checklist and rollback verification** â€” T043/T044 cover handover and approval but not an explicit gate checklist or tested recovery procedure. Extend T043.
8. **Order-tracking lookup method** â€” T028 exists but the privacy-preserving lookup method is undecided. Extend T028 after the owner decision.
9. **Supplier settlement, delivery-cost, and returns decisions** â€” PENDING owner confirmation. T027A and real customer-order processing cannot be completed until these are approved. Courier charges and destinations are now recorded under T057/T060 and likewise require owner-approved values before anything is offered or charged.
10. **Demo catalogue (preview-only)** â€” the owner has approved clearly labelled, non-orderable demo products and images for development and preview, but no task currently implements them. Add a task after T003B with explicit acceptance criteria that keep demo content non-orderable and clearly labelled.

Supplier-specific work is now covered by T013A, T018A, T025A, T025B, T026A, T026B, T027A, and T038A.

---

## Current Execution Rule

T001, T003A, T003B, T006A, T008-T012, T013, T013A (technical implementation), T017, T018, T019, T021-T025B, T026 (order administration; supplier settlement not recorded), T027, T028, T029, T029A, T030, T032-T037, T039, T040, T041, T043, T045, T046, T047, T048, T049 (workflow, values missing), T050 (workflow, values missing), T051, T052, T054, T055, T057, T058, T059, T060, T061, T062, T063, and T064 are complete as technical implementations and verified where evidence exists. T013A real supplier/product onboarding and T014 acceptance, T015/T016 live acceptance, T018A, T020, T026A, T026B, T027A, T031, T038, T038A, T042, T044, T049/T050 live instruction display, T053, and T056 production/end-to-end review remain BLOCKED or NEEDS_REVIEW on owner-supplied data, approved decisions, payment account values, formal legal review, production hosting/credentials, and explicit production approval. T054's live first-admin creation is an owner/deployment action; no account or credential was created. The homepage Bright Gold Geometric Grid is implemented, browser-verified, and part of a passing repository-wide typecheck and production build. The production catalogue is intentionally empty until approved supplier-backed product records exist. Demo content is approved for development/preview only, must be clearly labelled, and must not be orderable. No marketing or payment integration is live. No payment has been processed or verified. Local product-image storage is approved for development only; production image storage is deferred. Courier support is a generic, owner-managed registry behind fail-closed gating (T060): no courier company is predefined or hardcoded, no courier company has been added, no courier account exists, and no charges, estimates, or destinations are approved, so Pakistan checkout is unchanged (free shipping, the 4â€“7 day store estimate, no COD) and international destinations remain unavailable until the owner adds and fully approves a courier through the Admin Panel. The owner setup guide is `docs/OWNER_SETUP_GUIDE.md` and the deployment checklist is in `docs/PRODUCTION_READINESS.md`.

T014's data-access implementation exists but its live acceptance still needs approved supplier/product records. T015/T016 need live supplier-confirmed products. The cart, checkout, order, payment, return, refund, and admin workflows are implemented as part of the approved T052 scope. Do not invent the missing supplier, catalogue, payment, settlement, or customer data, and do not treat technical implementation as proof of a live order journey.

**Production-readiness pass (12 November 2026):** T063 completed every safe local item after T062: Neon environment validation, Vercel Blob product-image storage with local fallback, optional bank display name, super-admin documentation correction, demo-content safeguards, supplier/courier audit guides, four legal drafts, guarded backup/restore tooling, structured logging, CSP/HSTS, and the full gate suite (227 tests). No deployment, account, credential, production database, or payment was created or contacted. Production remains **NOT READY (NO-GO)**; T044 stays BLOCKED on the owner actions recorded in `docs/PRODUCTION_READINESS.md` Â§7.

**Security-hardening pass (12 November 2026):** T064 added administrator MFA, shared rate limiting, origin and header hardening, extended environment validation, local CI/CodeQL/Dependabot configuration, WAF/bot guidance, and security tests, and re-ran the full gate suite (245 tests, 7 migrations, 67-page build). No deployment, commit, push, account, credential, store, WAF rule, or CI run occurred. Production remains **NOT READY (NO-GO)**; T044 stays BLOCKED on the owner actions recorded in `docs/PRODUCTION_READINESS.md` Â§7 and Â§10.
**Pre-client handover audit pass (16 November 2026):** A local full-repository audit/fix pass was completed and recorded in `docs/FINAL_CLIENT_HANDOVER_AUDIT.md`. Targeted fixes were applied for confirmed issues (customer-facing internal note exposure, private order metadata, idempotent checkout email binding/token-leak prevention, unauthenticated customer upsert overwrite prevention, guarded manual payment transitions, admin payment verification UI state, cart/checkout invalid-cart handling, request IP trust hardening, cart cookie size cap, cancellation stock-restore safety for tracked inventory, and clearer return-eligibility messaging). Automated gates passed after fixes: `npm test` (245/245), `npm run lint`, `npm run typecheck`, `npm run build` (67 pages), `npm run check:contrast`, `npm run prisma:validate`, `npm run prisma:status` (7 migrations, up to date), `npm audit --omit=dev` (0 vulnerabilities), and `npm run env:check:dev`. No deployment, commit, push, external account, production credential/database, or production operation was performed. Browser/device manual QA and live/external integrations were not fully tested; production remains **NOT READY (NO-GO)** and T044 remains BLOCKED on owner/client actions in `docs/PRODUCTION_READINESS.md`.

**Owner-approved motion enhancement (5 November 2026):** A presentation-only motion batch was authorised separately from the numbered tasks: hero reveal, gold shimmer, product-image zoom, scroll reveal, navigation indicator, and page transitions. It introduces no new task IDs and changes no task status. The cart now exists under the approved T052 scope; no additional animation exception is claimed. Reduced-motion, performance, focus, and contrast requirements remain in force.

**Owner-approved Black Gold Galaxy theme (5 November 2026):** The owner approved and applied the full-site Black Gold Galaxy theme as a cross-cutting presentation enhancement. It introduces no new task IDs and changes no task status. T013 and T013A were not touched.

- **Palette and surfaces:** `app/globals.css` now defines Deep Black `#050505`, Charcoal `#111111`, Dark Gold Shadow `#17120C`, Dark Brown `#20170D`, Bronze Brown `#443019`, Antique Gold `#80602C` (decorative only), Luxury Gold `#C29A45`, plus the retained white `#FFFFFF` and champagne `#E8DCC5` text colours. The body uses the approved smooth `172deg` gradient with radial gold glows and `color-scheme: dark`. Panel, editorial, and footer surface utilities were updated.
- **Components and pages:** the shared header, footer, logo, homepage hero, category cards, showcases, product cards, product detail, availability badge, search controls, empty states, collection cards/links, breadcrumbs, collection pages, search page, product route, and not-found page were restyled to the approved dark surfaces, white headings, champagne copy, and gold accents. Header logo remains at its existing size; footer logo is enlarged, centred in a fixed square stage, and rotates `360deg` every `34s`.
- **Protected assets:** `public/Luxury Gold Jewelry Monogram Logo.png` and `public/images/js-jewellers-hero.png` were not modified. Browser checks confirmed the header logo, hero, and footer logo preserve their aspect ratios.
- **Contrast:** `npm run check:contrast` verifies 17 approved pairs plus 4 restricted decorative pairs; all 21 checks passed. White/champagne body text, Luxury Gold normal text on approved dark surfaces, deep-black text on gold, and champagne focus rings all pass. Gold on bronze is restricted to large text/short labels; Antique Gold is verified as decorative-only.
- **Build checks:** `npm run lint` â†’ exit 0. `npm run typecheck` â†’ exit 0. `npm run check:contrast` â†’ exit 0 (21/21). `npm run build` â†’ exit 0.
- **Responsive browser verification:** every existing route was checked at `1440Ã—900`, `768Ã—900`, `390Ã—844`, and `320Ã—700` via Chrome DevTools Protocol on the production build: `/`, `/collections`, all eight `/collections/<slug>` routes, `/search` (default, filtered, and no-match), `/products/does-not-exist`, `/collections/does-not-exist`, `/not-found`, `/cart`, `/privacy`, and `/returns` (76 route/viewport combinations). All 200 routes returned HTTP 200; intentional unknown routes returned HTTP 404. Zero horizontal overflow, zero clipped text, zero broken or unloaded images after scrolling, and the `172deg` gradient and champagne body colour were present on every page.
- **Interaction and accessibility:** keyboard Tab produced a solid 2px champagne focus ring on the skip link, header controls, hero actions, and category cards. The mobile menu opened to `aria-expanded="true"`, closed with Escape, restored focus to the toggle, and also closed via the toggle. Client-side navigation to `/collections` worked, and browser Back/Forward restored `/` and `/collections` correctly.
- **Motion and reduced motion:** the footer logo animation was confirmed running (`js-footer-logo-rotate`, `34s`, infinite, `mix-blend-mode: screen`) with a square stage (`264px` desktop, `199.67px` tablet, `190px` mobile/small mobile). With `prefers-reduced-motion: reduce`, the footer rotation, hero reveal, and hero artwork reveal all computed to `animation-name: none` while content remained visible.
- **Known limitations:** the production catalogue remains intentionally empty, so no real product-detail page or demo price label could be rendered. At that time the `/cart`, `/privacy`, and `/returns` links prefetched to undeclared routes (HTTP 404); this was pre-existing and outside the theme scope. T029 resolved `/privacy` and `/returns` on 6 November 2026, and the `/cart` prefetch remains a pre-existing 404 until T017. At that time T013/T013A were BLOCKED; T013 was completed on 6 November 2026, and T013A remains BLOCKED on its approved-data dependency.

**Owner-approved presentation enhancement (5 November 2026):** The owner approved a follow-up presentation batch: a dark/light theme toggle, editorial italic typography, premium 3D cards, and a decorative animated starfield. It is cross-cutting, introduces no new task IDs, and changes no task status. T013 and T013A were not touched. The starfield itself was superseded by the owner-approved background replacement recorded below.

- **Theme tokens and modes:** `app/globals.css` defines theme-aware `--theme-*` surface, text, accent, focus, shadow, star, and header tokens. Dark Black Gold Galaxy remains the default; the light theme is a designed warm-ivory palette with espresso text, soft ivory cards, a deeper `#7A5A1E` readable accent, and subtle gold borders. The seven approved brand colours stay exact. Both modes keep the `172deg` gradient.
- **Persistence and no flash:** an inline boot script in `app/layout.tsx` applies the stored `js-theme` value before first paint. `ThemeToggle.tsx` is a real 44Ã—44px button with `aria-label`/`title`, moon/sun icons swapped by CSS, `useSyncExternalStore` persistence, and native keyboard/touch activation. The default is dark; the choice survives navigation and full reload.
- **Typography and brand:** major headings use `.heading-editorial` italic display serif with varied ivory/champagne/gold colours. Body copy stays upright. `.brand-wordmark` is a separate champagne-to-gold text element beside the unchanged logo. The owner logo and hero artwork were not modified.
- **Cards:** `.card-3d` adds layered rounded cards, gold-tinted borders, theme shadows, media/body/divider separation, hover lift/tilt, image zoom, press scale, and `:focus-within` focus. Product, collection, category, and showcase cards use it. Navigation is never delayed or intercepted, and motion is disabled under reduced motion.
- **Backgrounds (superseded 6 November 2026):** the original starfield component was replaced by `components/layout/SiteBackground.tsx`, which initially selected static Luxury Silk Waves on the homepage and a geometric grid everywhere else. The homepage layer was then superseded by the Bright Gold Geometric Grid; the non-homepage grid is retained. See the background notes below.
- **Contrast:** `npm run check:contrast` now reads both theme blocks and verifies 35 checks (30 approved pairs and 5 restricted decorative pairs). All dark and light checks passed.
- **Build checks:** `npm run lint` â†’ exit 0. `npm run typecheck` â†’ exit 0. `npm run check:contrast` â†’ exit 0 (35/35). `npm run build` â†’ exit 0 (18 pages).
- **Browser verification:** 13 routes Ã— 4 viewports Ã— 2 themes (104 combinations) on the production build: zero horizontal/body overflow, zero broken images, a 44Ã—44px toggle on every route, decorative layers with `pointer-events: none`, content and footer above the decorative layer, and one `h1` per route. Theme persistence, keyboard Enter, touch, boot-script ordering, card hover/press/return, focus, and reduced-motion overrides were verified. No console errors or exceptions occurred; only the expected network 404 for the intentionally unknown route was logged.
- **Known limitation:** the production catalogue remains intentionally empty, so only collection and category cards could be exercised for card interaction; no product card or product-detail page could be rendered.

**Owner-approved background replacement â€” implementation and verification (6 November 2026; homepage layer later superseded):**

- **Design at that stage:** the starfield was removed completely. `components/layout/SiteBackground.tsx` rendered static Luxury Silk Waves on `/` only and a subtle black-and-gold Geometric Grid on every non-homepage route. Both layers were theme-aware, fixed, clipped, `aria-hidden`, `pointer-events: none`, and non-animated; no reference screenshot is used as an asset. The homepage silk layer was later replaced the same day by the Bright Gold Geometric Grid; every non-homepage route still uses this grid.
- **Changed implementation at that stage:** `app/layout.tsx`, `app/globals.css`, `components/layout/SiteBackground.tsx`, `components/layout/SilkWaves.tsx`, and `components/layout/GeometricGrid.tsx`; `components/layout/Starfield.tsx` was deleted. The owner logo, hero artwork, header, footer, cards, typography, navigation, and business features were not changed.
- **Build checks at that stage:** `npm run lint` â†’ exit 0. `npm run typecheck` â†’ exit 0. `npm run check:contrast` â†’ exit 0 (35/35). `npm run build` â†’ exit 0 (20 pages).
- **Browser verification at that stage:** 15 routes Ã— 4 viewports Ã— 2 theme passes (120 checks) on the production build at `1440Ã—900`, `768Ã—900`, `390Ã—844`, and `320Ã—700`: silk present on `/` only; grid present on all 14 non-homepage paths; one decorative layer per route; zero starfield nodes and zero star animations; no horizontal or body overflow; zero broken images after scrolling; one `h1` per route; a 44Ã—44px theme toggle; header and footer visible; background `position: fixed`, `pointer-events: none`, `aria-hidden="true"`, `z-index: 0`. Client-side navigation switched silk â†’ grid â†’ silk correctly. Keyboard Tab produced the 2px champagne focus ring, the theme toggle activated and persisted across reload, and reduced motion removed hero/footer animations with no background animation.
- **Known limitation:** the framework's 404 error shell (`/not-found`, unknown product/collection slugs) omits the root prepaint theme script and therefore stays in the default dark theme even when `js-theme` is `light`. The geometric grid is still present and correct there. This is pre-existing Next.js error-shell behaviour, not a background regression; normal collection, collection-detail, search, privacy, and returns routes respond correctly to both themes. The production catalogue remains intentionally empty, so no live product-detail route or product-card interaction could be exercised.

**Owner-approved homepage background update â€” implementation and verification (6 November 2026):**

- **Final homepage design:** `components/layout/BrightGoldGrid.tsx` replaces the homepage silk waves with a static CSS-only Bright Gold Geometric Grid: a deep premium black base, 1px bright champagne-gold major lines, lower-opacity secondary lines, restrained gold glows, and a soft top-left readability scrim. Major spacing is `56Ã—48px` on mobile, `64Ã—56px` at 768px, and `72Ã—60px` at 1024px and above. The light theme uses a warm ivory base and deeper gold lines; no black background is forced.
- **Route scope:** `app/globals.css` adds the `--home-grid-*` tokens and `.site-background--home-grid`; `components/layout/SiteBackground.tsx` selects `BrightGoldGrid` on `/` only and still selects `GeometricGrid` on every other route. `components/layout/SilkWaves.tsx` was retained but no longer rendered; it was deleted on 14 November 2026. No logo, hero artwork, hero copy, header/navigation, card, footer, typography, theme-toggle, database, Prisma, product, supplier, order, payment, admin, or deployment file was changed.
- **Build checks:** `npm run lint` â†’ exit 0. `npm run check:contrast` â†’ exit 0 (35/35). `npm run typecheck` â†’ exit 0. `npm run build` â†’ exit 0 (20 pages).
- **Browser verification:** homepage at `375Ã—812`, `390Ã—844`, `768Ã—900`, `1366Ã—900`, and `1440Ã—900` in both themes. One `data-background="bright-gold-geometric-grid"` layer, `position: fixed`, `overflow: hidden`, `pointer-events: none`, `z-index: 0`, no animation, and no horizontal/body overflow. Header, footer, hero, logo, hero artwork, Shop Now/Search links, and 44Ã—44px theme toggle present. `/collections` and `/search` retained `data-background="geometric-grid"`. Theme toggle changed and persisted `js-theme` across reload; hero CTA navigated to `/collections`; reduced motion left the background static.
- **Known limitation:** none for this task. The older 404 error-shell theme flash remains pre-existing and unrelated.

T039 is complete and recorded in `docs/RELEASE_REVIEW.md`, including the soft-status and CSP/HSTS findings. T038/T038A remain blocked on approved catalogue, payment, forwarding, fulfilment, settlement, and test-data decisions. T042â€“T044 remain blocked on hosting, domain, production database, credentials, and explicit production approval. No remaining scheduled implementation task is dependency-ready without owner decisions. T032â€“T034 are implemented with a configurable base URL and only real configured product data, but production indexing and live structured data still require the approved domain and approved product records. Do not start T042 or T044, and do not deploy.

Supplier-related sequence after their prerequisites: **T013A â†’ T018A â†’ T025A â†’ T025B â†’ T026A â†’ T026B â†’ T027A â†’ T038A**. Do not skip the supplier data model or availability verification.

The T001 audit is recorded in `REPOSITORY_AUDIT.md`. The T040/T041 evidence, fixes, test environment, and limitations are recorded in `QUALITY_VERIFICATION.md`.

Do not change any task to DONE until its acceptance criteria have been verified.

