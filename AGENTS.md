
# AGENTS.md — J's Jewellery

## 1. Project Overview

Build a professional, premium online jewellery store named **J's Jewellery** for customers in Pakistan.

The website must be mobile-friendly, accessible, secure, search-engine friendly, and suitable for eventual production deployment.

The website must support browsing products, searching and filtering, shopping carts, customer checkout, order management, custom-name jewellery, and an administrative dashboard.

### 1.1 Approved business model — dropshipping

J's Jewellery is a dropshipping e-commerce store. It does **not** own the products it sells.

Permanent rules:

- Follow the dropshipping business model in all design, implementation, and operational decisions.
- Do not assume J's Jewellery owns the products, inventory, or supplier relationships.
- Do not invent suppliers, supplier products, stock, prices, costs, agreements, or delivery promises.
- Every published product must be linked internally to its actual supplier before it can be ordered.
- Keep supplier identities, costs, contact details, agreements, and internal margins private.
- Customer-facing pages must show J's Jewellery branding only. Do not expose supplier details or present the store as a marketplace.
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

This is a greenfield project. No application repository exists yet. Create the initial Next.js baseline through T003A before adding features.

Do not replace an existing implementation or install dependencies beyond the approved baseline without approval.

## 4. Brand Identity

Brand name: J's Jewellery.

Logo text: J's.

Approved palette:

- Obsidian Black: `#090909`
- Charcoal: `#191919`
- Luxury Gold: `#C6A15B`
- Champagne: `#E8DCC5`
- White: `#FFFFFF`

Design direction:

- Premium, elegant, minimal jewellery-store appearance.
- Serif headings and readable sans-serif body text.
- Gold should be used selectively for emphasis.
- Avoid unnecessary gradients, excessive animations, and clutter.
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

## 6. Core Functional Requirements

- Professional homepage with jewellery imagery.
- New Arrivals section.
- Best Sellers section based on genuine sales data or clearly defined manual merchandising.
- Special Offers section based on real configured discounts.
- Product collections and product detail pages.
- Product images, names, descriptions, prices, availability, and applicable options.
- Internal supplier records linked to every published product.
- Supplier cost and J's Jewellery selling price stored separately, with margin calculated from verified values.
- Supplier availability verification before accepting or forwarding an order.
- Original and discounted prices when a valid discount exists.
- Search, filtering, and sorting.
- Shopping cart with quantity updates and item removal.
- Checkout form with customer name, mobile number, and full delivery address.
- Order confirmation and persistent order records.
- Custom-name jewellery with customer-entered name, available font, and available colour.
- Save customization details with the cart item and order item.
- Cash on Delivery.
- Bank transfer instructions and verification workflow, subject to owner approval.
- Easypaisa and JazzCash only after the required provider capabilities and approvals are verified.
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

Cash on Delivery is required for the MVP. The COD settlement workflow—who collects payment, who pays the supplier, and when—is PENDING OWNER CONFIRMATION.

Bank transfer must have a clear manual verification process. An order must not be marked as paid until payment is verified.

Order handling follows the dropshipping workflow: the customer orders from J's Jewellery, an authorized admin reviews the order, verifies supplier availability, forwards it to the relevant supplier through the approved method, and records supplier fulfilment evidence. Never mark an order confirmed or shipped without that evidence.

Do not expose supplier identity, cost, contact details, or agreements to customers. Customer payment status and supplier settlement status must remain separate.

Do not claim that Easypaisa, JazzCash, or any payment gateway is integrated until its real integration has been configured and tested.

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

Before coding, confirm the greenfield baseline and report:

- Current project folder structure and Git status.
- Whether the T003A baseline exists and whether its build verification passed.
- Framework and dependency versions actually installed.
- Database, environment, and supplier-data configuration status.
- Missing requirements, owner decisions, supplier agreements, or dependencies.
- Relevant existing tests.
- The first eligible task from `tasks.md`.
- The acceptance criteria and verification method for that task.

If the repository is missing any of the four SDD documents, report that fact before implementing features. Because this is a greenfield project, do not pretend that an application or supplier integration already exists.

Do not begin a full website rewrite.
