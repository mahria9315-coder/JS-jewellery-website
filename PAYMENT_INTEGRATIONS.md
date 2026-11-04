# J's Jewellery — Payment Provider and Settlement Evaluation

**Status:** T036 evaluation completed 4 November 2026. No payment integration is live.
**Scope:** Cash on Delivery (COD), bank transfer, Easypaisa, JazzCash, and the separation of
customer payment from supplier settlement.
**Sources:** `spec.md` §9–§11, `AGENTS.md` §8, `plan.md` §5.3, and the public provider pages cited
below.

This document records requirements, open decisions, and current status. It does not activate a
payment service, add credentials, install a payment SDK, create a checkout route, or process a
payment. No provider or settlement workflow may be described as working without an approved,
tested implementation.

## 1. Hard rules

These rules come from `AGENTS.md` §8 and `spec.md` §10 and apply to every option:

- Cash on Delivery is required for the MVP, but its settlement workflow is PENDING.
- A COD order must not be marked paid when it is created.
- Bank transfer requires a clear manual verification process. Payment remains unverified until an
  authorised person checks it.
- Do not claim Easypaisa, JazzCash, or any gateway is integrated before a real integration has been
  configured and tested.
- Never collect or store payment-card details.
- Customer payment status, supplier settlement status, and order/fulfilment status are separate.
- Do not simulate a successful online payment.
- Do not trust totals or payment status supplied by the browser.
- Do not derive profit from an unverified cost or an unconfirmed settlement.

## 2. Current status at a glance

| Method | Customer-facing availability | Implementation status | Blocker |
|---|---|---|---|
| Cash on Delivery | Required for the MVP; checkout not built yet | **PENDING** | Collection and settlement responsibilities are not confirmed. Checkout and order tasks are not started. |
| Bank transfer | Not offered | **BLOCKED** | Approved bank details and a manual verification workflow are missing. |
| Easypaisa | Not offered | **BLOCKED** | Merchant eligibility, API access, and provider approval are unverified; no credentials exist. |
| JazzCash | Not offered | **BLOCKED** | Merchant requirements, sandbox access, and provider approval are unconfirmed; no credentials exist. |
| Debit/credit cards | Not offered | **OUT OF SCOPE** | No card-payment scope is approved, and card details must never be stored directly. |

**No payment method is WORKING.** The application currently has no checkout, order, payment,
settlement, or refund implementation. No payment package is installed and no payment credential is
configured.

## 3. Cash on Delivery

### What is already required

- COD is the required MVP payment method.
- The order is created before cash is collected.
- The order must not be marked paid at creation.
- Payment status must remain separate from order and fulfilment status.
- The customer-facing order flow must not expose supplier identity, cost, or settlement details.

### Owner decisions still outstanding

1. Who collects the cash: the courier, J's Jewellery, or the supplier?
2. Who pays the supplier, and at what point?
3. Who bears the delivery cost?
4. What evidence confirms that cash was collected and remitted?
5. How are partial deliveries, cancellations, returns, exchanges, and damaged products handled?
6. How is the supplier settlement reconciled against the amount actually collected?

### Possible settlement models — none approved

The following are illustrative only. They are recorded to make the decision explicit and must not
be treated as selected, implemented, or promised to customers.

- **Model A:** J's Jewellery collects through its courier, then pays the supplier separately.
- **Model B:** The supplier collects from the customer and remits J's Jewellery's margin.
- **Model C:** The courier collects and remits to J's Jewellery, which then settles the supplier.

Each model creates different responsibilities, evidence requirements, and cash-flow risks. The
owner must choose one, or define another approved workflow, before COD order handling is built.

### Records required once approved

Per order: amount due, collection method, collector, collection timestamp, customer payment status,
verification evidence, supplier payable, supplier settlement status, settlement reference and date,
delivery-cost bearer, and actual profit once all values are verified.

### Current status

**PENDING.** The requirements are documented, but the settlement model and ownership of each step
are not approved. No COD order handling exists.

## 4. Bank transfer

### Conditions for offering it

Bank transfer may be offered only after the owner supplies approved bank details and a manual
verification workflow. Required elements:

1. Approved account title, bank name, account number/IBAN, and customer-facing instructions.
2. A clear statement that the order is not confirmed as paid until the transfer is verified.
3. A way for the customer to submit a transfer reference or proof through an approved channel.
4. Verification by an authorised administrator against the actual bank record.
5. A recorded verifier, verification timestamp, amount, and reference.
6. No automatic transition to Paid based only on a customer claim.
7. A documented process for duplicate transfers, underpayments, failed transfers, and refunds.

### Current status

**BLOCKED.** No bank details, verification workflow, authorised verifier, or customer-facing
instructions exist. Bank details must never be committed to this repository. No bank-transfer UI or
order state exists.

## 5. Easypaisa

### Public verification performed on 4 November 2026

- The official Easypaisa business site advertises business accounts, business solutions, and an
  `easypaisa merchant` offering: <https://easypaisa.com.pk/business-homepage/>.
- An official corporate onboarding portal exists at
  <https://registerbusiness.easypaisa.com.pk/>.

These pages confirm that a business offering and onboarding channel exist. They do **not** confirm
that J's Jewellery is eligible, approved, or able to use a particular API. No merchant account has
been created.

### Requirements to confirm with the provider

- Business registration, KYC, and eligibility for the store's legal structure.
- Merchant account approval and the supported online-payment product.
- API integration method, environments, and sandbox access.
- Request signing, callback authenticity checks, and replay/duplicate protection.
- Settlement timing, fees, minimum amounts, and reconciliation reports.
- Refund, reversal, dispute, and failed-payment handling.
- Production go-live approval and the owner's acceptance of provider terms.

