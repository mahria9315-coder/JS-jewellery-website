
# J's Jewellery — Task Tracker

**Status:** T005 shared layout complete — 4 November 2026. T003A baseline, T004 design tokens, and T005 header/navigation/footer are verified; store features have not started.  
**Rule:** Do not mark a task DONE until its acceptance criteria have been verified.

## Status Definitions

- `NOT_STARTED` — Work has not begun.
- `IN_PROGRESS` — Work is currently being performed.
- `BLOCKED` — Work cannot continue because a dependency or decision is missing.
- `DONE` — Acceptance criteria have been verified.
- `NEEDS_REVIEW` — Implementation exists but requires further checking or owner review.

---

## Phase 1 — Repository Audit and SDD

### T001 — Inspect the existing repository
**Status:** BLOCKED  
**Blocked by:** T003A initialized the Git repository, but the T001 audit has not been performed. Framework, dependency, route, component, style, test, and feature inspection must still be completed and verified. Creating the project does not satisfy T001.

- [ ] Inspect the project folder and current Git status.
- [ ] Identify framework, package manager, dependencies, and scripts.
- [ ] Review existing routes, components, styles, and tests.
- [ ] Identify existing working features and missing requirements.

**Acceptance criteria:** A repository audit is recorded without unnecessary code changes.

**T003 note:** T003A created the Git repository and baseline files, but T001's own audit steps remain unchecked. This task stays BLOCKED until those steps are performed and verified; it must not be marked DONE merely because the project now exists.

### T002 — Verify the four SDD documents
**Status:** DONE

- [x] Confirm `AGENTS.md` exists.
- [x] Confirm `spec.md` exists.
- [x] Confirm `plan.md` exists.
- [x] Confirm `tasks.md` exists.
- [x] Identify contradictions or unresolved decisions.

**Acceptance criteria:** All four documents are available and important conflicts are documented.

**Verification (3 November 2026):** All four documents were present and readable. Stack, brand palette, eight collections, COD, customization, security, and admin requirements were cross-checked. Conflicts and unresolved decisions were recorded and then carried into the T003 register in `plan.md` §5. Re-verified after the approved dropshipping update; supplier requirements and pending owner decisions are now documented.

### T003 — Confirm requirements and dependencies
**Status:** DONE

- [x] Identify required owner assets.
- [x] Identify database and environment requirements.
- [x] Identify payment-provider dependencies.
- [x] Identify domain and hosting decisions.
- [x] Record the first eligible implementation task.

**Acceptance criteria:** Dependencies and the next task are documented.

**Verification (3 November 2026; updated for dropshipping):** `plan.md` §5 now records owner and supplier assets, technical dependencies, payment and settlement scope, and PENDING decisions. The bootstrap task T003A is recorded as the next implementation task. `AGENTS.md`, `spec.md`, `plan.md`, and `tasks.md` now follow the approved dropshipping model. `Agents.md` was renamed to `AGENTS.md` with content unchanged in the earlier pass. No application code, packages, database, or deployment was created.

---

## Phase 1A — Bootstrap Baseline

### T003A — Create and verify the Next.js project baseline
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
- `npm run lint` → exit 0.
- `npm run typecheck` → exit 0 on a clean tree with no `.next` directory.
- `npm run build` → exit 0; static routes `/` and `/_not-found` generated.
- No Prisma, PostgreSQL, payment provider, authentication, admin, catalogue, cart, checkout, owner/supplier data, or deployment configuration exists.
- `AGENTS.md`, `spec.md`, and `plan.md` were not modified; their SHA-256 hashes were unchanged by the bootstrap. `tasks.md` was updated only to record the verified T003A status and the still-blocked T001 audit.

**Out of scope:** Homepage, catalogue, cart, checkout, admin, Prisma/PostgreSQL, authentication, payment providers, environment secrets, production deployment.

---

## Phase 2 — Foundation and Design

### T004 — Establish the approved design system
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
- `npm run lint` → exit 0. `npm run typecheck` → exit 0. `npm run build` → exit 0.
- Built CSS contains the palette, type, spacing, surface, and focus rules.
- No products, suppliers, prices, stock, reviews, database, payments, secrets, or deployment were added.

