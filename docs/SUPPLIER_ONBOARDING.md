# JS Jewellers — Supplier Onboarding and Audit Guide

**Prepared:** 12 November 2026
**Audience:** The website owner (client) and any authorised staff member.
**Status:** Reference guide only. No supplier, product, agreement, SKU, cost,
stock level, or image right is recorded in the repository. Every
supplier-backed product must be created and evidenced by the owner through the
Admin Panel.

This guide records how the application enforces supplier-backed publication and
ordering, what evidence is required, and what remains an owner action. It does
not create suppliers or products, does not invent data, and does not change the
safeguards.

Nothing here replaces a written supplier agreement, a tax review, or legal
advice. The owner is responsible for the accuracy and lawfulness of every
supplier relationship and every product claim.

---

## 1. The rule that never changes

A product may not be published unless **all** of the following are true. The
server re-checks these conditions; hiding a button is never the safeguard.

| Evidence | Required state |
| --- | --- |
| Supplier business status | `ACTIVE` |
| Supplier identity verification | `VERIFIED` |
| Supplier agreement | `APPROVED` |
| Supply authorization in the agreement | Confirmed |
| Image usage rights granted in the agreement | Confirmed |
| SKU | Present and confirmed |
| Selling price | Greater than zero and approved |
| Product content (copy, specifications) | Approved |
| Image rights on each image | `CONFIRMED` and approved |
| At least one approved product image | Recorded |
| Supplier availability check | Verified with a timestamp |

Ordering adds three more requirements: the product must be `PUBLISHED`, its
availability must be `IN_STOCK`, and any recorded stock quantity must be greater
than zero. A product that fails publication can never be orderable.

The implementation lives in `lib/suppliers/publication.ts`. The tests in
`tests/publication.test.mjs` assert every gate, including the demo-content
block.

## 2. Permissions

Supplier work is split across three permissions so that one person cannot
silently approve a supplier they created:

| Permission | Allows |
| --- | --- |
| `suppliers.view` | Read supplier and agreement records. |
| `suppliers.manage` | Create and edit supplier records and supplier details. |
| `suppliers.verify` | Record the agreement, verification, and approval evidence. |

`suppliers.manage` alone **cannot** mark a supplier `VERIFIED`. The server
requires the dedicated `suppliers.verify` permission for any create or update
that sets the verification status to `VERIFIED`. This is enforced in
`lib/actions/admin.ts` and guarded by `tests/privacy-guards.test.mjs`.

The Super Admin controls which staff member has which permission. Use the
narrowest role that covers the work.

## 3. Owner onboarding sequence

Do this in the Admin Panel, in this order. Replace the examples with your real,
approved information; never use demo data.

1. **Create the supplier record.** Provide the legal name, optional trading
   name, contact name, email, phone, and internal notes. Set the business
   status to `DRAFT` or `PENDING_VERIFICATION` while you gather evidence.
2. **Record identity verification.** With `suppliers.verify`, set the
   verification status to `VERIFIED` only after you have checked the supplier's
   identity and business details through a channel you trust.
3. **Record the agreement.** Enter the agreement status, whether supply is
   authorized, whether image rights are granted, the document reference, the
   received/valid-from/valid-until dates, and notes. Set the agreement status
   to `APPROVED` only after the agreement is actually approved.
4. **Create the product.** Enter the real name, description, collection,
   category, brand, supplier, SKU, currency, selling price, and any approved
   customization options. Mark the SKU as confirmed; do not mark content or
   price approved until they are.
5. **Upload genuine product images.** Each image needs meaningful alternative
   text. Record image rights as `CONFIRMED` only where you hold the rights.
   Uploaded product images use Vercel Blob in production (see
   `docs/PRODUCTION_READINESS.md`); local development keeps its local storage.
6. **Verify availability.** Record the supplier availability check with a
   current timestamp and the confirmed stock position.
7. **Publish.** Publication is allowed only when every gate in §1 passes. If a
   blocker remains, the product stays unpublished and the admin page shows why.
8. **Record costs, stock, and settlement separately** where your business
   process requires them. Cost and margin data are internal and must never
   appear in a customer-facing page, structured data, or order projection.

## 4. What is deliberately not implemented

- No supplier, product, agreement, cost, stock, or image record is seeded or
  invented.
- No demo supplier or demo product exists in the database. Demo content is
  approved for development/preview only and is identified by an explicit
  `DEMO` marker; it can never be published or ordered (see §6).
- No supplier order-transmission integration, EDI connection, or automated
  stock sync is implemented.
- No supplier settlement, payout, or commission calculation is implemented.
- No automated availability verification exists; the timestamp is recorded by
  an authorised person.

## 5. Audit and evidence retention

- Every supplier create/update and agreement change is written to the admin
  audit log with the acting administrator's email.
- Keep the signed agreement, identity evidence, image-licence evidence, and
  availability confirmations outside the application in a controlled store.
  The application records references, not the documents themselves.
- Re-verify availability before relying on it. A stale timestamp is a reason to
  re-check, not proof of current stock.
- If a supplier is suspended, its products must be unpublished. Archiving a
  supplier is refused while published products are linked.

## 6. Demo content rules

Demo products, demo images, and demo data are for development and preview only:

- A record is treated as demo content when its slug, SKU, or name begins with an
  explicit `DEMO` marker (`demo-ring-01`, `DEMO-SKU-1`, `DEMO Ring`, `[DEMO] …`).
- Demo records are shown with the label **“DEMO — preview only”** in the admin
  list, edit page, and preview.
- Demo records can never be published, even with otherwise complete evidence.
- Demo records can never be ordered, even if they were somehow published and
  marked in stock.
- The production catalogue is intentionally empty. Never use a demo record to
  satisfy a release gate.

## 7. Owner actions still required

1. Supply approved supplier identities, agreements, and image rights.
2. Supply real SKUs, costs, selling prices, stock, and availability evidence.
3. Record an agreed availability-verification method and freshness window.
4. Decide the supplier order-transmission method and fulfilment evidence.
5. Approve supplier settlement, delivery-cost responsibility, and the
   actual-profit formula.
6. Obtain any legal or tax review the business requires.
7. Enter all of the above in the Admin Panel; do not ask the developer to
   invent it.
