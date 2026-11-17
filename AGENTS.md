
# AGENTS.md — JS Jewellers

## 1. Project Overview

Build a professional, premium online jewellery store named **JS Jewellers** for customers in Pakistan.

The website must be mobile-friendly, accessible, secure, search-engine friendly, and suitable for eventual production deployment.

The website must support browsing products, searching and filtering, shopping carts, customer checkout, order management, custom-name jewellery, and an administrative dashboard.

### 1.1 Approved business model — dropshipping

JS Jewellers is a dropshipping e-commerce store. It does **not** own the products it sells.

Permanent rules:

- Follow the dropshipping business model in all design, implementation, and operational decisions.
- Do not assume JS Jewellers owns the products, inventory, or supplier relationships.
- Do not invent suppliers, supplier products, stock, prices, costs, agreements, or delivery promises.
- Every published product must be linked internally to its actual supplier before it can be ordered.
- Keep supplier identities, costs, contact details, agreements, and internal margins private.
- Customer-facing pages must show JS Jewellers branding only. Do not expose supplier details or present the store as a marketplace.
- Supplier availability must be verified before an order is accepted or forwarded.
- Supplier fulfilment must be tracked honestly. Record what was actually sent to the supplier and any evidence received.
- Never claim an order is confirmed, forwarded, shipped, or delivered without evidence.
- Do not create fake supplier accounts or pretend that supplier systems are integrated automatically. Supplier order transmission is manual unless an approved integration exists.
- Share only the minimum customer delivery information required for supplier fulfilment.
- This is not a multi-vendor marketplace. Supplier management is an internal administrative function.

## 2. Source of Truth

Follow these documents in this order:

1. `AGENTS.md` — development rules and constraints.
2. `spec.md` — approved product requirements and acceptance criteria.
3. `plan.md` — implementation sequence and milestones.
4. `tasks.md` — task list and task status.

`constitution.md` and `specification.md` do not exist in this repository. `spec.md` is the current product specification, and the four documents above are the governing SDD set. Do not treat the missing filenames as missing requirements.

If code and documentation disagree, do not silently choose one. Explain the conflict and request clarification when it affects an approved requirement.

Do not mark a task DONE until its acceptance criteria have been checked and the result verified.

## 3. Technology Stack

- Next.js using the App Router.
- TypeScript with strict type checking.
- Tailwind CSS for styling.
- PostgreSQL for persistent application data.
- Prisma ORM for database access and migrations.
- Secure server-side authentication and authorization for administrators.
- Git for version control.
- Vercel or another compatible hosting provider for deployment, after approval.

Current repository state (verified in T003B, 4 November 2026):

- The Next.js App Router application already exists, and the T003A baseline is complete and verified.
- PostgreSQL 18 is installed locally, and the owner-approved T013 scope is **infrastructure-only**: the dedicated `js_jewellers_app` role, `js_jewellers` database, Prisma 7 packages, `prisma.config.ts`, and the migration workflow. T013 itself created no domain tables; later owner-approved T013A/T052 migrations added the supplier, product, order, payment, return, and admin schema.
- Supplier, product, stock, cost, agreement, order, payment, return, and administrator-account **data** remain dependent on owner-approved inputs. The schema and workflows exist, but do not invent records or describe the project as having a production database. T013A real onboarding remains blocked until approved supplier data is supplied.
- Do not put credentials in tracked files, print them, or commit `.env.local`; `.env.local` is ignored by Git.
- The domain is not finalized. Vercel is only a future hosting option; do not deploy.

Do not replace an existing implementation or install dependencies beyond the approved baseline without approval.

## 4. Brand Identity

Brand name: JS Jewellers. Use this exact name in website text and metadata.

Logo: the owner's existing logo is supplied at `public/Luxury Gold Jewelry Monogram Logo.png` and must be used exactly as provided. Do not create a new logo, and do not replace or substitute it with text such as "JS" or "JS Jewellers". Do not redraw, crop, recolour, regenerate, overwrite, or otherwise modify the source file; preserve its aspect ratio. The header keeps the logo at its existing size. The footer may show the logo enlarged and centred in a fixed square stage with the approved slow rotation.

Approved Black Gold Galaxy palette (owner-approved 5 November 2026):

- Deep Black: `#050505`
- Charcoal: `#111111`
- Dark Gold Shadow: `#17120C`
- Dark Brown: `#20170D`
- Bronze Brown: `#443019`
- Antique Gold: `#80602C` (decorative only)
- Luxury Gold: `#C29A45`

White `#FFFFFF` and champagne `#E8DCC5` remain the approved text colours in the dark theme.

Theme modes (owner-approved 5 November 2026): Black Gold Galaxy is the default dark theme; an opt-in light theme uses warm ivory surfaces, espresso text, and the darker `#7A5A1E` accent for readable gold text. The seven brand colours above stay exact and are used for borders, backgrounds, and decoration in both modes. The theme choice persists in `localStorage` under `js-theme` and must apply before first paint.