### T005 — Implement shared site layout
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
- `components/layout/SiteLogo.tsx` provides the shared "J's Jewellery" wordmark for light and dark surfaces.
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
- `npm run lint` → exit 0. `npm run typecheck` → exit 0. `npm run check:contrast` → exit 0. `npm run build` → exit 0.
- No products, prices, suppliers, reviews, database, payments, secrets, or deployment were added.

**Known scope boundary:** Collection, search, cart, and policy destinations are linked but not implemented; they belong to T008, T011, T017, and T029. The production build initially failed because a dynamic copyright year used `new Date()` during prerender under Cache Components; it was replaced with a static copyright line rather than forcing dynamic rendering.

### T006 — Implement homepage
**Status:** NOT_STARTED

- [ ] Add hero content and Shop Now action.
- [ ] Add category navigation.
- [ ] Add New Arrivals.
- [ ] Add Best Sellers.
- [ ] Add Special Offers.
- [ ] Add appropriate empty states.

**Acceptance criteria:** Homepage sections use configured data and do not invent products or discounts.

### T007 — Verify responsive layouts
**Status:** NOT_STARTED

- [ ] Test small mobile viewport.
- [ ] Test tablet viewport.
- [ ] Test desktop viewport.
- [ ] Fix overflow, unreadable text, and broken layouts.

**Acceptance criteria:** Core pages remain usable at the tested sizes.

---

## Phase 3 — Catalogue

### T008 — Implement the eight collections
**Status:** NOT_STARTED

- [ ] Women's Jewellery.
- [ ] Men's Jewellery.
- [ ] Bracelets.
- [ ] Necklaces.
- [ ] Rings.
- [ ] Earrings.
- [ ] Pearl Jewellery.
- [ ] Customized Name Jewellery.

**Acceptance criteria:** Every collection is accessible and handles an empty catalogue correctly.

### T009 — Implement product listing
**Status:** NOT_STARTED

- [ ] Create reusable product cards.
- [ ] Display available product images.
- [ ] Display accurate names and prices.
- [ ] Display availability.
- [ ] Add useful empty states.

**Acceptance criteria:** Product cards render configured product data correctly.

### T010 — Implement product details
**Status:** NOT_STARTED

- [ ] Display product name and description.
- [ ] Display product images.
- [ ] Display current price.
- [ ] Display original price only for valid discounts.
- [ ] Display supplier-backed availability.
- [ ] Handle unknown product URLs.

**Acceptance criteria:** Detail pages show correct information and handle unavailable products safely.

### T011 — Implement search, filtering, and sorting
**Status:** NOT_STARTED

- [ ] Search by product name.
- [ ] Filter by collection.
- [ ] Add price sorting where appropriate.
- [ ] Add relevant supported filters.
- [ ] Handle zero matching products.

**Acceptance criteria:** Controls return correct results and work on mobile.

### T012 — Implement product image handling
**Status:** NOT_STARTED

- [ ] Define an appropriate image storage strategy.
- [ ] Add alternative text.
- [ ] Optimize image delivery.
- [ ] Maintain consistent image presentation.

**Acceptance criteria:** Images load appropriately and do not cause avoidable layout shifts.

---

## Phase 4 — Database and Customization

### T013 — Configure PostgreSQL and Prisma
**Status:** NOT_STARTED

- [ ] Verify database availability.
- [ ] Configure environment variables.
- [ ] Define the initial schema, including supplier, supplier-product cost, availability, and order cost-snapshot tables.
- [ ] Create and test migrations.
- [ ] Document database setup.

**Acceptance criteria:** Required records can be stored and retrieved using the configured database.

### T013A — Implement supplier and supplier-product data model
**Status:** NOT_STARTED

- [ ] Define Supplier records with internal identity, contact details, agreed terms, and status.
- [ ] Link each product to its actual supplier and record the supplier SKU.
- [ ] Store supplier cost separately from the J's Jewellery selling price.
- [ ] Calculate selling margin from verified cost and selling price.
- [ ] Record supplier availability status and the last verification timestamp.
- [ ] Prevent a published or orderable product from existing without a supplier link.
- [ ] Create and test migrations.
- [ ] Verify supplier data cannot be read through public data access.

