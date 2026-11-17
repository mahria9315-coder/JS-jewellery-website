
# JS Jewellers — Development Plan

**Target duration:** 14 calendar days  
**Status:** Revised during T003 (3 November 2026); documentation aligned during T003B (4 November 2026) with the owner's confirmed brand, demo-content, and payment decisions.  
**Business model:** Approved dropshipping. JS Jewellers sells supplier-owned products under its own branding and forwards customer orders to suppliers for fulfilment. JS Jewellers does not own the products or inventory.  
**Project condition:** Existing Next.js application. The T003A baseline, design tokens, shared layout, homepage, collections, product pages, search, and local development product-image policy (T012) are complete and verified. PostgreSQL 18 and Prisma 7 are installed, configured, and locally verified. On 8 November 2026 the owner-approved T013A and T052 scopes added additive supplier/catalogue, order/payment/return, and admin schema migrations plus the cart, checkout, order, manual-payment, refund, supplier, product, and admin workflows. `migrate deploy` remains the verified apply path. Real supplier/product data, live payment values, an owner-created admin account, formal legal review, and final owner approval are still outstanding. Vercel is only a future hosting option.  
**Approved motion enhancement (5 November 2026):** The owner approved a presentation-only motion batch: hero reveal, gold shimmer, product-image zoom, scroll reveal, navigation indicator, and page transitions. These are cross-cutting enhancements to already-verified pages, not new numbered tasks, and task statuses are unchanged. Cart micro-interactions are deferred because T017 (cart operations) is not implemented; no cart state may be invented. Reduced-motion, performance, focus, and contrast rules remain mandatory.  
**Approved Black Gold Galaxy theme (5 November 2026):** The owner approved and applied the full-site Black Gold Galaxy visual theme. It is a cross-cutting presentation change to the already-verified pages, not a new numbered task, and it changes no product data, prices, orderability, database schema, authentication, payments, or business rules. The footer logo rotation is the only approved continuous-animation exception. The later route-aware decorative backgrounds are static and add no animation exception. That theme change did not touch T013/T013A; T013 was completed separately on 6 November 2026 and T013A's technical implementation was completed on 8 November 2026, with real-data onboarding still blocked.
**Implementation completion (8 November 2026):** Owner-approved T049=A, T050=A, T052=A, T053=A, and T013A=B scopes were implemented. Cart, checkout, orders, manual payment submission/verification, returns/refunds, supplier/product onboarding, publication safeguards, and guarded admin screens exist and are tested. Bank Transfer and Easypaisa remain unavailable until their server-only values are configured. T053 legal review and final approval remain blocked. No supplier, product, stock, order, payment, or admin account was invented.
**Administrator setup update (9 November 2026):** A secure one-time `/admin/setup` flow was implemented so the website owner—not the developer—creates and owns the first Super Admin during handover (server-only `ADMIN_SETUP_SECRET`, constant-time validation, transactional/advisory-locked first Super Admin creation, permanent disable after first admin). `/admin/login` remains normal sign-in; the break-glass bootstrap script remains an owner-run recovery option only. Administrator account and role management is enforced server-side for the active Super Admin role; `users.manage` and `roles.manage` are reserved and cannot be granted to another role, and the last active Super Admin cannot be disabled or demoted. No administrator account was created automatically, and no developer-owned account exists.  
**Approved presentation enhancement (5 November 2026):** A follow-up presentation batch added an opt-in light theme with a header toggle, editorial italic headings, and premium 3D cards. It is also cross-cutting, adds no task IDs, changes no task statuses, and does not touch T013/T013A or any protected asset.

**Owner-approved homepage background update (6 November 2026):** The previous decorative starfield was removed completely. The homepage now uses the Bright Gold Geometric Grid: a deep premium black base with thin, clearly visible champagne-gold geometric lines and lower-opacity secondary lines, static and theme-aware. Every non-homepage route retains its existing subtle black-and-gold geometric grid over the approved `172deg` gradient. The owner logo, hero artwork, hero text and CTAs, header/navigation, section order, cards, footer, typography, and theme toggle/persistence are unchanged. The change is recorded as T006A (DONE); repository-wide typecheck and production build pass, no other task status changes, and it does not implement T030, T029, or T023.  
**Approved typography refinement (7 November 2026):** A cross-cutting presentation pass made the homepage hero the largest heading site-wide (800 italic champagne/deep-gold, responsive 38-80px) and established a consistent italic display hierarchy for page titles, section headings, and product names, while body copy, navigation, buttons, and controls stay upright. It adds font-role tokens and semantic heading classes in `app/globals.css`, extends the contrast script to 43 checks, and changes no task IDs, content wording, routes, product data, database/Prisma schema, or protected asset. The five preferred webfont names are listed first but are not downloaded; verified system fallbacks are used. Lint, typecheck, contrast, production build, and 70 browser checks across 5 viewports × 2 themes × 7 routes pass.
**Baseline prerequisite:** Satisfied. T003A created and verified the Next.js baseline; later tasks build on it.