Design direction:

- Premium, elegant, minimal jewellery-store appearance with a dark Black Gold Galaxy theme by default and a designed ivory-and-gold light option.
- Editorial italic display headings with readable, upright sans-serif body text.
- Gold should be used selectively for emphasis and may carry normal text only on approved dark surfaces.
- Antique Gold is decorative only; do not use it for normal-sized text or as a border over bronze.
- Luxury Gold on bronze is limited to large text or short labels.
- Gold buttons use deep-black text and a white/champagne focus indicator.
- The homepage background is solid pure black `#000000` in the dark theme (owner-approved 10 November 2026): the owner-supplied shopping-cart background image at `public/images/homepage-shopping-background.png` is retired in the dark theme, and no image, gradient, overlay, or decorative grid may sit behind homepage content there. In the light theme the homepage keeps the exact existing treatment — the same image displayed full-viewport with `background-size: cover`, centred, under the same minimal ivory readability veil. The layer is decorative, static, and non-interactive. Every non-homepage route retains its existing approved smooth `172deg` gradient behind a subtle black-and-gold geometric grid. The homepage background changes no logo, hero artwork, hero content, header/navigation, section order, cards, footer, typography, or theme behaviour. Do not add new brand colours.
- Decorative backgrounds are rendered behind content with `pointer-events: none` and `aria-hidden`, must not cause overflow, and must never carry text, jewellery, logos, navigation, or controls.
- Continuous animation is prohibited except the owner-approved 34-second footer logo rotation. It must stop under `prefers-reduced-motion: reduce`, stay behind content, and never capture pointer events.
- Use consistent product-image proportions.
- Design mobile-first, then verify tablet and desktop layouts.
- Maintain readable contrast, visible keyboard focus, and accessible controls.

## 5. Required Collections

Implement these eight collections:

1. Women's Jewellery
2. Men's Jewellery
3. Bracelets
4. Necklaces
5. Rings
6. Earrings
7. Pearl Jewellery
8. Customized Name Jewellery

Use real, owner-approved supplier product records. Do not invent real-looking products, suppliers, reviews, orders, sales figures, or customer testimonials. Do not copy supplier product data or images unless the owner confirms the right to use them.

Development placeholders must be clearly identified and must not be presented as genuine supplier-backed catalogue data.

### 5.1 Demo catalogue exception — development and preview only

The owner has approved demo products and demo images for development and preview. This is a narrow, documented exception to the no-invented-data rules above:

- Demo content must be clearly and visibly labelled as demo content.
- Demo products must **not** be orderable. Do not enable cart, checkout, or order placement for demo products.
- Do not present demo prices, stock, suppliers, or images as genuine business information.
- Do not create real-looking supplier records, supplier costs, or availability claims for demo items.
- The restrictions against invented real supplier data, fake reviews, and fake sales evidence remain in force.

Demo content is not a production catalogue, and it must not be published as one.

## 6. Core Functional Requirements

- Professional homepage with jewellery imagery.
- New Arrivals section.
- Best Sellers section based on genuine sales data or clearly defined manual merchandising.
- Special Offers section based on real configured discounts.
- Product collections and product detail pages.
- Product images, names, descriptions, prices, availability, and applicable options.
- Internal supplier records linked to every published product.
- Supplier cost and JS Jewellers selling price stored separately, with margin calculated from verified values.
- Supplier availability verification before accepting or forwarding an order.
- Original and discounted prices when a valid discount exists.
- Search, filtering, and sorting.
- Shopping cart with quantity updates and item removal.
- Checkout form with customer name, mobile number, and full delivery address.
- Order confirmation and persistent order records.
- Custom-name jewellery with customer-entered name, available font, and available colour.
- Save customization details with the cart item and order item.
- Bank Transfer (Islamic Bank) — approved payment method; account details remain server-only and are pending secure supply.
- Easypaisa — approved payment method; account details remain server-only and are pending secure supply.
- No other payment method is in the approved list. Cash on Delivery, JazzCash, and card payments are not part of the current approved scope.
- WhatsApp contact using an owner-provided number.
- Order-status tracking.
- Genuine customer reviews and ratings only if the owner approves reviews for the MVP.
- Return/exchange policy and privacy policy pages.
- Secure administrative product, supplier, availability, order, and profit management.
- Sales and profit reports calculated from actual order data and recorded supplier costs.
- SEO metadata, sitemap, robots rules, and structured data where appropriate.
- Analytics and marketing integrations only when configured with valid owner-provided credentials and applicable consent requirements.

## 7. Architecture and Code Quality

