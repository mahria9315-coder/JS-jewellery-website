# JS Jewellers — Payment Methods and Settlement Evaluation

**Status:** Client-approved payment methods recorded 7 November 2026. The server-only configuration boundary, checkout payment step, order/payment records, and manual verification workflow are implemented as of 8 November 2026. **No method is live because no account values are configured and no administrator account exists.**
**Approved methods:** **Bank Transfer (Islamic Bank)** and **Easypaisa**.
**Scope:** This document records the approved methods, the server-only configuration rules, the implemented manual-payment workflow, the checkout dependency, and the separation of customer payment from supplier settlement.
**Sources:** `spec.md` §9–§11, `AGENTS.md` §8, `plan.md` §5.3, and the public provider pages cited below.

This document records requirements, open decisions, and current status. It does not activate a payment service, add account numbers, install a payment SDK, or process a payment. No method may be described as working without an approved, tested implementation and configured account values.

## 1. Hard rules

These rules come from `AGENTS.md` §8 and `spec.md` §10 and apply to every method:

- The client-approved payment methods are **Bank Transfer (Islamic Bank)** and **Easypaisa** only.
- No other payment method is in the approved scope.
- Cash on Delivery is not part of the current approved list. The earlier COD + Bank Transfer scope in this repository is superseded.
- Bank Transfer and Easypaisa require a clear manual verification process. Payment remains unverified until an authorised person checks it.
- Account numbers and any confirmed account-holder names are server-only. They must never be committed, logged, rendered on public pages, exposed through public APIs or client bundles, or included in documentation, screenshots, test output, or reports.
- Never use `NEXT_PUBLIC_` variables for private account numbers.
- `.env.example` may contain placeholder variable names only, never real values.
- Do not claim any payment gateway is integrated before a real integration has been configured and tested.
- Never collect or store payment-card details, PINs, OTPs, or bank-login credentials.
- Customer payment status, supplier settlement status, and order/fulfilment status are separate.
- Do not simulate a successful online payment or claim that payment has been received or verified.
- Do not trust totals or payment status supplied by the browser.
- Do not derive profit from an unverified cost or an unconfirmed settlement.

## 2. Current status at a glance

| Method | Customer-facing availability | Implementation status | Blocker |
|---|---|---|---|
| Bank Transfer (Islamic Bank) | **Unavailable** | **CHECKOUT + MANUAL VERIFICATION IMPLEMENTED; PAYMENT BLOCKED** | `PAYMENT_BANK_ACCOUNT_NUMBER` and `PAYMENT_BANK_ACCOUNT_HOLDER` are not configured. |
| Easypaisa | **Unavailable** | **CHECKOUT + MANUAL VERIFICATION IMPLEMENTED; PAYMENT BLOCKED** | `PAYMENT_EASYPAISA_NUMBER` and `PAYMENT_EASYPAISA_ACCOUNT_HOLDER` are not configured. |
| Cash on Delivery | Not offered | **NOT IN APPROVED SCOPE** | The client-approved list supersedes the earlier COD scope. Do not implement without a separate approval. |
| JazzCash | Not offered | **OUT OF SCOPE** | Not part of the client-approved list. |
| Debit/credit cards | Not offered | **OUT OF SCOPE** | No card-payment scope is approved, and card details must never be stored directly. |

**No payment method is WORKING.** Cart, checkout, order, manual payment submission, admin verification/rejection, return, and refund code exists and is tested, but both approved methods report themselves unavailable until their account values are configured. No payment gateway, webhook, merchant API, or automatic verification exists. No payment account value is configured. No payment has been received or verified.

## 3. Bank Transfer (Islamic Bank) — approved

### What is approved

- The method is approved under the client-supplied bank label **Islamic Bank**.
- The exact account number and any confirmed account-holder name must be supplied by the owner through a secure server-only channel.
- The customer-facing instructions may be displayed only at the payment step after the customer selects Bank Transfer, once checkout exists.

### Server-only configuration

`lib/payments/config.ts` reads these environment-variable names:

- `PAYMENT_BANK_DISPLAY_NAME` (optional deployment label; the approved **Islamic Bank** name is fixed in code and cannot be renamed by this variable)
- `PAYMENT_BANK_ACCOUNT_NUMBER`
- `PAYMENT_BANK_ACCOUNT_HOLDER`

No value is committed. The configuration module exposes a safe status summary containing only booleans and variable names. Both the account number and account holder are required before the method is considered configured.

### Verification requirements

1. A clear statement that the order is not confirmed as paid until the transfer is verified.
2. A way for the customer to submit a transfer reference or proof through an approved channel.
3. Verification by an authorised administrator against the actual bank record.
4. A recorded verifier, verification timestamp, amount, and reference.
5. No automatic transition to Paid based only on a customer claim.
6. A documented process for duplicate transfers, underpayments, failed transfers, and refunds.

### Current status

**BLOCKED on account values.** Checkout, order creation, payment reference, manual customer submission, and admin verification/rejection are implemented. Bank Transfer remains unavailable and no instruction is rendered while `PAYMENT_BANK_ACCOUNT_NUMBER` or `PAYMENT_BANK_ACCOUNT_HOLDER` is absent. No value is printed or committed.

## 4. Easypaisa — approved

### What is approved

- Easypaisa is an approved manual payment method.
- The Easypaisa number and any confirmed account-holder name must be supplied by the owner through a secure server-only channel.
- The customer-facing instructions may be displayed only at the payment step after the customer selects Easypaisa, once checkout exists.

### Server-only configuration

`lib/payments/config.ts` reads these environment-variable names:

- `PAYMENT_EASYPAISA_NUMBER`
- `PAYMENT_EASYPAISA_ACCOUNT_HOLDER`

No merchant API, merchant account, or automatic verification is approved. This is a manual transfer instruction, not an integrated payment gateway. Both keys are required before the method is considered configured.

### Verification requirements

The same manual evidence rules apply as for Bank Transfer: customer proof, authorised verification against the actual record, a recorded verifier and timestamp, no automatic Paid status, and a documented process for duplicates, underpayments, failed transfers, and refunds.

### Current status

**BLOCKED on account values.** The same checkout and manual-verification workflow as Bank Transfer is implemented. Easypaisa remains unavailable and no instruction is rendered while `PAYMENT_EASYPAISA_NUMBER` or `PAYMENT_EASYPAISA_ACCOUNT_HOLDER` is absent. No value is printed or committed.

### Public verification performed on 4 November 2026

- The official Easypaisa business site advertises business accounts, business solutions, and an `easypaisa merchant` offering: <https://easypaisa.com.pk/business-homepage/>.
- An official corporate onboarding portal exists at <https://registerbusiness.easypaisa.com.pk/>.

These pages confirm that a business offering and onboarding channel exist. They do **not** confirm that JS Jewellers has a merchant account or API access. No merchant account has been created, and none is required for the approved manual-transfer method.

## 5. Cash on Delivery — superseded

Cash on Delivery appeared in the earlier payment scope. The client-approved list now contains only Bank Transfer and Easypaisa, so COD is **not in the approved scope**.

Do not implement, offer, or describe COD as available unless the owner separately approves it and confirms the settlement workflow (who collects payment, who pays the supplier, and when).

## 6. JazzCash — out of scope

JazzCash is not part of the client-approved payment list. Do not implement, offer, or describe it as a launch method.

### Public verification performed on 4 November 2026

- The official JazzCash business site advertises an online Payment Gateway with mobile-account and voucher flows, real-time payment confirmation, and applicable MDR: <https://www.jazzcash.com.pk/business/accept-payments/payment-gateway>.
- The same site provides a route to register a business account: <https://www.jazzcash.com.pk/business/account/register-your-account>.

The research is retained only for a possible future scope change. It does not authorise implementation.

## 7. Customer payment versus supplier settlement

These are separate records and must never be collapsed into one status.