## 1. Goal

Deliver a tested, mobile-first jewellery e-commerce MVP using Next.js, TypeScript, Tailwind CSS, PostgreSQL, and Prisma.

The store operates as a dropshipping business: supplier-owned products are listed under JS Jewellers branding, customer orders are reviewed and forwarded to the relevant supplier, and JS Jewellers tracks supplier fulfilment and records its selling margin.

The goal is a working, maintainable foundation—not a visual demo with fake functionality.

The project already exists as a Next.js application, so later work builds on the verified baseline instead of re-creating it.

## 2. Delivery Principles

- Follow `AGENTS.md` and `spec.md`.
- Preserve the existing application; do not rewrite unrelated working features.
- T003A is complete. Build on the verified baseline.
- Work in small, verifiable increments.
- Implement required customer journeys before optional enhancements.
- Prioritize security and correct order totals.
- Treat JS Jewellers as a dropshipping storefront: do not assume it owns products or inventory.
- Keep supplier identity, costs, contacts, agreements, and internal margins private.
- Track supplier availability and fulfilment honestly; never claim a status without evidence.
- Track third-party dependencies early.
- Do not deploy or enable live services without approval.
- Update `tasks.md` only after verification.

## 3. Proposed Architecture

### Bootstrap baseline (T003A — complete)

T003A is complete. The repository already contains the Next.js App Router baseline: strict TypeScript, Tailwind CSS, ESLint, Git, a placeholder-only `.env.example`, and a verified production build. PostgreSQL, Prisma, authentication, and application features were not part of the baseline.

### Frontend
- Next.js App Router.
- TypeScript.
- Tailwind CSS.
- Reusable header, footer, product card, price display, form, and status components.
- Responsive customer-facing pages.

### Server
- Next.js server-side logic and route handlers/server actions as appropriate.
- Server-side validation for all important mutations.
- Authorization for administrative operations.
- Centralized business logic for pricing, supplier availability, and order creation.

### Database
- PostgreSQL.
- Prisma ORM.
- Versioned database migrations.
- Appropriate relationships and constraints.

### Initial data entities

- Supplier (internal identity, contacts, agreed terms, and status)
- Product (public catalogue data plus an internal supplier link)
- SupplierProduct (supplier SKU, supplier cost, availability status, and last verified timestamp)
- Collection
- ProductImage
- ProductOption or customization configuration
- Cart and CartItem, according to the approved session/persistence model
- Order
- OrderItem (selling-price snapshot, supplier-cost snapshot, and calculated margin)
- OrderStatusHistory (customer-facing status audit trail)
- OrderSupplierFulfilment (approved forwarding method, timestamp, admin, supplier reference, supplier status, and evidence)
- AdminUser (role field; single owner/admin role is the minimum)
- Payment and PaymentStatusHistory (customer payment status kept separate from supplier settlement)
- SupplierSettlement, if required by the approved payment workflow
- Review, only if the owner approves reviews for the MVP

Do not assume customer accounts. The specification does not require them, so the MVP should use the smallest secure guest-checkout and cart-persistence model that passes owner review. Do not claim cross-device cart synchronization.

Supplier records and supplier-product cost data are internal. No customer-facing query may expose them.

T013 itself was infrastructure-only. Later owner-approved T013A/T052 migrations added the supplier, product, order, payment, return, and admin schema. T013A owns real supplier/supplier-product onboarding and T014 owns product and collection data access. No real supplier, product, stock, or administrator record has been loaded; keep the wider data decisions blocked until the relevant owner, supplier, order/payment settlement, and data approvals arrive.

### Data readiness

Catalogue, homepage merchandising, reports, and policy pages depend on real owner and supplier data or approved policy wording. Until those arrive, use clearly labelled placeholders or empty states, or clearly labelled demo content under the exception below. Do not seed invented real supplier data, prices, costs, discounts, reviews, Best Seller rankings, or policy commitments.

### Black Gold Galaxy theme application (5 November 2026)

The theme is implemented through the existing token and component architecture, without new dependencies:

- `app/globals.css` owns the seven-colour palette, the `172deg` page gradient, radial gold glows, dark `color-scheme`, panel/footer surfaces, the champagne focus ring, and the footer-logo stage and rotation.
- `components/layout/SiteHeader.tsx`, `SiteFooter.tsx`, and `SiteLogo.tsx` apply the dark shell. The logo variants share the unchanged source PNG; the footer uses `mix-blend-mode: screen` and a fixed square stage.
- Homepage, catalogue, collection, product, search, empty-state, not-found, and breadcrumb components use the shared surfaces and text colours rather than page-specific colours.
- `scripts/check-contrast.mjs` verifies every approved text/surface pair plus the restricted decorative pairs.
- Verification covers every existing route at `1440×900`, `768×900`, `390×844`, and `320×700`, plus keyboard focus, mobile-menu Escape handling, reduced motion, client-side Back/Forward, image aspect ratios, and the running footer rotation.
- The production catalogue remains empty. No demo products, prices, ratings, stock claims, or reviews were added.

### Presentation enhancement implementation (5 November 2026)

This batch reuses the existing token and component architecture without new dependencies:

- **Theme modes:** `app/globals.css` defines `--theme-*` tokens for both the default dark theme and the opt-in light theme. `app/layout.tsx` adds an inline pre-paint boot script that reads `js-theme` from `localStorage`, sets `data-theme`, and sets `color-scheme`; `suppressHydrationWarning` covers the attribute change. `components/layout/ThemeToggle.tsx` is a 44×44px native button using `useSyncExternalStore`; icons swap by CSS so hydration stays stable.
- **Light theme design:** warm ivory page gradient, soft ivory elevated panels, espresso text, deeper gold accent (`#7A5A1E`) for readable text, subtle gold borders, soft brown-tinted shadows, and coordinated header/footer surfaces. The unchanged logo sits on a dark `.logo-plate` disc so `mix-blend-mode: screen` still removes its baked-in black background.
- **Typography:** `--font-display` (Bodoni/Didot system stack) powers `.heading-editorial` italic headings; `.heading-ivory`, `.heading-champagne`, `.heading-gold`, `.eyebrow`, and `.body-copy` provide hierarchy. Body copy stays upright. `.brand-wordmark` is a separate champagne-to-gold text treatment beside the unchanged logo.
- **Cards:** `.card-3d` provides a layered shell with rounded `--radius-card` corners, gold-tinted border, theme shadow, media/body/divider separation, hover lift/tilt, image zoom, press scale, and `:focus-within` focus. Product, collection, category, and showcase cards use it. No JavaScript intercepts navigation.
- **Route-aware backgrounds:** `components/layout/SiteBackground.tsx` selects `BrightGoldGrid.tsx` on `/` only and retains `GeometricGrid.tsx` on every other route. The homepage layer is a CSS-only deep-black base with bright champagne-gold major lines, lower-opacity secondary lines, restrained edge glows, and a soft readability scrim; the non-homepage grid remains the existing CSS-only black-and-gold pattern over the approved `172deg` gradient. Both are `aria-hidden`, fixed, clipped, `pointer-events: none`, theme-aware, and non-animated. `SilkWaves.tsx` is retained in the repository but is no longer rendered. The old starfield component and animations remain removed.
- **Verification:** lint, contrast, TypeScript, and the production build all pass. Browser verification covers the homepage at `375×812`, `390×844`, `768×900`, `1366×900`, and `1440×900` in both themes, plus non-homepage routes, persistence, no flash, keyboard activation, focus, background layering, overflow, hero/logo image loading, and reduced motion.
- The production catalogue remains empty, so only collection and category cards could be exercised for card interaction.

### Demo catalogue exception (development and preview only)

Demo products and demo images are approved for development and preview only. They must be clearly labelled as demo content, must not be orderable, and must not be presented as genuine prices, stock, suppliers, or images. Cart, checkout, and order creation must reject demo products. The existing restrictions against invented real supplier data remain in force. Demo content is not a production catalogue.

### Infrastructure
- Environment-based configuration.
- `.env.example` containing placeholders only.
- Git version control.
- Automated build and test checks.
- Deployment preparation for an approved hosting provider.

## 4. Fourteen-Day Schedule

### Day 1 — Requirements and Dependency Confirmation
- Confirm the current repository condition and record that the application, baseline, and Git repository already exist.
- Review the four SDD documents and record conflicts.
- Record owner-provided assets, supplier agreements, technical dependencies, payment and settlement scope, and PENDING decisions in Section 5.
- Confirm the dropshipping workflow and the internal-only nature of supplier data.
- Confirm the T003A bootstrap scope and acceptance criteria.
- Obtain owner approval of T003 before implementation.