- Use reusable components and a clear folder structure.
- Keep TypeScript types accurate; avoid `any` unless justified.
- Validate all user input on the server.
- Enforce authorization on every protected administrative operation.
- Never rely only on client-side checks for security.
- The website owner owns administrator access. Never create, seed, or keep a developer administrator account, and never run the setup or bootstrap flow to create an account on the owner's behalf. The owner creates the first Super Admin during handover.
- Only the active Super Admin role may manage administrator accounts or role permissions. `users.manage` and `roles.manage` are reserved for that role and must never be granted to another role; enforce this on the server, not only in the UI.
- Store money as integer minor units where appropriate, with an explicit currency.
- Store supplier cost, customer selling price, delivery cost, customer payment, and actual profit as separate values. Do not derive one from an unverified assumption.
- Use PKR for the Pakistan storefront unless the owner approves otherwise.
- Never automatically convert currencies without an approved exchange-rate requirement.
- Calculate totals and validate prices on the server.
- Do not trust prices, discounts, order totals, or admin permissions supplied by the browser.
- Handle loading, empty, validation, and error states.
- Use database migrations for schema changes.
- Keep secrets in environment variables, never in source code.
- Add `.env.example` with placeholder names only, never real credentials.
- Do not log passwords, secrets, or unnecessary personal information.

## 8. Payments and Orders

The client-approved payment methods are **Bank Transfer (Islamic Bank)** and **Easypaisa** only. No other payment method is in the approved scope.

Cash on Delivery is not part of the current approved list. Do not implement or offer it unless the owner separately approves it and its settlement workflow.

Bank Transfer and Easypaisa require a clear manual verification process. Their account numbers, and any confirmed account-holder names, must be supplied through server-side configuration and must never be committed, logged, rendered on public pages, exposed through public APIs or client bundles, or included in reports. An order must not be marked as paid until payment is verified.

Order handling follows the dropshipping workflow: the customer orders from JS Jewellers, an authorized admin reviews the order, verifies supplier availability, forwards it to the relevant supplier through the approved method, and records supplier fulfilment evidence. Never mark an order confirmed or shipped without that evidence.

Do not expose supplier identity, cost, contact details, or agreements to customers. Customer payment status and supplier settlement status must remain separate.

JazzCash and card payments are outside the approved scope. Easypaisa and Bank Transfer are approved manual methods; do not claim that any payment gateway, merchant API, or automatic verification is integrated until a real integration has been configured and tested.

Prevent duplicate order creation and validate supplier availability and pricing on the server.

Define and test the order lifecycle before enabling real customer orders.

Never collect or store payment-card details directly.

## 9. Privacy and Security

- Hash passwords using a suitable established password-hashing library.
- Use secure session handling and appropriate cookie settings.
- Apply authentication, authorization, and server-side validation.
- Protect state-changing operations against relevant web security risks.
- Apply rate limits where appropriate, especially to authentication and public order endpoints.
- Do not expose database credentials, API keys, private order data, customer addresses, supplier identities, supplier costs, supplier contacts, or internal margins.
- Share customer delivery information with suppliers only to the minimum extent required for fulfilment, using an approved method.
- Do not publish private customer data in analytics or logs.
- Do not claim security compliance or production readiness without evidence.

## 10. Development Workflow

For each task:

1. Read the relevant requirements in `spec.md`.
2. Confirm the task and dependencies in `plan.md` and `tasks.md`.
3. Inspect the existing implementation.
4. Identify the smallest safe change.
5. Implement only the approved task.
6. Run relevant checks and tests.
7. Review the actual result.
8. Report changed files, checks performed, results, and remaining risks.
9. Update `tasks.md` only after verification.

Do not rewrite unrelated working features.

Do not install unnecessary packages or paid services.

## 11. Explicit Approval Required

Obtain the owner's approval before:

- Deploying or publishing the website.
- Changing production data or live settings.
- Purchasing a domain, hosting plan, or paid service.
- Installing a paid application or subscription.
- Enabling real payments or customer-order processing.
- Sending messages to customers.
- Using real analytics, advertising, or payment credentials.
- Performing destructive database operations.

Never request or expose passwords, secret keys, or private credentials in chat.

## 12. Definition of Done

A task is DONE only when:

- Its acceptance criteria are satisfied.
- Relevant checks have passed.
- The actual behaviour has been verified.
- Any known limitation is documented.
- The corresponding task status is updated honestly.

A successful build alone does not prove every feature works.

## 13. First Action

Before coding, confirm the current baseline and report:

- Current project folder structure and Git status.
- Whether the T003A baseline exists and whether its build verification passed.
- Framework and dependency versions actually installed.
- Database, environment, and supplier-data configuration status.
- Missing requirements, owner decisions, supplier agreements, or dependencies.
- Relevant existing tests.
- The first eligible task from `tasks.md`.
- The acceptance criteria and verification method for that task.

The four governing documents are `AGENTS.md`, `spec.md`, `plan.md`, and `tasks.md`. `constitution.md` and `specification.md` are absent; `spec.md` is the current specification. Report any missing governing document before implementing features. The Next.js application already exists, but PostgreSQL is not configured and no supplier integration exists; do not pretend otherwise.

Do not begin a full website rewrite.