| Dimension | Customer payment | Supplier settlement |
|---|---|---|
| What it records | What the customer owes and has paid | What JS Jewellers owes the supplier for the supplied item |
| Method | Bank Transfer (Islamic Bank) or Easypaisa | Bank transfer or another owner-approved method |
| Evidence | Bank/wallet verification or a verified provider transaction | Supplier invoice/cost record plus payment evidence |
| Status owner | Authorised administrator | Authorised administrator |
| Implemented customer statuses | `PENDING`, `SUBMITTED`, `VERIFIED`, `REJECTED`, `REFUNDED` | Not implemented; supplier settlement remains a separate future record |
| Status set | Server-enforced transitions and audit events | Requires owner-approved settlement workflow before implementation |

The customer payment status set is implemented. The supplier settlement status set is **not** implemented and must not be inferred from customer payment. The final settlement statuses and allowed transitions still require owner approval.

Rules:

- A customer payment does not automatically settle the supplier.
- Settling a supplier does not prove that the customer paid.
- Neither event proves that an order was forwarded, shipped, or delivered.
- Profit is not final until customer payment, supplier cost, delivery cost, and settlement are all verified and reconciled.

## 8. Checkout dependency

- Cart, checkout, order, payment, and admin verification screens now exist.
- Payment instructions are read on the server only after the customer selects a configured method. If the method is unconfigured, order creation refuses it and no instructions are rendered.
- Checkout accepts Pakistan only, shows the 4–7 day delivery estimate as an estimate, and requires explicit acceptance of the return/refund policy before order completion.
- Payment account values are read on the server and are never serialised into the client bundle.
- No fake "Pay now" flow or automatic success exists. The customer submits a reference; an administrator verifies or rejects it manually.

## 9. Security and implementation constraints

Any later implementation must:

- Keep all payment account details in server-side environment variables or an approved secret store.
- Never commit secrets or expose them to the browser.
- Never use `NEXT_PUBLIC_` variables for private account numbers.
- Recalculate amounts and currency on the server before creating or updating a payment.
- Use idempotency or duplicate protection so retries cannot create double payments or orders.
- Avoid logging account numbers, transfer references, or unnecessary personal data.
- Keep customer payment, supplier settlement, and fulfilment histories auditable.
- Never store card numbers, CVV values, PINs, OTPs, or MPINs.

## 10. Testing policy

- Real payment verification is tested only when the owner has authorised the test and credentials are available through a secure channel.
- No simulated success may be presented as a real payment.
- Account values must not be printed in test output or reports.
- Status transitions and totals require tests once the implementation exists.
- Security checks must confirm that private account values do not appear in `.next/static`, tracked files, or public HTML.

## 11. Activation gate

A payment method may be described as available only when all of the following are true:

- [ ] The owner approves the method, customer terms, and settlement workflow.
- [ ] The account number and any confirmed account-holder name are supplied securely.
- [ ] Credentials are stored securely and are not in source control.
- [ ] Server-side validation, duplicate protection, and manual verification are implemented.
- [ ] Customer payment and supplier settlement are recorded separately.
- [ ] The workflow has been tested and the evidence recorded.
- [ ] Customer-facing instructions and policy wording are approved.
- [ ] The status in this document and in `tasks.md` is updated honestly.

Until then, every method remains BLOCKED, PENDING, or out of scope.

## 12. Current implementation state

- `lib/payments/config.ts` implements the server-only configuration boundary and a safe status summary.
- `.env.example` contains placeholder names only.
- `lib/orders/create.ts` creates orders transactionally with server-recomputed prices, publication/orderability checks, atomic stock reservation, cost snapshots, and idempotency.
- `lib/orders/payments.ts` implements customer submission and admin-only verification/rejection with `PaymentEvent` and `AdminAuditLog` records.
- `lib/returns/refund.ts` and the admin return screens implement protected-case and 25%/75% refund calculation server-side.
- Checkout, order lookup, and admin routes exist behind server-side validation and database-backed authentication.
- No payment gateway, webhook, merchant API, or automatic verification exists.
- No payment account value is configured or published. No payment has been received or verified.
- 69 focused `node --test` tests cover cart, checkout, payment transitions/configuration, order status/numbering, refunds, publication safeguards, admin cryptography, signed payloads, and rate limiting.
- `npm run lint`, `npm run typecheck`, `npm run check:contrast`, and `npm run build` pass. The production catalogue is empty, so a complete real-customer order was not executed.