**Deliverable:** Approved requirements, dependency register, and bootstrap scope.

### Day 2 — Bootstrap and Design System
- Execute T003A: create the Next.js App Router project, enable strict TypeScript, Tailwind CSS, and ESLint.
- Initialize Git if needed and install only approved baseline dependencies.
- Create `.env.example` with placeholders only and verify a production build.
- Then proceed to T004: establish approved colour tokens, typography, spacing, and reusable UI conventions.
- Confirm linting and build checks.

**Deliverable:** Verified application baseline and consistent brand styling.

### Day 3 — Shared Layout and Homepage
- Build or refine header and navigation.
- Implement the responsive hero section.
- Add category navigation.
- Implement New Arrivals, Best Sellers, and Offers sections using real configured data.
- Add footer and mobile navigation.

**Deliverable:** Responsive homepage.

### Day 4 — Collections and Product Catalogue
- Implement all eight collections.
- Build product listing and product cards from supplier-linked product records.
- Add empty states.
- Add search, filtering, and sorting appropriate to the available product data.
- Keep supplier identity, cost, and margin out of public pages.

**Deliverable:** Navigable catalogue.

### Day 5 — Product Details and Customization
- Implement product detail pages.
- Display images, descriptions, prices, and supplier-backed availability.
- Add configurable customization inputs for eligible products.
- Validate name, font, and colour options.
- Confirm the assigned supplier can fulfil the approved customization.

**Deliverable:** Product details and validated customization UI.

### Day 6 — Database Infrastructure and Data Access
**Status:** Infrastructure and approved domain schema complete (8 November 2026); real supplier data access still depends on T013A onboarding.
- Verify authenticated access to PostgreSQL 18 and inventory existing roles/databases.
- Confirm the dedicated local application role `js_jewellers_app` and database `js_jewellers`.
- Install and configure Prisma 7 with `prisma.config.ts`, the `pg` driver adapter, and ignored `.env.local` credentials.
- Set up and document the migration workflow and apply additive domain migrations.
- Implement data access and server-side validation for the approved catalogue, order, payment, return, and admin scope.
- Restrict supplier and cost data to authorized use.

**Deliverable:** Verified PostgreSQL/Prisma infrastructure, with schema work deferred to the tasks that own the approved data.

### Day 7 — Cart
- Implement add-to-cart.
- Implement quantity changes and item removal.
- Persist product options and customization.
- Display item subtotals and totals.
- Handle unavailable products and changed prices.
- Recheck supplier availability before checkout.

**Deliverable:** Working cart.

### Day 8 — Checkout and Payment Methods
- Implement checkout fields and validation.
- Recalculate totals on the server.
- Implement order creation and unique order references.
- Prevent duplicate submissions.
- Save order items and customization snapshots.
- Save the assigned supplier, supplier-cost snapshot, selling-price snapshot, and calculated margin per item.
- Implement the client-approved payment methods: Bank Transfer (Islamic Bank) and Easypaisa.
- Read payment account details only from server-side configuration and display them only at the payment step after the customer selects a method.
- Keep payment status unverified until an authorised person confirms it. No payment gateway or automatic verification is approved.
- Show the 4–7 day delivery estimate and the applicable return terms before order completion.

**Deliverable:** Verified order journey with server-only payment configuration; no payment claim without verification.

### Day 9 — Secure Admin Access
- Implement or refine secure admin authentication.
- Enforce server-side authorization.
- Build the basic dashboard.
- Verify that public users cannot perform admin actions.
- Require the website owner to create the first Super Admin during handover; do not create or keep a developer-owned administrator account.
- Reserve administrator account and role management for the active Super Admin role, and keep the last active Super Admin from being disabled or demoted.

**Deliverable:** Protected admin area owned by the client.

### Day 10 — Supplier and Product Administration
- Implement internal supplier records: identity, contacts, agreed terms, and status.
- Assign each product to its actual supplier and record supplier SKU.
- Record supplier cost and JS Jewellers selling price separately.
- Calculate selling margin from verified values.
- Record supplier availability and last verification.
- Implement product creation, editing, images, prices, and collection assignment.
- Keep supplier, cost, and margin data restricted to authorized admins.

**Deliverable:** Supplier-linked catalogue administration.

### Day 11 — Order Forwarding, Fulfilment, and Profit
- Review incoming orders and verify supplier availability per item.
- Forward orders to the relevant supplier using the approved method.
- Record forwarding method, timestamp, authorized admin, reference, and what was sent.
- Track supplier fulfilment separately from customer payment.
- Update the customer-facing order status only when evidence supports the change.
- Record customer payment, supplier cost, delivery cost where applicable, supplier settlement, and actual profit.
- Handle supplier delays, cancellations, and discrepancies honestly.

