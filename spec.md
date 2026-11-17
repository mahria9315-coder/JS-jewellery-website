
# JS Jewellers — Product Specification

**Status:** Approved starting baseline; dropshipping business model approved 3 November 2026; brand, demo-content, and payment scope confirmed during T003B (4 November 2026). Unresolved items require owner confirmation.  
**Project:** JS Jewellers  
**Market:** Pakistan  
**Currency:** PKR  
**Target:** Functional, mobile-first online jewellery store.

## 1. Product Vision

Create a premium jewellery e-commerce website that allows customers in Pakistan to browse jewellery, view accurate product details, add items to a cart, place orders, and track order status.

The store owner must be able to manage products, supplier links, prices, availability, discounts, orders, and supplier fulfilment through a protected administrative dashboard.

The design must communicate elegance and trust without sacrificing speed, usability, or accessibility.

### Approved business model — dropshipping

JS Jewellers is a dropshipping storefront. The products belong to external suppliers, not to JS Jewellers.

The operating model is:

1. The customer places an order on the JS Jewellers website.
2. The store admin receives and reviews the order.
3. The admin verifies supplier availability for every ordered item.
4. The admin forwards the order details to the relevant supplier through the approved method.
5. The supplier fulfils and delivers the order according to the agreed supplier arrangement.
6. The admin tracks supplier fulfilment and updates the customer-facing order status only when there is evidence.
7. JS Jewellers records supplier cost, customer payment, delivery cost where applicable, and actual profit separately.

Rules:

- Products are sourced from external suppliers and displayed under JS Jewellers branding.
- Each product must be linked internally to its actual supplier.
- Store the supplier's cost and the JS Jewellers selling price separately.
- Calculate selling margin from verified supplier cost and selling price, not from estimates.
- Supplier identities, contacts, costs, agreements, and internal margins must never be exposed publicly.
- Track supplier availability and verify it before accepting or forwarding an order.
- Preserve customer privacy when sharing delivery information with suppliers.
- Do not create fake supplier accounts, fake supplier records, or pretend that supplier systems are integrated automatically.
- This is not a multi-vendor marketplace. Customers shop only from JS Jewellers, and supplier management remains an internal admin function.

**PENDING OWNER CONFIRMATION:**
- Does the supplier collect payment from the customer, or does JS Jewellers collect it?
- Who pays the supplier, and when?
- Who pays delivery charges?
- Who handles returns, exchanges, and damaged products?
- How will suppliers receive orders: manually through admin, WhatsApp, or another approved method?

## 2. Target Users

### Customers
People browsing or purchasing jewellery on mobile phones, tablets, or computers.

### Store Owner
The person responsible for product information, supplier relationships, pricing, availability, order processing, discounts, and store configuration.

### Authorized Administrators

Only explicitly authorized users may access administrative functions.

The website owner (client) owns the administrator system. There is no default administrator account and no developer-owned account. The owner creates the first Super Admin during handover through the secure one-time `/admin/setup` flow, protected by the server-only `ADMIN_SETUP_SECRET`; the break-glass bootstrap script is an owner-run recovery option only. Setup is permanently disabled once any administrator account exists.

Only the active Super Admin may create or change administrator accounts, reset passwords, clear lockouts, or edit role permissions. The `users.manage` and `roles.manage` permissions are reserved for the Super Admin role and must never be granted to another role; this is enforced on the server, not only in the UI. Additional staff accounts require explicit Super Admin authorization, and the last active Super Admin cannot be disabled or demoted.

### Suppliers
External businesses that supply and may fulfil products. Suppliers are an internal operational relationship, not website users. They must not receive customer-facing accounts or access the administrative dashboard unless a future requirement is explicitly approved.

## 3. Brand and Visual Requirements

Brand name: JS Jewellers

Logo: the owner's existing logo is supplied as `public/Luxury Gold Jewelry Monogram Logo.png` and is used exactly as provided. Do not create a new logo, redraw it, crop it, recolour it, or replace or substitute it with text such as "JS" or "JS Jewellers". The source PNG must not be modified. The header keeps the logo at its existing small size with aspect ratio preserved; the footer displays the same logo, enlarged and centred in a fixed square stage.

