
# J's Jewellery — Development Plan

**Target duration:** 14 calendar days  
**Status:** Revised during T003 (3 November 2026) for a greenfield dropshipping project; awaiting owner review.  
**Business model:** Approved dropshipping. J's Jewellery sells supplier-owned products under its own branding and forwards customer orders to suppliers for fulfilment. J's Jewellery does not own the products or inventory.  
**Project condition:** Greenfield. The project folder contains documentation only. No application code, Git repository, dependencies, database, hosted services, or deployment exists yet.  
**Baseline prerequisite:** T003A must create and verify the Next.js project baseline before T004 begins.

## 1. Goal

Deliver a tested, mobile-first jewellery e-commerce MVP using Next.js, TypeScript, Tailwind CSS, PostgreSQL, and Prisma.

The store operates as a dropshipping business: supplier-owned products are listed under J's Jewellery branding, customer orders are reviewed and forwarded to the relevant supplier, and J's Jewellery tracks supplier fulfilment and records its selling margin.

The goal is a working, maintainable foundation—not a visual demo with fake functionality.

Because this is a greenfield project, the first implementation step is a documented bootstrap (T003A), not an inspection of an existing application.

## 2. Delivery Principles

- Follow `AGENTS.md` and `spec.md`.
- Treat this as a greenfield project: there is no application code to inspect or repair.
- Create and verify the T003A baseline before implementing features.
- Work in small, verifiable increments.
- Implement required customer journeys before optional enhancements.
- Prioritize security and correct order totals.
- Treat J's Jewellery as a dropshipping storefront: do not assume it owns products or inventory.
- Keep supplier identity, costs, contacts, agreements, and internal margins private.
- Track supplier availability and fulfilment honestly; never claim a status without evidence.
- Track third-party dependencies early.
- Do not deploy or enable live services without approval.
- Update `tasks.md` only after verification.

## 3. Proposed Architecture

### Bootstrap baseline (T003A — required before T004)

No Next.js project exists yet. T003A creates the baseline only: Next.js App Router, TypeScript in strict mode, Tailwind CSS, ESLint, Git initialization, approved baseline dependencies only, `.env.example` with placeholders only, and a successful production build. It must not add features, database connections, memory-only or fake data layers, payment logic, owner data, or deployment.

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

Finalize the schema after T003A and after the supplier agreement, order/payment settlement, and owner data decisions are approved.

### Data readiness

Catalogue, homepage merchandising, reports, and policy pages depend on real owner and supplier data or approved policy wording. Until those arrive, use clearly labelled placeholders or empty states. Do not seed invented products, suppliers, prices, costs, discounts, reviews, Best Seller rankings, or policy commitments.

### Infrastructure
- Environment-based configuration.
- `.env.example` containing placeholders only.
- Git version control.
- Automated build and test checks.
- Deployment preparation for an approved hosting provider.

## 4. Fourteen-Day Schedule

### Day 1 — Requirements and Dependency Confirmation
- Confirm the greenfield condition and that no application repository exists.
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

### Day 6 — Database and Data Access
- Finalize the initial schema, including suppliers, supplier-product cost data, supplier availability, and order cost snapshots.
- Configure Prisma and PostgreSQL.
- Create migrations.
- Implement data access and server-side validation.
- Restrict supplier and cost data to authorized use.
- Document environment requirements.

**Deliverable:** Persistent data foundation.

### Day 7 — Cart
- Implement add-to-cart.
- Implement quantity changes and item removal.
- Persist product options and customization.
- Display item subtotals and totals.
- Handle unavailable products and changed prices.
- Recheck supplier availability before checkout.

**Deliverable:** Working cart.

### Day 8 — Checkout and COD Orders
- Implement checkout fields and validation.
- Recalculate totals on the server.
- Implement order creation and unique order references.
- Prevent duplicate submissions.
- Save order items and customization snapshots.
- Save the assigned supplier, supplier-cost snapshot, selling-price snapshot, and calculated margin per item.
- Implement COD as the required MVP payment method. The COD settlement workflow remains PENDING.