**Deliverable:** Working dropshipping order and profit workflow.

### Day 12 — Tracking, Policies, Contact, and SEO
- Implement privacy-preserving order tracking with supplier-aware statuses.
- T029 (6 November 2026) published the owner-supplied draft `/privacy` and `/returns` wording, linked from the footer. Every unapproved detail is marked **PENDING OWNER APPROVAL OR LEGAL REVIEW**, the policy routes remain `noindex`, and checkout policy links wait for T019.
- T029A (7 November 2026) published the confirmed brand **JS Jewellers**, legal/business name **JS Jewellery**, Karachi, Sindh location, clickable **mahria9315@gmail.com**, WhatsApp **+92 333 9422818**, the Pakistan **3-day** change-of-mind window, the **25% deduction / 75% refund** with a worked PKR 10,000 example, safeguards for faulty and legally protected returns, and the country-aware international position. Pakistan is the only configured destination; all other destinations display “return terms require confirmation.” Research is recorded in `docs/legal-policy-research.md`; formal legal review remains outstanding.
- Configure WhatsApp contact — DONE (T030, 6 November 2026; re-verified 7 November 2026): the owner-confirmed number **+92 333 9422818** is published as an accessible `https://wa.me/923339422818` link in the shared footer and on the policy pages.
- Publish the client-approved 4–7 day delivery estimate on `/shipping`, `/returns`, and product details, always as an estimate and without inventing courier, tracking, charge, customs, or guaranteed-date details.
- Add metadata, sitemap, robots rules, and appropriate structured data.
- Review image optimization.
- Document Meta Pixel, Google Analytics, Instagram, Bank Transfer, and Easypaisa requirements. Payment account numbers remain server-only and blocked until the owner supplies them through a secure channel.
- Integrate only services that have the required access, approvals, and verified implementation path.
- Verify empty, invalid, and unavailable states.

**Deliverable:** Customer support, policy, and SEO foundation with an integration status report.

### Day 13 — Testing and Bug Fixes
- Run lint, type checks, tests, and production build.
- Test core customer journeys.
- Test admin authorization.
- Test pricing, supplier availability, duplicate order handling, and customization persistence.
- Test the complete dropshipping journey: supplier setup, product assignment, availability check, order forwarding, supplier status, customer status, and profit calculation.
- Test that supplier data is never exposed publicly.
- Check mobile, tablet, and desktop layouts.
- Fix verified issues and retest.

**Deliverable:** Test results and prioritized bug report.

### Day 14 — Release Readiness and Handover
- Review acceptance criteria.
- Check environment configuration and deployment prerequisites.
- Document outstanding dependencies, including supplier agreements and pending settlement/returns decisions.
- Confirm supplier data, cost, and margin remain private.
- Prepare deployment using the approved provider.
- Obtain owner approval before production deployment.
- Update all task statuses accurately.

**Deliverable:** Release-ready MVP or a transparent handover identifying remaining blockers.

## 5. Dependencies and Risks

This section is the authoritative dependency register. Other documents should reference it instead of duplicating full lists.

### 5.1 Owner-provided assets and decisions

All items below are PENDING unless explicitly marked APPROVED or DEFERRED. The owner must supply or approve them; the implementation must not invent them.