**Acceptance criteria:** The schema supports supplier-linked products, separate supplier cost and selling price, calculated margin, and availability tracking. Migrations are tested, and no fake supplier data is created.

### T014 — Implement product and collection data access
**Status:** NOT_STARTED

- [ ] Read product records from the data layer.
- [ ] Read collection records.
- [ ] Read supplier-linked availability without exposing supplier identity or cost.
- [ ] Validate required fields.
- [ ] Handle database errors appropriately.

**Acceptance criteria:** Catalogue data comes from the configured data source rather than hardcoded fake catalogue data, and public queries expose neither supplier identity nor cost.

### T015 — Implement customization configuration
**Status:** NOT_STARTED

- [ ] Identify customizable products.
- [ ] Confirm the assigned supplier can fulfil each approved customization.
- [ ] Define approved font options.
- [ ] Define approved colour options.
- [ ] Validate customer-entered text.
- [ ] Reject unsupported options.

**Acceptance criteria:** Only valid customization choices can be submitted, and only products confirmed by their supplier are offered as customizable.

### T016 — Persist customization details
**Status:** NOT_STARTED

- [ ] Save name/text with the cart item.
- [ ] Save selected font.
- [ ] Save selected colour.
- [ ] Preserve values when the cart changes.
- [ ] Include customization in the stored order.

**Acceptance criteria:** The exact selected customization is visible in the resulting order.

---

## Phase 5 — Cart and Checkout

### T017 — Implement cart operations
**Status:** NOT_STARTED

- [ ] Add an item.
- [ ] Change quantity.
- [ ] Remove an item.
- [ ] Display item subtotals.
- [ ] Display the order total.
- [ ] Preserve product options and customization.

**Acceptance criteria:** Cart operations work and totals are consistent with server-validated prices.

### T018 — Implement price and supplier-availability validation
**Status:** NOT_STARTED

- [ ] Revalidate product prices on the server.
- [ ] Revalidate supplier availability on the server.
- [ ] Validate discount eligibility.
- [ ] Reject unavailable items.
- [ ] Prevent browser-submitted totals from being trusted.

**Acceptance criteria:** Manipulated client prices or invalid or unverified supplier availability cannot determine the final order total.

### T018A — Verify supplier availability before order acceptance and forwarding
**Status:** NOT_STARTED  
**Blocked by:** Approved supplier availability-verification method.

- [ ] Use the owner-approved verification method and freshness window.
- [ ] Record availability status, who verified it, and when.
- [ ] Block checkout acceptance when an item is unavailable or unverified.
- [ ] Recheck availability during admin order review before forwarding.
- [ ] Handle supplier cancellation or discrepancy without inventing availability.
- [ ] Test unavailable and stale-verification cases.

**Acceptance criteria:** No order can be accepted or forwarded while any item's supplier availability is unverified, stale, or unavailable.

### T019 — Implement checkout form
**Status:** NOT_STARTED

- [ ] Customer name.
- [ ] Mobile number.
- [ ] Full delivery address.
- [ ] Payment method.
- [ ] Order summary.
- [ ] Server-side validation and clear errors.

**Acceptance criteria:** Invalid or incomplete checkout submissions are rejected with useful messages.

**PENDING OWNER CONFIRMATION:** who collects payment and who pays delivery charges. Do not present either as confirmed at checkout.

### T020 — Implement Cash on Delivery
**Status:** NOT_STARTED

- [ ] Add COD as an available payment method.
- [ ] Save the selected payment method.
- [ ] Keep customer payment status separate from order status and supplier settlement.
- [ ] Show clear checkout information without claiming the settlement workflow is confirmed.
- [ ] Record the COD settlement workflow as PENDING until the owner approves it.

**Acceptance criteria:** A valid COD order can be created without falsely claiming that payment has been received or that supplier settlement is resolved.