**Implementation note (5 November 2026):** documentation, metadata, visible page copy, and metadata all use the approved name JS Jewellers. The owner-approved logo and hero artwork are applied.

### Black Gold Galaxy theme (owner-approved 5 November 2026)

Approved colours:

| Name | Hex |
|---|---|
| Deep Black | #050505 |
| Charcoal | #111111 |
| Dark Gold Shadow | #17120C |
| Dark Brown | #20170D |
| Bronze Brown | #443019 |
| Antique Gold | #80602C |
| Luxury Gold | #C29A45 |

White `#FFFFFF` and champagne `#E8DCC5` remain the approved text colours; the seven colours above are surface and accent colours unless a contrast rule below explicitly allows otherwise.

Approved page gradient for every non-homepage route — smooth, `172deg`:

`#050505 0% → #111111 18% → #17120C 38% → #20170D 60% → #443019 82% → #20170D 100%`

Requirements:

- Apply the theme across the shared layout, homepage, catalogue, collections, product pages, search, and all existing public pages and states.
- Header and footer surfaces follow the active theme: dark Black Gold Galaxy by default, coordinated warm ivory when the light theme is selected.
- Headings use the theme heading colour; body copy uses the theme body colour. Luxury Gold provides accents in the dark theme and is replaced by the darker `#7A5A1E` accent where raw gold would not meet contrast on ivory. Luxury Gold may be used for normal text on deep black, charcoal, dark gold shadow, and dark brown.
- Luxury Gold on bronze is limited to large text or short labels.
- Antique Gold is decorative only and must not be used for normal-sized text or as a border over bronze.
- Gold buttons use deep-black text and a theme-appropriate focus indicator.
- Keyboard focus must remain visible, and semantic HTML and accessible labels must be preserved.
- Preserve `public/Luxury Gold Jewelry Monogram Logo.png` and `public/images/js-jewellers-hero.png` byte-for-byte; do not stretch or crop either asset.
- The footer logo is enlarged, centred in a fixed square stage, and rotates 360 degrees every 34 seconds. This is the approved exception to the rule against continuous animation. It is disabled under `prefers-reduced-motion: reduce`.
- Existing motion is retained: hero reveal, finite gold shimmer, product-image zoom, scroll reveal, navigation underline, and page transitions.
- Demo prices, where they exist, must remain clearly labelled as demo/sample prices. Do not invent products, reviews, ratings, stock claims, or business information.
- The theme must not change product data, prices, orderability, database schema, authentication, payments, or business rules, and must not implement cart functionality.

### Theme modes and presentation enhancement (owner-approved 5 November 2026)

The dark Black Gold Galaxy theme remains the default. A light theme is an opt-in alternative, and a presentation layer adds editorial typography, premium 3D cards, and the owner-approved route-aware decorative backgrounds. These are cross-cutting presentation changes; they do not add product data or change business rules.

Theme toggle requirements:

- Provide a circular, icon-only theme control in the header on every route. Show a moon in the dark theme and a sun in the light theme.
- Use a real `<button>` with an accessible name that describes the action, a tooltip, a 44×44px target, visible keyboard focus, and a state cue that is not colour alone.
- Default to the dark Black Gold Galaxy theme. Persist the visitor's choice across refresh and navigation, and apply it before first paint so there is no dark flash.
- Support mouse, keyboard (Enter/Space), and touch activation.
- The light theme must be a deliberately designed warm ivory palette with white/soft-ivory cards, dark charcoal/espresso text, tasteful gold/champagne headings, subtle gold borders, soft shadows, and coordinated header/footer surfaces. It must not be a filter or inversion of the dark theme. Raw Luxury Gold is restricted to decoration and borders where contrast is insufficient; use the darker accent for text.

Typography requirements:

- The homepage hero `h1` is the largest heading site-wide: full bold weight 800, italic, a solid champagne `#E8DCC5` in the dark theme and deep gold `#7A5A1E` in the light theme, using a responsive `clamp()` size of approximately 38-80px (measured 41.6px at 375px, 42.08px at 390px, 54.176px at 768px, 73.312px at 1366px, and 75.68px at 1440px).
- Route `h1` titles use a 700 italic display serif (`--font-display`). Section `h2`/`h3` headings use a 600 italic editorial serif (`--font-heading`). Product names and card titles use a 600 italic product serif (`--font-product`). Hierarchy is carried by size, weight, italic, and colour rather than by extra decoration.
- Section headings alternate readable warm gold and ivory in the dark theme, and deep gold and espresso in the light theme. Product names remain neutral (white in dark, espresso in light). No rainbow colours, gradient-clipped heading text, heavy glow, or low-contrast gold.
- Body text stays clean, upright, and readable with improved line height and letter spacing. Do not set paragraphs in italic. Navigation, buttons, form labels, and controls also stay upright.
- Font roles are Playfair Display (hero), Cormorant Garamond (sections), Lora (products), Inter (body), and Montserrat (navigation/buttons), each listed first with installed system fallbacks. Do not download unnecessary external fonts; no webfont package or network font request is added. The current Windows verification machine resolves Palatino Linotype, Garamond, and Century Gothic respectively, and that fallback behaviour is documented honestly.
- Preserve the existing `.brand-wordmark` display treatment. Heading typography changes must not alter content wording, routes, functionality, the owner logo, hero artwork, backgrounds, database, or Prisma.

Premium card requirements:

- Apply layered, rounded cards to products, collections, categories, homepage showcases, and other content cards, with premium borders and shadows and clear separation between image, title, price, and action.
- Provide hover lift/tilt/shadow and image zoom, plus a quick click zoom that returns smoothly.
- Use CSS transforms only. Do not delay navigation or cause double navigation, and keep keyboard activation working.
- Keep motion restrained: no continuous animation on cards and no bouncing, flashing, or shaking.

Decorative background requirements (owner-approved homepage update, 6 November 2026):

- **Homepage only — Bright Gold Geometric Grid:** a deep premium black base with elegant, thin (approximately 1px) bright champagne-gold / metallic-gold geometric lines, clean intersections, and carefully spaced square and rectangular cells. Major lines are clearly visible gold; secondary lines use a lower opacity for subtle depth. Responsive major spacing is approximately 56–72px, adjusted to the homepage composition.
- **Every non-homepage route — existing Geometric Grid retained:** every non-homepage route keeps its existing subtle black-and-gold geometric grid over the approved `172deg` theme gradient, including collections, collection details, search, product pages, and policy pages. This change does not alter those routes.
- The homepage grid is decorative only. It must not contain text, jewellery, rings, logos, navigation, or controls, and existing page content remains separate and functional.
- The grid must support dark and light themes without harming text contrast or obscuring content. The dark theme keeps the deep premium black base; the light theme uses a warm ivory base with darker gold lines and must not force a black background.
- Use lightweight CSS/SVG patterns and gradients. Do not use the full reference screenshot as a background because it contains UI, text, and jewellery.
- Place the layer behind content with `pointer-events: none`, `aria-hidden`, no horizontal overflow, no layout shift, and no expensive JavaScript loop. It is static and introduces no continuous animation; `prefers-reduced-motion` must remain respected.
- Do not replace or modify the owner logo or the hero artwork. The existing hero text, headings, descriptions, CTA buttons, header/navigation, section order, cards, footer, typography, theme toggle, and theme persistence remain unchanged. This change does not implement T030, T029, or T023.

Use elegant italic serif headings, readable sans-serif body text, restrained gold accents, generous spacing, and consistent product photography.

The layout must work on small mobile screens and larger desktop displays.

Avoid unnecessary animations, visual clutter, and excessive decorative effects, except for the explicitly approved footer logo rotation. The route-aware decorative backgrounds are static.

## 4. Product Collections

The store must support these collections:

1. Women's Jewellery
2. Men's Jewellery
3. Bracelets
4. Necklaces
5. Rings
6. Earrings
7. Pearl Jewellery
8. Customized Name Jewellery

Products may belong to more than one collection if the data model supports it.

Collection pages must show relevant products, a useful empty state when no products exist, and navigation back to other collections.