### Current status

**BLOCKED.** No account, API documentation verified for this store, credential, dependency, route,
or environment variable exists. Easypaisa must not be shown to customers or described as
integrated.

## 6. JazzCash

### Public verification performed on 4 November 2026

- The official JazzCash business site advertises an online Payment Gateway with mobile-account and
  voucher flows, real-time payment confirmation, and applicable MDR:
  <https://www.jazzcash.com.pk/business/accept-payments/payment-gateway>.
- The same site provides a route to register a business account:
  <https://www.jazzcash.com.pk/business/account/register-your-account>.

The official sandbox documentation was referenced by search results but could not be retrieved
during this task, so its API details are **not verified** here. Public marketing pages do not prove
that J's Jewellery can obtain merchant access or pass provider review.

### Requirements to confirm with the provider

- Business registration, required documents, and merchant onboarding approval.
- Merchant identifiers, password/integrity credentials, and their secure storage.
- Correct API version and purchase/wallet transaction flow.
- Sandbox access, test credentials, and callback/return-page verification.
- Settlement timing, fees/MDR, limits, and reconciliation reports.
- Refund, reversal, dispute, and failed-payment handling.
- Production go-live approval and the owner's acceptance of provider terms.

### Current status

**BLOCKED.** No merchant account, credentials, verified sandbox access, dependency, route, or
environment variable exists. JazzCash must not be shown to customers or described as integrated.

## 7. Customer payment versus supplier settlement

These are separate records and must never be collapsed into one status.

| Dimension | Customer payment | Supplier settlement |
|---|---|---|
| What it records | What the customer owes and has paid | What J's Jewellery owes the supplier for the supplied item |
| Method | COD, bank transfer, Easypaisa, JazzCash, or another approved method | Bank transfer or another owner-approved method |
| Evidence | Cash collection record, bank verification, or a verified provider transaction | Supplier invoice/cost record plus payment evidence |
| Status owner | Authorised administrator | Authorised administrator |
| Proposed statuses | Pending, Awaiting Verification, Paid, Failed, Refunded | Not Due, Pending, Paid, Reconciled, Disputed |

The proposed statuses are not approved. `plan.md` §5.1 still lists the order and payment status
workflow as PENDING, so the final status set and allowed transitions require owner approval before
implementation.

Rules:

- A customer payment does not automatically settle the supplier.
- Settling a supplier does not prove that the customer paid.
- Neither event proves that an order was forwarded, shipped, or delivered.
- Profit is not final until customer payment, supplier cost, delivery cost, and settlement are all
  verified and reconciled.

## 8. Provider access and approval dependencies

| Dependency | Owner/provider | Status | Evidence required before use |
|---|---|---|---|
| COD collection and settlement model | Owner | PENDING | Written decision covering collector, payer, timing, and delivery cost. |
| Bank account details and verification workflow | Owner / bank | BLOCKED | Approved instructions, authorised verifier, and reconciliation process. |
| Easypaisa merchant account and API access | Owner / Easypaisa | BLOCKED | Onboarding approval, sandbox access, API documentation, and production approval. |
| JazzCash merchant account and sandbox access | Owner / JazzCash | BLOCKED | Onboarding approval, sandbox access, verified API version, and production approval. |
| Payment status workflow | Owner | PENDING | Approved statuses and transition permissions. |
| Refund and dispute workflow | Owner / provider | PENDING | Approved responsibilities and evidence requirements. |
| Delivery-cost responsibility | Owner | PENDING | Confirmation of who bears the cost in each scenario. |

## 9. Security and implementation constraints

Any later implementation must:

- Keep all credentials in server-side environment variables or an approved secret store.
- Never commit secrets or expose them to the browser.
- Verify provider callbacks and never trust a browser-reported payment result.
- Recalculate amounts and currency on the server before creating or updating a payment.
- Use idempotency or duplicate protection so retries cannot create double payments or orders.
- Avoid logging credentials, payment references, or unnecessary personal data.
- Keep customer payment, supplier settlement, and fulfilment histories auditable.
- Never store card numbers, CVV values, PINs, or MPINs.

## 10. Testing policy

- Real integrations are tested only when the owner has authorised the test and credentials are
  available through a secure channel.
- Sandbox or test environments are used before production wherever the provider offers one.
- No simulated success may be presented as a real payment.
- Production verification, if ever required, must follow an owner-approved controlled test and be
  recorded.
- Status transitions and totals require tests once the implementation exists.

## 11. Activation gate

A payment method may be described as available only when all of the following are true:

- [ ] The owner approves the method, customer terms, and settlement workflow.
- [ ] Provider access and production approval exist where applicable.
- [ ] Credentials are stored securely and are not in source control.
- [ ] Server-side validation, callback verification, and duplicate protection are implemented.
- [ ] Customer payment and supplier settlement are recorded separately.
- [ ] The workflow has been tested and the evidence recorded.
- [ ] Customer-facing instructions and policy wording are approved.
- [ ] The status in this document and in `tasks.md` is updated honestly.

Until then, every method remains PENDING, BLOCKED, or out of scope. T036 does not authorise
activation or real payment testing.

## 12. Current implementation state

- No checkout form, order model, payment model, payment route, webhook, or settlement record exists.
- No payment provider package or dependency is installed.
- No payment credential or provider account is configured.
- No customer has been asked to pay through this application.
- T019 and later checkout, order, payment, and admin tasks have not started.