**PENDING OWNER CONFIRMATION:** whether the supplier or J's Jewellery collects COD payment, who pays the supplier, and when.

### T021 — Implement order creation
**Status:** NOT_STARTED

- [ ] Create a unique order reference.
- [ ] Save customer and delivery details.
- [ ] Save item and price snapshots.
- [ ] Save the assigned supplier, supplier-cost snapshot, selling-price snapshot, and calculated margin per item.
- [ ] Save customization details.
- [ ] Save shipping and total amounts.
- [ ] Handle duplicate submissions safely.

**Acceptance criteria:** A successful submission creates one persistent, internally consistent order with traceable supplier and cost snapshots.

### T022 — Implement order confirmation
**Status:** NOT_STARTED

- [ ] Display order reference.
- [ ] Display a safe order summary without supplier details.
- [ ] Provide the next steps without claiming the supplier has confirmed or shipped the order.
- [ ] Handle failed order creation.

**Acceptance criteria:** Confirmation is shown only after successful order creation and never implies unverified supplier fulfilment.

---

## Phase 6 — Secure Administration

### T023 — Implement administrator authentication
**Status:** NOT_STARTED

- [ ] Select a suitable authentication approach.
- [ ] Securely hash passwords if password authentication is used.
- [ ] Implement secure session handling.
- [ ] Configure protected routes and server operations.

**Acceptance criteria:** Unauthorized visitors cannot access protected administration functions.

### T024 — Enforce server-side authorization
**Status:** NOT_STARTED

- [ ] Verify permissions on protected reads.
- [ ] Verify permissions on protected mutations.
- [ ] Protect order and customer information.
- [ ] Protect supplier identity, contacts, costs, agreements, and margins.
- [ ] Test unauthorized requests.

**Acceptance criteria:** Access control does not rely solely on hidden buttons or client-side checks, and supplier data is unavailable to unauthorized users.

### T025 — Implement product administration
**Status:** NOT_STARTED

- [ ] Create products.
- [ ] Edit products.
- [ ] Manage images with confirmed usage rights.
- [ ] Assign collections.
- [ ] Update selling prices and genuine discounts.
- [ ] Update availability from verified supplier status.
- [ ] Configure customization choices only after supplier confirmation.
- [ ] Ensure supplier fields are never exposed on customer-facing pages.

**Acceptance criteria:** Authorized administrators can manage products and changes persist without exposing supplier data.

### T025A — Implement supplier management in admin
**Status:** NOT_STARTED

- [ ] Create and edit supplier records.
- [ ] Record supplier contact details, agreed terms, and status internally.
- [ ] Restrict supplier management to authorized admins.
- [ ] Keep an audit trail of supplier-record changes.
- [ ] Prevent supplier data from appearing on public pages or APIs.
- [ ] Do not create fake suppliers or imply an automatic integration.

**Acceptance criteria:** Authorized admins can manage real supplier records, changes persist, and unauthorized users cannot read supplier data.

### T025B — Assign products to suppliers and record costs, prices, and margin
**Status:** NOT_STARTED

- [ ] Assign each product to its actual supplier.
- [ ] Record the supplier SKU.
- [ ] Record supplier cost separately from the J's Jewellery selling price.
- [ ] Calculate selling margin from verified values.
- [ ] Preserve cost history or snapshots when supplier cost changes.
- [ ] Prevent publishing or ordering a product without a supplier link and verified cost.
- [ ] Verify supplier cost and margin remain private.

**Acceptance criteria:** Every orderable product is linked to its supplier with separate, traceable cost and selling-price values and a correctly calculated margin.

### T026 — Implement order administration
**Status:** NOT_STARTED

- [ ] View orders.
- [ ] View relevant order details and supplier assignments.
- [ ] View customization details.
- [ ] Confirm or cancel orders after admin review.
- [ ] Update approved customer-facing statuses only with supporting evidence.
- [ ] Record customer payment verification and supplier settlement separately.

**Acceptance criteria:** Authorized staff can manage orders and unauthorized users cannot, without advancing statuses on unverified assumptions.