| Item | Status | Needed for |
|---|---|---|
| Logo file | PENDING — owner has a logo; the file is not present in the repository as of T003B | Header, footer, favicon, social sharing |
| Real product photos | PENDING — demo images are approved for development/preview only | Catalogue, product details, homepage |
| Demo products and demo images | APPROVED — development/preview only, clearly labelled, not orderable, not yet implemented | Catalogue preview |
| Product names, descriptions, prices, supplier availability | PENDING — demo content is preview-only and cannot be ordered | Catalogue, cart, checkout, orders, SEO |
| Supplier identities and contact details | PENDING | Internal supplier records; never public |
| Supplier agreements and fulfilment terms | PENDING | Dropshipping workflow and release gate |
| Supplier product/SKU data and image usage rights | PENDING | Catalogue setup and product images |
| Supplier cost per product | PENDING | Margin and profit calculations |
| Supplier availability verification method and frequency | PENDING | Availability checks before accepting/forwarding |
| Supplier order-transmission method (manual, WhatsApp, or other) | PENDING | Order forwarding workflow |
| Customer payment collection and supplier settlement | PENDING | Bank Transfer / Easypaisa payment workflow |
| Delivery-cost responsibility | PENDING | Checkout, order totals, profit |
| Returns, exchanges, and damaged-product responsibility | COMMERCIAL TERMS APPROVED 7 November 2026 — Pakistan 3-day change-of-mind window, 25% deduction / 75% refund, statutory remedies separate; legal review and return address PENDING | Policies and supplier workflow |
| COD settlement workflow | NOT IN APPROVED SCOPE — Cash on Delivery is not part of the client-approved payment list | COD order handling only if separately approved |
| Approved customization fonts and colours | PENDING — exact fonts/colours not supplied | Custom-name jewellery |
| WhatsApp business number | CONFIRMED — **+92 333 9422818**; public link added to the policy pages and footer on 6 November 2026 | Contact link |
| Business email address | CONFIRMED — **mahria9315@gmail.com**; published as a clickable `mailto:` link on 7 November 2026 | Policy contact, customer support |
| Privacy policy wording | DRAFT UPDATED 7 November 2026 — confirmed email, payment handling, and approved commercial terms included; formal legal review and final wording approval PENDING | Policy page, footer, checkout |
| Return/exchange policy wording | DRAFT UPDATED 7 November 2026 — Pakistan 3-day/25%/75% terms, safeguards, country-aware international configuration, and delivery estimate included; formal legal review, return address, and refund timeline PENDING | Policy page, footer, checkout |
| Legal review of privacy and returns policies (Pakistan/Sindh) | PENDING — research recorded in `docs/legal-policy-research.md`; not a substitute for qualified legal advice | Policy approval, launch |
| Researched sales destinations | CONFIRMED — Pakistan intended only; Sindh researched. Checkout accepts Pakistan only. No other country is approved and return terms for other destinations require confirmation | Checkout, shipping, policy scope |
| Delivery estimate | CONFIRMED — **4–7 days** for all intended destinations; estimate only, not a guarantee | Shipping page, returns policy, product details, checkout |
| Domain name | PENDING | Deployment, canonical URLs |
| Hosting provider/account | PENDING | Deployment |
| Bank Transfer account number and confirmed display name | BLOCKED — only the label **Islamic Bank** is approved; the exact account number and confirmed account-holder name have not been supplied through a secure channel | Bank-transfer payment step |
| Bank-transfer verification workflow | IMPLEMENTED — customer submission plus admin-only verify/reject with `PaymentEvent` and audit records; account values still BLOCKED | Bank-transfer payment |
| Easypaisa account number | BLOCKED — approved method, but the account number and confirmed account-holder name have not been supplied through a secure channel | Easypaisa payment step |
| JazzCash merchant/API access | DEFERRED — outside the approved payment scope | Future scope change only |
| Reviews in MVP | PENDING | Review scope |
| Definition of "Best Seller" | PENDING — manual flag vs sales-derived | Homepage merchandising |
| Delivery charges and customs arrangements | PENDING — the 4–7 day estimate is approved, but charges, courier, tracking, and customs details are not confirmed for publication | Checkout, shipping page |
| Admin role model | PENDING — single owner/admin assumed as minimum | Admin authentication and authorization |
| Order and payment status workflow | PENDING — suggested statuses in `spec.md` need approval | Orders, admin, reports |
| Order-tracking lookup method | PENDING | Order tracking |
| Email/SMS notifications | PENDING — not required for MVP unless approved | Notifications |
| Analytics/Meta Pixel IDs and consent approach | PENDING | Marketing integrations |
| Tax rules, if any | PENDING — none specified | Cart totals |

### 5.2 Technical dependencies