### 4.1 Demo catalogue — development and preview only

Demo products and demo images are approved for development and preview only:

- Demo products must be clearly and visibly labelled as demo content.
- Demo products must not be orderable. Cart, checkout, and order placement must not accept them.
- Demo prices, stock figures, suppliers, and images must not be presented as genuine business information.
- Demo content must not create real-looking supplier records, supplier costs, or availability claims.
- The restrictions in this specification against invented real supplier data, fake reviews, and fake sales evidence continue to apply.
- Demo content is not the production catalogue and must not be published as one.

## 5. Homepage

The homepage must contain:

- Header with JS Jewellers branding and navigation.
- Product search access.
- Jewellery hero image or approved campaign imagery.
- Clear Shop Now action.
- Category navigation.
- New Arrivals section.
- Best Sellers section.
- Special Discount Offers section when genuine offers exist.
- Featured jewellery products.
- WhatsApp contact access after the store number is configured.
- Footer with relevant navigation, policies, and contact details.

Do not fabricate discounts or sales rankings. If genuine supplier-backed product data is not available during development, use clearly labelled demo content (preview-only and not orderable, per §4.1), placeholders, or empty states.

## 6. Product Catalogue and Details

Each product may contain:

- Unique product ID and slug.
- Product name.
- Description.
- One or more images.
- Collection associations.
- Current price in PKR (the JS Jewellers selling price).
- Optional original price for a valid discount.
- Stock quantity or availability status, based on verified supplier availability; include quantity only when the supplier provides it.
- Product options, such as colour or size, when applicable.
- New-arrival or featured merchandising flags.
- Creation and update timestamps.
- Internal supplier reference and supplier SKU, never shown publicly.
- Supplier cost stored separately from the selling price.
- Calculated selling margin based on verified cost and selling price.
- Supplier availability status and last verification timestamp.

Requirements:

- Display product images consistently.
- Show accurate names, descriptions, prices, and availability.
- Show an original price only when a genuine discount is configured.
- Prevent unavailable products from being ordered.
- Support product search, collection filtering, sorting, and pagination or an equivalent manageable listing strategy.
- Use meaningful image alternative text.
- Do not invent customer ratings or reviews.
- Every published product must be linked to its actual supplier before it can be ordered.
- Do not publish a product until its supplier cost, selling price, and availability process are verified.
- Demo products are development/preview content only. They must be clearly labelled, must not be published as genuine catalogue products, and must not be made orderable.
- Do not display supplier identity, supplier cost, supplier contact details, supplier SKU, or selling margin on customer-facing pages.
- Verify supplier availability before accepting or forwarding an order.
- Confirm the right to use supplier product images before publishing them.

## 7. Customized Name Jewellery

Customers must be able to personalize eligible products.

Required inputs:

- Customer-entered name or text.
- Font selected from approved available fonts.
- Colour selected from approved available colours.

Rules:

- Only products configured as customizable show customization controls.
- Validate required fields and reasonable length limits on the server.
- Do not accept arbitrary font or colour identifiers that are not configured for that product.
- Save the customization with the cart item and final order item.
- Display customization details in the cart, checkout summary, and administrative order view.
- Preserve customization when the customer updates the cart or retries checkout.
- Make clear that spelling and customization choices are supplied by the customer.

The store owner must provide or approve the final font and colour options. The assigned supplier must confirm that it can fulfil the approved customization before the product is offered as customizable.

## 8. Shopping Cart

Customers must be able to:

- Add available products to the cart.
- Change quantities.
- Remove products.
- View product options and customization details.
- View item subtotals and the order total.
- Continue shopping or proceed to checkout.

Demo products must not be addable to the cart, and no order may be created for demo content.

The server must revalidate current prices, supplier availability, and applicable discounts before order creation.

Do not trust browser-submitted prices or totals. Cart pages must not expose supplier identity, cost, or contact details.

Cart persistence must be implemented using an appropriate approach for the selected customer/session model. Do not promise cross-device cart synchronization unless authenticated customer accounts are implemented and tested.

## 9. Checkout and Delivery