### T026A — Forward orders to suppliers and record evidence
**Status:** NOT_STARTED

- [ ] Review the order and verify supplier availability before forwarding.
- [ ] Use the owner-approved supplier order-transmission method.
- [ ] Record the forwarding method, timestamp, authorized admin, reference, and what was sent.
- [ ] Prevent duplicate forwarding of the same order.
- [ ] Advance to "Forwarded to Supplier" only after the forward is actually recorded.
- [ ] Share only the minimum customer delivery information required.
- [ ] Handle failed or disputed forwarding honestly.

**Acceptance criteria:** An order can be forwarded through the approved method with a complete audit record, and no supplier forwarding is claimed without evidence.

### T026B — Track supplier fulfilment and update customer status
**Status:** NOT_STARTED

- [ ] Maintain supplier-fulfilment status separately from the customer-facing status.
- [ ] Record supplier confirmations, shipping evidence, delivery evidence, delays, cancellations, and discrepancies.
- [ ] Update the customer-facing status only when evidence supports the change.
- [ ] Display an order status timeline without exposing supplier details.
- [ ] Handle supplier cancellation or non-fulfilment without inventing shipment data.
- [ ] Test status transitions and evidence requirements.

**Acceptance criteria:** Supplier fulfilment is traceable, and customer-facing statuses advance only with recorded evidence.

### T027 — Implement basic reports
**Status:** NOT_STARTED

- [ ] Show order counts from real records.
- [ ] Calculate sales from stored order data.
- [ ] Define treatment of cancelled, returned, and refunded orders.
- [ ] Handle empty data.
- [ ] Avoid fabricated report values.

**Acceptance criteria:** Report totals can be traced to actual stored records and documented calculation rules.

### T027A — Record supplier costs, delivery costs, and calculate actual profit
**Status:** NOT_STARTED  
**Blocked by:** Approved supplier settlement and delivery-cost responsibility.

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

---

## Phase 7 — Customer Support and Policies

### T028 — Implement privacy-preserving order tracking
**Status:** NOT_STARTED

- [ ] Define a safe lookup method.
- [ ] Avoid relying on a guessable order number alone.
- [ ] Display only the information appropriate to the customer.
- [ ] Show valid customer-facing statuses without exposing supplier identity, cost, or contacts.
- [ ] Do not display a supplier status until it is supported by recorded evidence.

**Acceptance criteria:** A customer cannot retrieve another customer's private order information using a guessed reference or see internal supplier data.

### T029 — Add privacy and return/exchange policy pages
**Status:** NOT_STARTED

- [ ] Create the required page routes.
- [ ] Add owner-approved policy text.
- [ ] Include approved disclosure of customer data shared with suppliers for fulfilment.
- [ ] Clearly identify returns, exchanges, and damaged-product responsibility as PENDING until the owner approves it.
- [ ] Clearly identify any content still awaiting approval.
- [ ] Link policies from the footer and checkout where appropriate.

**Acceptance criteria:** Policy pages are accessible, do not invent legal or business commitments, and do not misstate supplier or returns responsibilities.

### T030 — Configure WhatsApp contact
**Status:** NOT_STARTED

- [ ] Obtain the approved business number.
- [ ] Configure the contact link.
- [ ] Test the link on mobile and desktop.
- [ ] Avoid exposing an unapproved number.

**Acceptance criteria:** The link opens the intended business contact when configured.

### T031 — Implement reviews if approved for MVP
**Status:** NOT_STARTED

- [ ] Define the review submission model.
- [ ] Add moderation or approval status.
- [ ] Prevent fabricated review content.
- [ ] Display only approved genuine reviews.

**Acceptance criteria:** Reviews shown publicly are genuine submitted content and are handled according to the approved workflow.

---

## Phase 8 — SEO and Integrations

### T032 — Implement page metadata
**Status:** NOT_STARTED

- [ ] Add page titles.
- [ ] Add descriptions.
- [ ] Configure canonical URLs where appropriate.
- [ ] Add social-sharing metadata.

**Acceptance criteria:** Main pages have appropriate, non-duplicated metadata.