- **PostgreSQL:** local PostgreSQL 18.6 is **APPROVED for development**, installed, and verified on 6 November 2026. T013 covers infrastructure and the approved T013A/T052 migrations cover the domain schema. The dedicated `js_jewellers_app` role, `js_jewellers` database, Prisma 7 packages/configuration, and ignored `.env.local` credentials are in place. Real supplier, product, order, payment, and admin-user records remain PENDING. Production provider/host and connection string remain PENDING.
- **Environment variables:** server-only names for payment values (`PAYMENT_BANK_ACCOUNT_NUMBER`, `PAYMENT_BANK_ACCOUNT_HOLDER`, `PAYMENT_EASYPAISA_NUMBER`, `PAYMENT_EASYPAISA_ACCOUNT_HOLDER`), admin bootstrap (`ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD`), and checkout draft signing (`CHECKOUT_DRAFT_SECRET`) are documented in `.env.example` as placeholders only. No real value is committed. The verified local `DATABASE_URL` lives only in ignored `.env.local`.
- **Prisma:** installed and configured at 7.10.1, including `prisma.config.ts` and three applied migrations. Seed data is limited to six admin roles and safe approved defaults (business/shipping/payment settings, homepage placeholder sections, navigation links, and three `DRAFT` policy-page stubs). No administrator user, supplier, product, order, payment, return, or customer record is seeded. `prisma migrate deploy` is the verified apply path; `prisma migrate dev` needs an owner-approved shadow database because the application role cannot create databases.
- **Image storage:** local project storage is **APPROVED for development** under `public/images/products/`, with local raster files referenced as `/images/products/...` and validated by `lib/product-images.ts` (T012). Production image storage remains **PENDING** and is deferred; no external image host is configured. Demo images remain development/preview only, and real supplier images still require confirmed usage rights.
- **Supplier data model:** supplier records, supplier-product links, cost history/snapshots, availability checks, and forwarding evidence must be stored internally with restricted access.
- **Supplier order transmission:** manual admin forwarding unless the owner approves a specific channel or integration. Do not assume an API exists.
- **Supplier availability:** a verification method must be approved before orders can be accepted or forwarded.
- **Supplier-image rights:** permission to use supplier images must be confirmed before publication.
- **Authentication:** the owner/admin authentication approach is PENDING. Passwords must be hashed and sessions secured if password authentication is used.
- **Hosting:** Vercel or a compatible platform; account, environment configuration, and production database access are PENDING.
- **Runtime verified during T003:** Node `v24.21.0`, npm `11.19.0`. PostgreSQL 18.6 and Prisma 7.10.1 were verified separately during T013 on 6 November 2026; the application does not query the database until T014.
- **Build and test tooling:** lint, type check, production build, and appropriate tests at each milestone.
- **Git:** the repository exists on branch `main` and was initialized during T003A. Do not perform destructive Git operations or commit/push without owner permission.
- **Domain/DNS and production secrets:** PENDING owner decisions.
- **Documentation filename:** normalized to `AGENTS.md` for case-sensitive deployment environments.

### 5.3 Payment scope

- **Approved methods (7 November 2026):** Bank Transfer (Islamic Bank) and Easypaisa only.
- **Cash on Delivery:** not part of the client-approved list. Do not implement or offer COD unless the owner separately approves it and its settlement workflow.
- **Bank Transfer:** approved. The exact account number and any confirmed account-holder name must be supplied through server-only configuration. They must never appear in public pages, public APIs, client bundles, logs, documentation, screenshots, or reports. Payment remains unverified until an authorised person checks it.
- **Easypaisa:** approved. The account number and any confirmed account-holder name must be supplied through server-only configuration with the same handling rules as Bank Transfer. No merchant API or automatic payment verification is approved.
- **Server-only configuration:** implemented in `lib/payments/config.ts`; `.env.example` contains placeholder names only. Never use `NEXT_PUBLIC_` variables for private account numbers.
- **Checkout dependency:** cart, checkout, order, and payment routes exist, and instructions are shown on the server only after a configured method is selected. Both approved methods remain unavailable until their account values are configured, and no payment is ever marked verified automatically.
- **Customer payment vs supplier settlement:** record separately. Do not assume JS Jewellers collects the customer payment or pays the supplier until the owner confirms the workflow.
- **JazzCash and cards:** outside the approved scope. Do not store card details, PINs, OTPs, or bank-login credentials.
- Payment status must remain separate from order/fulfilment status.
- Never claim an untested payment integration is working.
- Do not simulate a successful online payment or claim that payment has been received or verified.

### 5.4 Unresolved decisions (PENDING)

All items require **PENDING OWNER CONFIRMATION** unless already approved elsewhere.