**Deliverable:** Verified COD order journey.

### Day 9 — Secure Admin Access
- Implement or refine secure admin authentication.
- Enforce server-side authorization.
- Build the basic dashboard.
- Verify that public users cannot perform admin actions.

**Deliverable:** Protected admin area.

### Day 10 — Supplier and Product Administration
- Implement internal supplier records: identity, contacts, agreed terms, and status.
- Assign each product to its actual supplier and record supplier SKU.
- Record supplier cost and J's Jewellery selling price separately.
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
- Add policy pages using owner-approved content; label supplier returns/damage responsibility as PENDING until approved.
- Configure WhatsApp contact if the number is supplied.
- Add metadata, sitemap, robots rules, and appropriate structured data.
- Review image optimization.
- Document Meta Pixel, Google Analytics, Instagram, Easypaisa, JazzCash, bank-transfer, and supplier order-transmission requirements.
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

All items below are PENDING unless explicitly marked confirmed. The owner must supply or approve them; the implementation must not invent them.

| Item | Status | Needed for |
|---|---|---|
| Logo file | PENDING | Header, footer, favicon, social sharing |
| Real product photos | PENDING | Catalogue, product details, homepage |
| Product names, descriptions, prices, supplier availability | PENDING | Catalogue, cart, checkout, orders, SEO |
| Supplier identities and contact details | PENDING | Internal supplier records; never public |
| Supplier agreements and fulfilment terms | PENDING | Dropshipping workflow and release gate |
| Supplier product/SKU data and image usage rights | PENDING | Catalogue setup and product images |
| Supplier cost per product | PENDING | Margin and profit calculations |
| Supplier availability verification method and frequency | PENDING | Availability checks before accepting/forwarding |
| Supplier order-transmission method (manual, WhatsApp, or other) | PENDING | Order forwarding workflow |
| Customer payment collection and supplier settlement | PENDING | COD and payment workflow |
| Delivery-cost responsibility | PENDING | Checkout, order totals, profit |
| Returns, exchanges, and damaged-product responsibility | PENDING | Policies and supplier workflow |
| COD settlement workflow | PENDING | COD order handling |
| Approved customization fonts and colours | PENDING — exact fonts/colours not supplied | Custom-name jewellery |
| WhatsApp business number | PENDING | Contact link |
| Privacy policy wording | PENDING | Policy page, footer, checkout |
| Return/exchange policy wording | PENDING | Policy page, footer, checkout |
| Domain name | PENDING | Deployment, canonical URLs |
| Hosting provider/account | PENDING | Deployment |
| Bank details and bank-transfer verification workflow | PENDING | Bank-transfer payment |
| Easypaisa merchant/API access | PENDING — approval not verified | Easypaisa payment |
| JazzCash merchant/API access | PENDING — requirements not confirmed | JazzCash payment |
| Reviews in MVP | PENDING | Review scope |
| Definition of "Best Seller" | PENDING — manual flag vs sales-derived | Homepage merchandising |
| Free delivery / PKR 0 shipping confirmation | PENDING — owner indicated free delivery; exceptions not confirmed | Checkout, order totals |
| Admin role model | PENDING — single owner/admin assumed as minimum | Admin authentication and authorization |
| Order and payment status workflow | PENDING — suggested statuses in `spec.md` need approval | Orders, admin, reports |
| Order-tracking lookup method | PENDING | Order tracking |
| Email/SMS notifications | PENDING — not required for MVP unless approved | Notifications |
| Analytics/Meta Pixel IDs and consent approach | PENDING | Marketing integrations |
| Tax rules, if any | PENDING — none specified | Cart totals |

### 5.2 Technical dependencies