### T033 — Implement sitemap and robots rules
**Status:** NOT_STARTED

- [ ] Generate a sitemap.
- [ ] Verify public page inclusion.
- [ ] Exclude private admin pages and sensitive endpoints.
- [ ] Verify robots behaviour.

**Acceptance criteria:** Sitemap and robots responses match the approved indexation strategy.

### T034 — Implement accurate structured data
**Status:** NOT_STARTED

- [ ] Add appropriate product structured data.
- [ ] Use real prices and availability.
- [ ] Avoid invented ratings or reviews.
- [ ] Validate generated output.

**Acceptance criteria:** Structured data reflects actual configured product information.

### T035 — Document marketing integrations
**Status:** NOT_STARTED

- [ ] Record Meta Pixel requirements.
- [ ] Record Google Analytics requirements.
- [ ] Record Instagram integration needs.
- [ ] Identify required credentials and consent behaviour.
- [ ] Integrate only approved, configured services.

**Acceptance criteria:** Integrations are labelled accurately as working, pending, or blocked.

### T036 — Evaluate payment-provider integrations
**Status:** NOT_STARTED

- [ ] Document the COD settlement workflow as PENDING until the owner confirms who collects payment and who pays the supplier.
- [ ] Verify Easypaisa merchant/API requirements.
- [ ] Verify JazzCash merchant/API requirements.
- [ ] Define bank-transfer verification.
- [ ] Document customer-payment and supplier-settlement responsibilities separately.
- [ ] Document provider access and approval dependencies.
- [ ] Test real integrations only when authorized and credentials are available.

**Acceptance criteria:** No payment provider or settlement workflow is described as working without a tested implementation and owner-approved terms.

---

## Phase 9 — Quality Assurance

### T037 — Run static checks
**Status:** NOT_STARTED

- [ ] Run linting.
- [ ] Run TypeScript checks.
- [ ] Run the production build.
- [ ] Resolve or document failures.

**Acceptance criteria:** Relevant checks pass, or remaining failures are clearly documented.

### T038 — Test the customer journey
**Status:** NOT_STARTED

- [ ] Browse collections.
- [ ] Search for products.
- [ ] Open product details.
- [ ] Add/remove items from the cart.
- [ ] Change quantities.
- [ ] Customize an eligible product.
- [ ] Submit valid and invalid checkout forms.
- [ ] Place a COD test order.
- [ ] Verify order persistence and confirmation.
- [ ] Verify no supplier identity, cost, contact, or margin appears publicly.

**Acceptance criteria:** The full test journey works using test data and no real customer orders are created accidentally.

### T038A — Test the complete dropshipping order journey
**Status:** NOT_STARTED

- [ ] Create approved test supplier and supplier-linked product records; do not invent production suppliers.
- [ ] Assign supplier, cost, selling price, and availability.
- [ ] Verify unavailable or stale availability is blocked.
- [ ] Place a test COD order.
- [ ] Review the order and verify availability in admin.
- [ ] Record test forwarding through the approved method without contacting a real supplier unless authorized.
- [ ] Record supplier fulfilment evidence and update the customer-facing status.
- [ ] Record customer payment, supplier cost, delivery cost, supplier settlement, and actual profit.
- [ ] Verify supplier details remain private throughout.
- [ ] Confirm no automatic integration or shipment is claimed without evidence.

**Acceptance criteria:** The complete dropshipping journey works end to end with approved test data, from supplier-product setup through order forwarding, fulfilment tracking, and traceable profit recording.

### T039 — Test security and authorization
**Status:** NOT_STARTED

- [ ] Test unauthorized admin access.
- [ ] Test invalid inputs.
- [ ] Test manipulated prices.
- [ ] Test unavailable or unverified supplier availability.
- [ ] Test private order access controls.
- [ ] Test supplier data exposure through pages, APIs, errors, and logs.
- [ ] Check secret handling and logs.

**Acceptance criteria:** Relevant access and validation checks pass and identified risks are documented, including any supplier-data exposure risk.

### T040 — Test responsive design and accessibility
**Status:** NOT_STARTED

