
# J's Jewellery — Product Specification

**Status:** Approved starting baseline; dropshipping business model approved 3 November 2026. Unresolved items require owner confirmation.  
**Project:** J's Jewellery  
**Market:** Pakistan  
**Currency:** PKR  
**Target:** Functional, mobile-first online jewellery store.

## 1. Product Vision

Create a premium jewellery e-commerce website that allows customers in Pakistan to browse jewellery, view accurate product details, add items to a cart, place orders, and track order status.

The store owner must be able to manage products, supplier links, prices, availability, discounts, orders, and supplier fulfilment through a protected administrative dashboard.

The design must communicate elegance and trust without sacrificing speed, usability, or accessibility.

### Approved business model — dropshipping

J's Jewellery is a dropshipping storefront. The products belong to external suppliers, not to J's Jewellery.

The operating model is:

1. The customer places an order on the J's Jewellery website.
2. The store admin receives and reviews the order.
3. The admin verifies supplier availability for every ordered item.
4. The admin forwards the order details to the relevant supplier through the approved method.
5. The supplier fulfils and delivers the order according to the agreed supplier arrangement.
6. The admin tracks supplier fulfilment and updates the customer-facing order status only when there is evidence.
7. J's Jewellery records supplier cost, customer payment, delivery cost where applicable, and actual profit separately.

Rules:

- Products are sourced from external suppliers and displayed under J's Jewellery branding.
- Each product must be linked internally to its actual supplier.
- Store the supplier's cost and the J's Jewellery selling price separately.
- Calculate selling margin from verified supplier cost and selling price, not from estimates.
- Supplier identities, contacts, costs, agreements, and internal margins must never be exposed publicly.
- Track supplier availability and verify it before accepting or forwarding an order.
- Preserve customer privacy when sharing delivery information with suppliers.
- Do not create fake supplier accounts, fake supplier records, or pretend that supplier systems are integrated automatically.
- This is not a multi-vendor marketplace. Customers shop only from J's Jewellery, and supplier management remains an internal admin function.

**PENDING OWNER CONFIRMATION:**
- Does the supplier collect payment from the customer, or does J's Jewellery collect it?
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

### Suppliers
External businesses that supply and may fulfil products. Suppliers are an internal operational relationship, not website users. They must not receive customer-facing accounts or access the administrative dashboard unless a future requirement is explicitly approved.

## 3. Brand and Visual Requirements

Brand name: J's Jewellery  
Logo text: J's

Approved colours:

| Name | Hex |
|---|---|
| Obsidian Black | #090909 |
| Charcoal | #191919 |
| Luxury Gold | #C6A15B |
| Champagne | #E8DCC5 |
| White | #FFFFFF |

Use elegant serif headings, readable sans-serif body text, restrained gold accents, generous spacing, and consistent product photography.

The layout must work on small mobile screens and larger desktop displays.

Avoid unnecessary animations, visual clutter, and excessive decorative effects.

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

## 5. Homepage

The homepage must contain:

- Header with J's branding and navigation.
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

Do not fabricate discounts or sales rankings. If genuine supplier-backed product data is not available during development, use clearly labelled placeholders or empty states.

## 6. Product Catalogue and Details

Each product may contain:

- Unique product ID and slug.
- Product name.
- Description.
- One or more images.
- Collection associations.
- Current price in PKR (the J's Jewellery selling price).
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

- The customer places the order on J's Jewellery.
- An authorized admin receives and reviews the order.
- The admin verifies supplier availability for each item before accepting or forwarding the order.
- The admin forwards the order to the relevant supplier through the approved method and records what was sent, when, and by whom.
- The supplier fulfils and delivers the order under the agreed supplier arrangement.
- The admin tracks supplier fulfilment and updates the customer-facing status only when evidence supports the change.
- Never describe an order as confirmed, forwarded, shipped, or delivered without recorded evidence.
- Share only the minimum customer delivery information required by the supplier.
- Keep supplier identity, cost, contact details, and internal margin out of customer communications.

**PENDING OWNER CONFIRMATION:** who collects customer payment, who pays the supplier and when, who pays delivery charges, who handles returns/exchanges/damaged products, and the approved supplier order-transmission method. The COD settlement workflow is also PENDING.

**Shipping:** The owner has indicated free delivery / PKR 0 shipping. Implement this as a configurable rule, subject to final confirmation of any exceptions and of who bears the delivery cost.

## 10. Payment Methods

### Cash on Delivery
Required for the initial release. The settlement workflow is PENDING OWNER CONFIRMATION: whether the supplier or J's Jewellery collects payment, who pays the supplier, and when.

### Bank Transfer
May be offered after the owner approves the instructions and verification workflow. Payment must remain unverified until checked by an authorized person.

### Easypaisa
Requested, but actual provider integration, merchant capabilities, approval, and technical requirements must be verified before implementation is described as complete.

### JazzCash
Requested, but availability, merchant requirements, and integration method remain unconfirmed.

Payment requirements:

- Do not simulate successful online payments.
- Do not mark unverified payments as paid.
- Do not store card details.
- Keep payment status separate from fulfilment status.
- Keep customer payment, supplier cost, supplier settlement, delivery cost, and actual profit as separate records.
- Clearly communicate available payment methods to customers.

## 11. Order Management and Tracking

Orders must store:

- Unique order reference.
- Customer contact and delivery details.
- Purchased items, quantities, and price snapshots.
- Customization details, where applicable.
- The supplier assigned to each item at the time of ordering.
- Supplier cost snapshot and J's Jewellery selling-price snapshot per item.
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
- Record supplier SKU, supplier cost, and J's Jewellery selling price separately.
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

This is a greenfield project. Create and verify the T003A baseline before adding dependencies or changing versions. Do not add dependencies outside the approved baseline without owner approval.

The site must not be published to production without the owner's approval.

## 20. MVP Scope and Exclusions

The MVP prioritizes:

1. Store layout and navigation.
2. Product catalogue and collections.
3. Product details and search/filtering.
4. Cart and server-validated checkout.
5. Cash on Delivery.
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

Provider-dependent payments, real analytics, external messaging, advanced reporting, and other integrations may remain pending until access and approvals are available.

Do not substitute fake integrations for working features.

## 21. Acceptance Criteria

The MVP is ready for owner review when:

- The main pages work at mobile and desktop sizes.
- All eight collections can be represented.
- Product data and prices are sourced from actual configured records.
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
- A valid COD order can be created once and viewed in the admin dashboard.
- Unauthorized users cannot access admin functions.
- Order status can be checked without exposing other customers' information.
- Policies and contact details are either approved or clearly marked as pending.
- SEO metadata and sitemap behaviour are checked.
- Relevant tests and build checks pass.
- Known limitations and unconfigured integrations are documented.
- Supplier settlement, delivery-cost responsibility, returns/damaged-product handling, and the order-transmission method are owner-approved or clearly marked PENDING.
- No supplier identity, cost, contact detail, agreement, or internal margin is exposed on a customer-facing page.

Owner approval is still required before production deployment.