- **PostgreSQL:** provider/host, connection string, and local-vs-managed approach are PENDING. No PostgreSQL service or `psql` client was found in the current environment.
- **Environment variables:** exact names to be defined with the schema. `.env.example` may contain placeholders only, never real credentials.
- **Prisma:** schema, migrations, seed strategy (approved data only), and client setup follow the database decision.
- **Image storage:** local project storage vs object storage is PENDING; this affects product images and hosting.
- **Supplier data model:** supplier records, supplier-product links, cost history/snapshots, availability checks, and forwarding evidence must be stored internally with restricted access.
- **Supplier order transmission:** manual admin forwarding unless the owner approves a specific channel or integration. Do not assume an API exists.
- **Supplier availability:** a verification method must be approved before orders can be accepted or forwarded.
- **Supplier-image rights:** permission to use supplier images must be confirmed before publication.
- **Authentication:** the owner/admin authentication approach is PENDING. Passwords must be hashed and sessions secured if password authentication is used.
- **Hosting:** Vercel or a compatible platform; account, environment configuration, and production database access are PENDING.
- **Runtime verified during T003:** Node `v24.21.0`, npm `11.19.0`. No database client detected.
- **Build and test tooling:** lint, type check, production build, and appropriate tests at each milestone.
- **Git:** the repository must be initialized by T003A.
- **Domain/DNS and production secrets:** PENDING owner decisions.
- **Documentation filename:** normalized to `AGENTS.md` for case-sensitive deployment environments.

### 5.3 Payment scope

- **Cash on Delivery (COD):** required for the MVP. A COD order must not be marked paid at creation. The settlement workflow—who collects payment, who pays the supplier, and when—is PENDING OWNER CONFIRMATION.
- **Customer payment vs supplier settlement:** record separately. Do not assume J's Jewellery collects the customer payment or pays the supplier until the owner confirms the workflow.
- **Bank transfer:** may be offered only after the owner supplies approved bank details and a manual verification workflow. Payment remains unverified until an authorized person checks it.
- **Easypaisa:** requested, but merchant/API access and approval are not verified. Do not implement or describe it as working until access exists and the integration is tested.
- **JazzCash:** requested, but requirements and access are unconfirmed. PENDING.
- **Cards:** do not store card details. No card payment scope is approved.
- Payment status must remain separate from order/fulfilment status.
- Never claim an untested payment integration is working.
- Do not simulate a successful online payment.

### 5.4 Unresolved decisions (PENDING)

All items require **PENDING OWNER CONFIRMATION** unless already approved elsewhere.

- Does the supplier collect payment from the customer, or does J's Jewellery collect it?
- Who pays the supplier, and when?
- Who pays delivery charges?
- Who handles returns, exchanges, and damaged products?
- How will suppliers receive orders: manually through admin, WhatsApp, or another approved method?
- Which suppliers are approved, and what are their agreed terms and costs?
- Which supplier-product data and images may J's Jewellery publish?
- How and how often will supplier availability be verified?
- Are customer reviews included in the MVP?
- What qualifies a product as a Best Seller: a manual merchandising flag or a sales-derived ranking?
- Is free delivery / PKR 0 shipping confirmed for all orders, and are there exceptions?
- What image storage approach is approved?
- What cart persistence and session model is approved, given that customer accounts are not required?
- Which order and payment statuses are approved, and who may perform each transition?
- Is a single owner/admin role sufficient, or are additional staff roles required?
- How will customers look up orders without exposing another customer's data?
- Are email or SMS notifications required for the MVP?
- Are taxes or other charges applicable? None are specified.
- Which products and options are customizable, and what are the exact approved fonts and colours?
- What policy wording and legal review will the owner provide?
- What domain and hosting provider are approved?
- Which payment integrations, if any, must be live at launch?
- What approval and moderation workflow applies to reviews, if included?

### 5.5 Risk handling

- If an external provider is unavailable, document the blocker and continue independent work.
- Do not fake a successful payment or integration.
- If owner data is late, use empty states and continue with independent work; do not seed fake inventory or supplier records.
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