- [ ] Check mobile layouts.
- [ ] Check tablet layouts.
- [ ] Check desktop layouts.
- [ ] Test keyboard navigation.
- [ ] Check labels and contrast.
- [ ] Check image alternative text.

**Acceptance criteria:** Core pages are usable across tested sizes and basic accessibility checks are satisfied.

### T041 — Review performance
**Status:** NOT_STARTED

- [ ] Check image sizes and loading.
- [ ] Review avoidable client-side JavaScript.
- [ ] Measure page performance.
- [ ] Record the test environment and results.

**Acceptance criteria:** Measured results and known performance limitations are documented.

---

## Phase 10 — Release Preparation

### T042 — Prepare deployment configuration
**Status:** NOT_STARTED

- [ ] Select the approved hosting provider.
- [ ] Configure environment variables.
- [ ] Configure production database access.
- [ ] Verify migration and recovery procedures.
- [ ] Confirm domain requirements.

**Acceptance criteria:** Deployment prerequisites are documented without exposing secrets.

### T043 — Complete release review
**Status:** NOT_STARTED

- [ ] Review specification acceptance criteria.
- [ ] Review security and test results, including supplier-data privacy.
- [ ] Confirm approved supplier list, agreements, costs, and order-transmission method.
- [ ] Confirm settlement, delivery-cost, and returns decisions are approved or clearly marked PENDING.
- [ ] List unfinished tasks.
- [ ] List external dependencies.
- [ ] Prepare owner handover notes.

**Acceptance criteria:** The owner receives an accurate readiness report covering the dropshipping workflow and unresolved supplier decisions.

### T044 — Obtain production approval
**Status:** NOT_STARTED

- [ ] Present release readiness to the owner.
- [ ] Confirm the approved supplier workflow, settlement, delivery, and returns terms.
- [ ] Confirm production settings and domain.
- [ ] Obtain explicit approval before publishing.
- [ ] Record the deployment result if authorized.

**Acceptance criteria:** Production deployment is performed only after explicit approval.

---

## Identified Task Gaps — To Schedule

These gaps were found during T003 and the dropshipping update. They are recorded here but are **not approved or scheduled** yet. Prefer extending the existing task where noted rather than renumbering the tracker.

1. **Bootstrap baseline** — added as T003A.
2. **Cart persistence/session model** — T017 covers cart operations but not persistence across reloads or the chosen session model. Extend T017.
3. **Admin role model** — T023/T024 cover authentication and authorization but not the owner/staff role decision or least-privilege boundaries. Extend T023/T024 after the owner decision.
4. **Real data and supplier onboarding** — no task covers loading owner-approved supplier records, products, collections, images, costs, and availability, or confirming image usage rights. Add a data-loading task before catalogue completion; do not invent data.
5. **Reviews decision** — T031 is conditional. It must not start until the owner confirms whether reviews are in the MVP and approves moderation.
6. **Notifications** — email/SMS are not required by the specification. Add a task only if the owner approves them.
7. **Release-gate checklist and rollback verification** — T043/T044 cover handover and approval but not an explicit gate checklist or tested recovery procedure. Extend T043.
8. **Order-tracking lookup method** — T028 exists but the privacy-preserving lookup method is undecided. Extend T028 after the owner decision.
9. **Supplier settlement, delivery-cost, and returns decisions** — PENDING owner confirmation. T027A and real customer-order processing cannot be completed until these are approved.

Supplier-specific work is now covered by T013A, T018A, T025A, T025B, T026A, T026B, T027A, and T038A.

---

## Current Execution Rule

T005 is complete and verified. The next task is **T006 — Implement homepage**, which requires owner approval before it starts.

Do not start T006 or any feature task until the owner approves the verified shared layout.

Supplier-related sequence after their prerequisites: **T013A → T018A → T025A → T025B → T026A → T026B → T027A → T038A**. Do not skip the supplier data model or availability verification.

T001 remains **BLOCKED**. The repository now exists, but the T001 audit has not been performed. Re-verify T001 as its own task rather than assuming it passed.

Do not change any task to DONE until its acceptance criteria have been verified.