Required checkout information:

- Customer name.
- Mobile number.
- Full delivery address.
- Selected payment method.
- Order items and any customization details.

Requirements:

- Validate all required fields.
- Show a clear order summary before submission.
- Calculate totals on the server.
- Provide a confirmation page or equivalent confirmation state after successful order creation.
- Generate a unique order reference.
- Prevent accidental duplicate orders.
- Store only information required to fulfil the order.
- Do not send real customer communications until approved.

### Dropshipping order handling

- The customer places the order on JS Jewellers.
- An authorized admin receives and reviews the order.
- The admin verifies supplier availability for each item before accepting or forwarding the order.
- The admin forwards the order to the relevant supplier through the approved method and records what was sent, when, and by whom.
- The supplier fulfils and delivers the order under the agreed supplier arrangement.
- The admin tracks supplier fulfilment and updates the customer-facing status only when evidence supports the change.
- Never describe an order as confirmed, forwarded, shipped, or delivered without recorded evidence.
- Share only the minimum customer delivery information required by the supplier.
- Keep supplier identity, cost, contact details, and internal margin out of customer communications.

**PENDING OWNER CONFIRMATION:** who collects customer payment, who pays the supplier and when, who pays delivery charges, who handles returns/exchanges/damaged products, and the approved supplier order-transmission method. Payment collection, verification, and settlement workflows remain separate.

### Delivery estimate (client-approved 7 November 2026)

- Display **4–7 days** as an estimate for all intended customer destinations.
- Present it as an estimate only; never as a guaranteed delivery date.
- Do not invent or publish a courier name, tracking capability, delivery charge, customs arrangement, or guaranteed date.
- Keep destination serviceability configurable. No destination outside Pakistan is enabled or approved; an unconfigured destination must show that delivery and return terms require confirmation.
- Show the estimate in delivery information, relevant policy pages, and product or checkout information where appropriate.
- The estimate is shown at checkout and stored on each order as an estimate only. Delivery charges, courier, tracking, and customs arrangements remain unconfigured.

## 10. Payment Methods

### Approved methods (client-approved 7 November 2026)

The client-approved payment methods are:

- Bank Transfer — Islamic Bank.
- Easypaisa.

No other payment method is part of the approved list. Cash on Delivery is not in the current approved list and must not be implemented or offered unless the owner separately approves it. Do not integrate a real payment gateway or connect live payment accounts.

### Bank Transfer

Approved method. The exact account number and any confirmed account-holder name must be supplied by the owner through server-only configuration. They must never appear in public pages, public APIs, client bundles, logs, documentation, screenshots, or reports. Payment remains unverified until an authorised person checks it. Instructions are displayed only at the payment step after the method is selected, and the method stays unavailable until both the account number and account holder are configured.

### Easypaisa

Approved method. The Easypaisa number and any confirmed account-holder name must be supplied by the owner through server-only configuration, with the same handling rules as Bank Transfer.

### Checkout dependency

Cart, checkout, order, payment, and admin verification routes exist. Payment instructions are rendered on the server only after a configured method is selected, and order creation refuses an unconfigured method. Do not create fake payment functionality, and do not claim that payment has been received or verified.

### Removed or deferred methods

Cash on Delivery appeared in earlier documentation but is not part of the client-approved list. JazzCash and card payments remain outside the approved scope. Do not offer them without a new owner approval.

Payment requirements:

- Do not simulate successful online payments.
- Do not mark unverified payments as paid.
- Do not store card details or ask customers for card, PIN, OTP, or bank-login credentials.
- Keep payment status separate from fulfilment status.
- Keep customer payment, supplier cost, supplier settlement, delivery cost, and actual profit as separate records.
- Clearly communicate available payment methods to customers.
- Store payment account details only in server-only configuration. Never use `NEXT_PUBLIC_` variables for private account numbers.
- Add only placeholder variable names to `.env.example`.

## 11. Order Management and Tracking

Orders must store:

- Unique order reference.
- Customer contact and delivery details.
- Purchased items, quantities, and price snapshots.
- Customization details, where applicable.
- The supplier assigned to each item at the time of ordering.
- Supplier cost snapshot and JS Jewellers selling-price snapshot per item.
- Calculated margin per item.
- Delivery cost, where applicable.
- Shipping amount charged to the customer and who bears the cost, once confirmed.
- Total amount and currency.
- Payment method and customer payment status.
- Supplier settlement status, kept separate from customer payment.
- Fulfilment/order status and supplier fulfilment status.
- Supplier order-forwarding record: approved method, timestamp, authorized admin, reference, and what was sent.
- Creation and update timestamps.

Suggested customer-facing order statuses:

- Pending Confirmation
- Confirmed
- Forwarded to Supplier
- Supplier Processing
- Shipped
- Delivered
- Cancelled
- Returned, if the approved returns workflow supports it

Suggested supplier-fulfilment statuses (internal):

- Not Sent
- Availability Checked
- Sent to Supplier
- Supplier Confirmed
- Supplier Processing
- Supplier Shipped
- Supplier Delivered
- Supplier Cancelled
- Issue or Discrepancy

Suggested payment statuses:

- Pending
- Awaiting Verification
- Paid
- Failed
- Refunded

Only use statuses supported by the actual workflow. Keep supplier status separate from the customer-facing status. A status may only advance when the corresponding evidence is recorded. Do not mark an order Confirmed, Forwarded, Shipped, or Delivered automatically.

Customers must be able to check their order status through an approved, privacy-preserving tracking method. Do not expose another customer's order information through guessable order IDs alone.

## 12. Administrative Dashboard

Provide a protected dashboard for authorized staff.

### Supplier management
- Create and edit supplier records.
- Record supplier contact details, agreed terms, and status internally.
- Link products to their actual suppliers.
- Record supplier SKU, supplier cost, and JS Jewellers selling price separately.
- Calculate and review selling margin from verified values.
- Record supplier availability and when it was last verified.
- Restrict supplier, cost, and margin data to authorized administrators.
- Do not create fake suppliers or claim an automatic supplier integration that does not exist.

### Product management
- Create products.
- Edit product details.
- Manage product images.
- Assign collections.
- Assign the actual supplier and record supplier SKU.
- Update prices and genuine discounts.
- Update availability based on verified supplier availability.
- Configure customization options.
- Ensure no published product is missing its supplier link or cost data.

### Order management
- View orders.
- View customer delivery details when authorized.
- View purchased items and customization details.
- Review and confirm or cancel orders.
- Verify supplier availability before forwarding.
- Forward orders to the relevant supplier through the approved method and record evidence.
- Track supplier fulfilment and update the customer-facing order status.
- Record supplier correspondence references and issues.
- Record payment verification and supplier settlement separately.
- View order history and status timeline.

### Reports
- Show sales, costs, and order summaries derived from real stored data.
- Show supplier cost, delivery cost, and actual profit separately.
- Define whether cancelled, returned, or refunded orders are excluded from sales and profit totals.
- Do not create fake report data.

The first version may use a single owner/admin role if that is the smallest secure implementation. Additional staff roles require a documented authorization model.

## 13. Reviews and Ratings

Support genuine customer reviews and ratings only if the review workflow can be implemented responsibly.

Requirements:

- Store review text, rating, product association, and timestamps.
- Use moderation or an approval state before public display.
- Do not fabricate reviews, reviewer identities, or ratings.
- If purchase verification is not implemented, do not label reviews as verified purchases.
- Display a clear empty state when no approved reviews exist.

## 14. Search, Filters, and Sorting

Support relevant catalogue search and filtering.

At minimum:

- Search by product name.
- Filter by collection.
- Sort by price where applicable.
- Support new-arrival or featured sorting where relevant.
- Keep filter controls usable on mobile.
- Provide clear empty-result states.

Additional filters, such as colour or size, depend on available structured product data.

## 15. WhatsApp and Social Marketing

Provide a WhatsApp contact link after the owner supplies and approves the number.

Marketing integrations may include:

- Meta Pixel.
- Meta advertising.
- Instagram.
- Google Analytics.
- Search-engine tools.

Requirements:

- Do not invent tracking IDs, business accounts, or credentials.
- Document setup requirements.
- Follow applicable privacy and consent requirements.
- Do not send sensitive customer data to analytics.
- Treat external integrations as pending until configured and tested.

## 16. SEO

Implement:

- Unique page titles and descriptions.
- Canonical URLs where appropriate.
- Search-engine-friendly product and collection URLs.
- Sitemap generation.
- Appropriate robots rules.
- Open Graph metadata.
- Product structured data where accurate and appropriate.
- Useful headings and image alt text.
- A sensible indexation strategy.

Do not add false ratings, false availability, or fabricated product information to structured data.

SEO implementation does not guarantee search ranking.

## 17. Privacy, Security, and Accessibility

- Validate inputs on the server.
- Protect all administrative operations.
- Use secure authentication and session management.
- Protect secrets and personal information.
- Protect supplier identities, contacts, costs, agreements, and internal margins from public exposure.
- Avoid exposing customer data in public pages or logs.
- Share only the minimum customer delivery information required for supplier fulfilment, using an approved method.
- Provide privacy and return/exchange policy pages using owner-approved wording, including any supplier data-sharing disclosure once approved.
- Use accessible labels and keyboard-operable controls.
- Maintain readable contrast and visible focus states.
- Provide meaningful errors and loading states.

Do not claim legal compliance without appropriate review.

**Current implementation state (8 November 2026):** T029/T029A published the draft `/privacy` and `/returns` wording, linked from the footer. The client then approved the business email **mahria9315@gmail.com**, the Pakistan return/refund terms, the country-aware international position, the 4–7 day delivery estimate, and the payment methods. Both policy drafts now publish the confirmed brand **JS Jewellers**, legal/business name **JS Jewellery**, Karachi, Sindh location, clickable `mailto:mahria9315@gmail.com`, and WhatsApp **+92 333 9422818**. The returns draft separates the Pakistan **3-day** change-of-mind window and the **25% deduction / 75% refund** from statutory remedies, includes a PKR 10,000 → PKR 2,500 deduction → PKR 7,500 refund example, and states that the deduction never applies to defective, faulty, damaged, incorrect, or legally protected returns. International terms are driven by `lib/returns-policy.ts`; Pakistan is the only configured destination and every unconfigured country displays “return terms require confirmation.” The 4–7 day estimate appears in the returns policy, the `/shipping` page, product details, and checkout, and is always presented as an estimate. Payment configuration is server-only in `lib/payments/config.ts` with placeholder names in `.env.example`; no account number or account-holder value is published. Cart, checkout, order, and admin payment-verification screens exist, but both approved methods remain unavailable until their server-only values are configured. Formal legal review, final owner approval, the actual payment account numbers, the return address, and the refund timeline remain **PENDING OR BLOCKED**. All policy routes remain intentionally `noindex`. Research is recorded in `docs/legal-policy-research.md`.

## 18. Performance and Responsive Design

- Design mobile-first.
- Optimize image sizes and formats.
- Avoid unnecessary client-side JavaScript.
- Load content efficiently.
- Test on mobile, tablet, and desktop viewports.
- Aim for the homepage to load in under three seconds on a typical mobile connection, while measuring and documenting actual performance.
- Do not guarantee performance without testing.

## 19. Technology and Deployment

Approved starting stack:

- Next.js App Router.
- TypeScript.
- Tailwind CSS.
- PostgreSQL.
- Prisma ORM.
- Secure server-side authentication.
- Git.
- Vercel or a compatible deployment platform.