- Does the supplier collect payment from the customer, or does JS Jewellers collect it?
- Who pays the supplier, and when?
- Who pays delivery charges?
- Who handles returns, exchanges, and damaged products?
- How will suppliers receive orders: manually through admin, WhatsApp, or another approved method?
- Which suppliers are approved, and what are their agreed terms and costs?
- Which supplier-product data and images may JS Jewellers publish?
- How and how often will supplier availability be verified?
- Are customer reviews included in the MVP?
- What qualifies a product as a Best Seller: a manual merchandising flag or a sales-derived ranking?
- Is free delivery / PKR 0 shipping confirmed for all orders, and are there exceptions? The 4–7 day estimate is approved, but charges, courier, tracking, and customs details are not confirmed for publication.
- What are the exact Bank Transfer account number, Easypaisa number, bank display name, and confirmed account-holder names? Supply them through a secure channel, never in source control.
- What manual payment-verification workflow is approved for Bank Transfer and Easypaisa?
- What policy wording changes remain after formal legal review? The client-approved commercial terms are published; legal approval is not.
- What production image storage approach is approved? Local development storage is approved; production storage is deferred.
- What cart persistence and session model is approved, given that customer accounts are not required?
- Which order and payment statuses are approved, and who may perform each transition?
- Is a single owner/admin role sufficient, or are additional staff roles required?
- How will customers look up orders without exposing another customer's data?
- Are email or SMS notifications required for the MVP?
- Are taxes or other charges applicable? None are specified.
- Which products and options are customizable, and what are the exact approved fonts and colours?
- When will formal legal review be completed and the final policy wording approved?
- What domain and hosting provider are approved?
- What manual Bank Transfer and Easypaisa verification workflow is approved? (The approved methods are Bank Transfer / Islamic Bank and Easypaisa.)
- What approval and moderation workflow applies to reviews, if included?

### 5.5 Risk handling

- If an external provider is unavailable, document the blocker and continue independent work.
- Do not fake a successful payment or integration.
- If owner data is late, use empty states or clearly labelled, non-orderable demo content and continue with independent work; do not seed fake inventory, real-looking supplier records, or production prices.
- If a supplier is unavailable, out of stock, or unresponsive, do not accept or forward the order until the owner approves an alternative. Never invent availability.
- If supplier fulfilment is delayed or disputed, keep the customer-facing status unchanged until evidence supports an update.
- If supplier cost or delivery cost is unverified, do not report profit as final.
- Restrict supplier identity, contact, cost, and margin data to authorized admins; treat a suspected exposure as a security incident.
- Do not begin real customer-order processing until settlement, delivery-cost, returns, and supplier-transmission decisions are approved.
- Do not reuse an unrelated existing repository or another project's code without explicit owner approval.
- Do not sacrifice security to meet the 14-day target.
- Treat the 14-day target as a planning goal, not a guarantee.
- If T003A reveals environment constraints, revise the schedule transparently.

## 6. Verification Strategy

For every task, define and perform relevant checks:

- Linting.
- Type checking.
- Unit or integration tests where appropriate.
- Production build.
- Manual browser verification.
- Database persistence verification.
- Authorization testing for protected functions.
- Responsive layout checks.
- Contrast-token checks for every foreground/background pair, including the documented restricted pairs.
- Keyboard focus, reduced-motion, image aspect-ratio, and mobile-menu checks for visual-theme changes.
- Theme-toggle checks in both themes: first-paint default, persistence across refresh and navigation, no flash or hydration mismatch, mouse/keyboard/touch activation, 44×44px target, visible focus, and no horizontal overflow or layout shift.
- Background checks: silk waves on `/` only and the geometric grid on every non-homepage route, both behind content, `pointer-events: none`, `aria-hidden`, both-theme contrast, no horizontal overflow, no leftover starfield layers or animations, and no background motion under `prefers-reduced-motion`.
- Cart persistence checks appropriate to the approved session model.
- Order and payment status transition checks, including separation of the two.
- Admin role-boundary checks.
- Confirmation that data-dependent pages show real owner data or an honest empty state.
- Supplier-data privacy checks on public pages, APIs, errors, and logs.
- Supplier availability verification before order acceptance and forwarding.
- Supplier cost, selling price, margin, delivery cost, and actual-profit reconciliation.
- Evidence checks for supplier forwarding and fulfilment status changes.

A build passing does not mean every user journey has been tested.

## 7. Release Gate

Production release requires:

- Owner approval.
- Approved supplier list, agreements, costs, image rights, and order-transmission method.
- Every published product linked internally to its actual supplier.
- Supplier identity, cost, contact, agreement, and margin privacy verified.
- A verified T003A baseline and successful production build.
- Required production environment variables.
- Working production database and migrations.
- Verified authentication and authorization, including the approved admin role model.
- Tested order creation, supplier availability verification, order forwarding, supplier fulfilment tracking, and payment/settlement separation.
- Supplier costs and actual profit reconciled from real recorded values.
- Owner-approved payment scope; no unverified payment integration described as working.
- Reviewed privacy, return/exchange, and policy content.
- Real owner data loaded, or remaining data gaps clearly disclosed.
- Approved report calculation rules for cancelled, returned, and refunded orders.
- No known critical security issues.
- Successful build and appropriate tests.
- A documented rollback or recovery approach.

If any critical requirement is not met, report it instead of claiming the website is production-ready.
