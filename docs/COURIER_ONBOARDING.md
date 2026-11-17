# JS Jewellers — Courier Onboarding and Audit Guide

**Prepared:** 12 November 2026
**Audience:** The website owner (client) and authorised staff.
**Status:** Reference guide only. No courier company is predefined, added,
verified, approved, or operational. Every courier is an owner action recorded
through the Admin Panel.

This guide explains the fail-closed courier rules the application enforces,
the evidence required before a courier is used, and what remains an owner
action. It does not select a courier, contact a courier, invent acceptance, or
enable cash on delivery.

The implementation lives in `lib/couriers/config.ts`,
`lib/couriers/selection.ts`, and `lib/admin/settings.ts`. `tests/courier.test.mjs`
asserts the gates, including the requirement that an unapproved courier is never
offered or charged.

---

## 1. The rule that never changes

A courier is used for a destination only when **every** gate below passes:

| Gate | Required state |
| --- | --- |
| Courier status | `ACTIVE` |
| Courier account verification | `VERIFIED` |
| Written jewellery acceptance | `ACCEPTED` |
| Destination record | Active |
| Destination verification | Verified against courier confirmation |
| Destination jewellery categories | Cover every product in the order |
| Destination charge | An approved, non-null amount |
| Destination estimate | Approved minimum and maximum days |

If any gate fails, the courier is not offered to the customer and **no shipping
charge is ever applied from it**. A missing charge means “not approved yet”,
never an invented price. An empty approved-category list approves nothing.

The store keeps working while every courier is unapproved: Pakistan checkout
keeps the existing free-shipping behaviour and the published 4–7 day estimate,
and international destinations remain unavailable. Cash on delivery is not
offered anywhere and is impossible in the schema, validation, and tests.

## 2. Status and evidence model

Courier statuses: `NOT_CONFIGURED`, `PENDING_VERIFICATION`, `APPROVED`,
`ACTIVE`, `SUSPENDED`.

Account verification: `UNVERIFIED`, `PENDING`, `VERIFIED`.

Jewellery acceptance: `NOT_ACCEPTED`, `PENDING_CONFIRMATION`, `ACCEPTED`.

A courier added through the Admin Panel starts as `NOT_CONFIGURED`, with an
`UNVERIFIED` account and `NOT_ACCEPTED` jewellery acceptance. Adding a courier
is never approval.

The server explicitly refuses:

- `APPROVED` status while the account is not `VERIFIED`;
- `ACTIVE` status while the account is not `VERIFIED`;
- `ACTIVE` status while jewellery acceptance is not `ACCEPTED`;
- `ACTIVE` status without at least one destination that passes every
  destination gate.

These checks run on the server even if a form is crafted to skip the UI.

## 3. Owner onboarding sequence

Do this in the Admin Panel under **Settings → Shipping**, in this order. Use the
real courier company you have a genuine relationship with.

1. **Add the courier company.** Enter the company name, delivery scope
   (Pakistan domestic or international), and optional contact details and
   tracking URL template. It starts “Not configured”.
2. **Verify the account.** Confirm the courier account through a channel you
   trust and record the evidence reference.
3. **Record written jewellery acceptance.** Many couriers restrict or prohibit
   jewellery under standard terms. Do not record `ACCEPTED` until the courier
   confirms **in writing** that it will carry your jewellery. Record the
   evidence reference.
4. **List the approved jewellery categories.** Approval must cover every
   category you intend to ship with this courier.
5. **Add the destination(s).** For each country, record an approved charge,
   approved estimate days, and verification against the courier's confirmation.
   Domestic couriers accept Pakistan only; international couriers accept other
   countries only.
6. **Set the status to Active.** The server refuses until steps 2–5 exist for at
   least one destination. When two couriers are fully approved for the same
   destination, the one first by company name is used.
7. **Test an order.** Place a genuine test order through the approved workflow
   only where safe and non-production; confirm the shipping charge and estimate
   come from the approved values.

## 4. Tracking

- A tracking URL is built only from an admin-approved HTTPS template containing
  the single `{trackingNumber}` placeholder and a validated tracking reference.
- Courier fulfilment moves only along the approved workflow; a shipment cannot
  skip steps.
- Customer-facing shipping pages never publish courier names by design.

## 5. What is deliberately not implemented

- No courier company, tracking URL, destination, charge, or estimate is
  hardcoded or seeded.
- No courier API integration, label generation, pickup booking, or automatic
  tracking sync is implemented.
- No courier is contacted automatically.
- Cash on delivery is never offered.
- No shipping charge is invented when a courier is unapproved.

## 6. Audit and evidence retention

- Every courier create/update, account verification, jewellery acceptance,
  destination change, and status change is written to the admin audit log with
  the acting administrator's email.
- Keep the courier agreement, written jewellery acceptance, account
  confirmation, and destination/charge confirmation outside the application in
  a controlled store. The application records references, not the documents.
- Re-check charges and estimates periodically. A stale approval is a reason to
  re-confirm, not proof of the current price.
- Suspending a courier removes its destinations from the customer delivery list
  immediately.

## 7. Owner actions still required

1. Choose the courier companies you actually use.
2. Verify each account and record the evidence reference.
3. Obtain written jewellery acceptance from each courier.
4. Approve the jewellery categories, destinations, charges, and estimates.
5. Activate each courier only after every gate passes.
6. Provide the courier contact details and tracking template if you want
   customer tracking links.
7. Approve any future decision to offer cash on delivery as a separate
   settlement workflow.