Current repository state: the Next.js App Router baseline is complete and verified. PostgreSQL 18.6 and Prisma 7.10.1 are installed, configured, and locally verified under the owner-approved **T013 infrastructure-only** scope. Local authenticated connectivity was confirmed on 6 November 2026 as the dedicated `js_jewellers_app` role in the `js_jewellers` database, with no superuser or createdb privileges. A no-DDL baseline migration was applied. On 8 November 2026 the owner-approved T013A and T052 scopes added additive supplier/catalogue, order/payment/return, and admin schema migrations; `prisma validate`, `prisma generate`, `prisma migrate status`, and a read-only query succeed, and the `migrate deploy` workflow is documented in `DATABASE.md`. On 9 November 2026 a secure one-time `/admin/setup` flow was added: the website owner creates the initial Super Admin during handover using the server-only `ADMIN_SETUP_SECRET`; creation runs through the existing secure auth/session/permission system inside a transaction with an advisory lock and is permanently disabled after the first administrator exists. `/admin/login` remains the normal sign-in path, and the break-glass bootstrap script remains an owner-run recovery option only. Administrator account and role management is enforced server-side for the active Super Admin role; `users.manage` and `roles.manage` cannot be granted to another role, and the last active Super Admin cannot be disabled or demoted. No developer-owned or default administrator account exists. The schema and workflows exist, but no real supplier, product, stock, order, payment, return, or administrator account has been loaded or invented. Bank Transfer and Easypaisa remain unavailable because their server-only account values are missing. Formal legal review and final owner approval remain outstanding. Do not claim a production database connection, live payment, or legal approval. Vercel is a future hosting option only; do not deploy.

Do not add dependencies outside the approved baseline without owner approval.

The site must not be published to production without the owner's approval.

## 20. MVP Scope and Exclusions

The MVP prioritizes:

1. Store layout and navigation.
2. Product catalogue and collections.
3. Product details and search/filtering.
4. Cart and server-validated checkout.
5. Bank Transfer (Islamic Bank) and Easypaisa payment methods, with server-only account configuration.
6. Persistent order creation and tracking.
7. Secure admin product, supplier, and order management.
8. Custom-name jewellery options.
9. Internal supplier management and supplier-product links.
10. Supplier availability verification.
11. Admin order forwarding and supplier fulfilment tracking.
12. Recording supplier cost, customer payment, delivery cost, and actual profit.
13. SEO and approved policies.
14. Deployment preparation and testing.

Out of scope unless separately approved:

- A multi-vendor marketplace where suppliers sell directly to customers.
- Supplier-facing accounts or a supplier portal.
- Automatic supplier API integration. Supplier order transmission is manual unless an approved integration exists.
- Displaying supplier identities, costs, or margins to customers.
- Demo products and demo images as a production catalogue. Demo content is development/preview only and must not be made orderable.

Provider-dependent payments, real analytics, external messaging, advanced reporting, and other integrations may remain pending until access and approvals are available.

Do not substitute fake integrations for working features.

## 21. Acceptance Criteria

The MVP is ready for owner review when:

- The main pages work at mobile and desktop sizes.
- All eight collections can be represented.
- Product data and prices are sourced from actual configured records.
- Demo content is clearly labelled, cannot be ordered, and is not treated as genuine business information.
- Every published product is linked internally to its actual supplier, and supplier identity, cost, and margin are not publicly exposed.
- Admin can record supplier cost, selling price, and calculated margin separately.
- Supplier availability is verified before an order is accepted or forwarded.
- Admin can forward an order using the approved method and record evidence.
- Supplier fulfilment is tracked separately from customer payment and customer-facing status.
- Customer order status advances only when supporting evidence is recorded.
- Supplier cost, customer payment, delivery cost where applicable, and actual profit are recorded separately and can be reconciled.
- The complete dropshipping order journey is tested from product setup to supplier fulfilment and profit recording.
- Cart changes work correctly.
- Customization details persist through checkout and the stored order.
- Checkout validates data and recalculates totals server-side.
- A valid order can be created once with Bank Transfer or Easypaisa selected and viewed in the admin dashboard, without claiming payment was received or verified.
- Unauthorized users cannot access admin functions.
- Order status can be checked without exposing other customers' information.
- Policies and contact details are either approved or clearly marked as pending.
- SEO metadata and sitemap behaviour are checked.
- Relevant tests and build checks pass.
- Known limitations and unconfigured integrations are documented.
- Supplier settlement, delivery-cost responsibility, returns/damaged-product handling, and the order-transmission method are owner-approved or clearly marked PENDING.
- No supplier identity, cost, contact detail, agreement, or internal margin is exposed on a customer-facing page.

Owner approval is still required before production deployment.
