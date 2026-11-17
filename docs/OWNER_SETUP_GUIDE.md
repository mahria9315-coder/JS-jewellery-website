# JS Jewellers — Owner Setup and Administration Guide

**Prepared:** 11 November 2026; refreshed 12 November 2026
**Audience:** The website owner (client). Written for handover.
**Status:** The application is complete for owner administration. Live selling still requires the owner-supplied values listed in §7.

Companion guides: `docs/SUPPLIER_ONBOARDING.md` (supplier and product evidence),
`docs/COURIER_ONBOARDING.md` (courier gates), `docs/BACKUP_RESTORE.md`
(backup/restore), and `docs/MONITORING_AND_SECURITY.md` (logging, headers,
monitoring gaps).

This guide explains how you, the business owner, take control of the website:
creating your own first administrator account, signing in, and running the
day-to-day operations yourself. The developer does not need an account, does
not keep one, and cannot create your account for you.

No secret value appears in this guide. Where a secret is needed, the guide
tells you how to generate it yourself and keep it private.

---

## 1. What the website owner controls

- The first **Super Admin** account — created only by you, only once.
- All day-to-day administration: products, categories, brands, images,
  suppliers, inventory, orders, payments, returns and refunds, customers,
  homepage and site content, business contact details, shipping and courier
  settings, SEO, staff accounts, and the audit log.
- The decision to publish or not publish anything. Nothing goes live to
  customers until you approve it in the admin panel.

## 2. Before you start: server configuration

The person deploying the website (hosting provider or developer acting on
your instruction) must set these **server-side environment variables** first.
Ask them to confirm each one before you begin:

| Variable | What it is for |
| --- | --- |
| `DATABASE_URL` | Connects the site to its PostgreSQL database (on Neon, the pooled, TLS connection string). |
| `DATABASE_POOL_MAX` | Optional; limits the Prisma/pg connection pool. Serverless hosts usually need a small value or the Neon pooled endpoint. |
| `NEXT_PUBLIC_SITE_URL` | The public website address, e.g. `https://www.yourdomain.pk`. |
| `CHECKOUT_DRAFT_SECRET` | Long random value protecting signed checkout drafts. Required in production. |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for durable product-image uploads. Create the Blob store in the Vercel project and let Vercel inject it. |
| `ADMIN_SETUP_SECRET` | One-time value that unlocks first-admin setup. Generate it yourself (§3). |
| `ADMIN_MFA_ENCRYPTION_KEY` | **Required in production.** 32-byte key (base64 or 64 hex characters) that encrypts administrator authenticator secrets. Generate it yourself (§4A) and keep it safe. |
| `ADMIN_MFA_CHALLENGE_SECRET` | Optional. Signs the short-lived MFA challenge; when unset, `CHECKOUT_DRAFT_SECRET` is used. |
| `RATE_LIMIT_PROVIDER` | **Required in production.** Set to `upstash` so every server instance shares rate-limit counters. |
| `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` | Required when `RATE_LIMIT_PROVIDER=upstash`. Create the Upstash Redis store in your own account and copy the HTTPS REST URL and token into the hosting secret settings. |
| `PAYMENT_BANK_ACCOUNT_NUMBER` and `PAYMENT_BANK_ACCOUNT_HOLDER` | Your Islamic Bank account details for Bank Transfer. |
| `PAYMENT_EASYPAISA_NUMBER` and `PAYMENT_EASYPAISA_ACCOUNT_HOLDER` | Your Easypaisa account details. |
| `PAYMENT_BANK_DISPLAY_NAME` | Optional label for the Bank Transfer method; when unset the approved name “Islamic Bank” is used. |

`ADMIN_SESSION_SECRET` is **not required**. Administrator sessions are
database-backed opaque tokens, not signed with this value. It may be omitted
entirely; set `CHECKOUT_DRAFT_SECRET` instead.

**Two settings are new in this release and are launch-blocking owner actions:**

- **Administrator MFA is always required in production.** Without
  `ADMIN_MFA_ENCRYPTION_KEY`, no administrator can complete enrolment, so no one
  can get past the MFA gate. Generate the key as described in §4A and store it in
  the hosting secret manager before launch. Losing this key makes every enrolled
  authenticator unreadable.
- **Shared rate limiting is required across instances.** Production refuses to
  fall back to per-process counters. Create the Upstash store, set
  `RATE_LIMIT_PROVIDER=upstash`, `UPSTASH_REDIS_REST_URL`, and
  `UPSTASH_REDIS_REST_TOKEN`, then run `npm run env:check`. See
  `docs/RATE_LIMITING.md`. If Upstash is unreachable, rate-limited actions fail
  closed rather than allowing traffic.

Full detail: `docs/ADMIN_MFA.md` and `docs/RATE_LIMITING.md`.

Rules the application enforces (and you should too):

- Never put the word `NEXT_PUBLIC_` in front of a private variable; that prefix
  makes a value visible in the browser.
- Never send account numbers, secrets, or passwords by chat or email to the
  developer. Supply them through the hosting provider's secret settings.
- The payment variables are read only on the server. Until both values for a
  method are set, that payment method stays hidden at checkout — no example or
  placeholder number is ever shown.

## 3. Create your first Super Admin (one-time, you only)

1. **Generate a setup secret yourself** on your own computer and keep it
   private. For example, in a terminal:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
   ```

2. Set it as the server environment variable `ADMIN_SETUP_SECRET` (or give it
   to whoever operates the server through a channel you trust). It is never
   shown on any website page.
3. Make sure the server is running with that variable set.
4. Visit **`/admin/setup`** on your website. This page exists **only while no
   administrator account exists**. It asks for:
   - your name,
   - your email address,
   - a password of **12 characters or more** (choose a long, unique one; never
   share it, not even with the developer),
   - the same password again, and
   - the setup secret from step 1.
5. Submit the form. Your Super Admin account is created and signed in.
6. **Enrol your authenticator immediately.** In production you are taken to
   **`/admin/mfa`**. Follow §4A, save the ten recovery codes offline, and confirm
   the six-digit code. You cannot reach any other administrator screen until
   this is done.
7. Confirm that **`/admin/setup` no longer offers to create an account** — it
   is permanently disabled once any administrator exists.
8. **Remove `ADMIN_SETUP_SECRET` from the server environment** after setup
   completes, then redeploy/restart so the old value is no longer loaded. Setup
   stays disabled because an administrator now exists, even if the variable were
   left behind. If you must keep setup available while you finish handover,
   rotate the secret first (generate a new value, replace the old one, restart),
   and remove it as soon as you are done. Never reuse the setup secret as a
   password or as any other secret.

## 4A. Set up administrator multi-factor authentication

Production **always** requires a second factor. Before you create the Super
Admin:

1. Generate the MFA encryption key on your own computer:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

2. Store it as `ADMIN_MFA_ENCRYPTION_KEY` in the hosting provider's secret
   manager. Never put it in a chat, email, screenshot, or the repository. Back it
   up somewhere only you control; if it is lost, every enrolled authenticator
   must be re-enrolled.
3. Optionally generate a separate `ADMIN_MFA_CHALLENGE_SECRET` (32+ characters).
4. After signing in, open **`/admin/mfa`** and select **Start authenticator
   setup**.
5. Add the account to your authenticator app with the displayed setup key or
   setup URI.
6. Enter the current six-digit code to confirm. Ten recovery codes are shown
   **once**.
7. Write the recovery codes on paper or store them in a safe you control. Do not
   keep them in email, chat, the repository, or a shared drive.
8. Regenerate the codes from `/admin/mfa` if the sheet is lost or may have been
   seen. Regeneration invalidates every previous code.

**If you lose the authenticator device:** use one recovery code to sign in, then
regenerate the recovery set. **If you lose both the device and the codes:** a
Super Admin must reset your MFA from **Admin → Users → your account**. The reset
is audit-logged and you re-enrol at next sign-in. Full guide:
`docs/ADMIN_MFA.md`.

**Rotating or removing the setup secret later:** the setup page is permanently
disabled once any administrator exists, so the secret is no longer an access
path. Rotating it is still good hygiene if it may have been exposed. Remove it
entirely once handover is complete; the application does not need it for normal
sign-in, staff accounts, or break-glass recovery.

What makes this safe: the secret is compared on the server in constant time;
the account is created inside a database transaction with a lock so two
simultaneous claims cannot both succeed; your password is stored only as a
salted scrypt hash; and once any administrator exists the setup page can
never create another account.

**If you ever lose access** (for example, you forget the password and cannot
recover it), there is a break-glass script, `npm run admin:bootstrap`, that
only you or someone you explicitly authorize may run on the server. It reads
the new credentials from environment variables, never prints the password,
and resets the named account to an active Super Admin. It is documented in
the project README. It is a recovery path, not the normal handover path.

## 4. Signing in day to day

- Address: **`/admin/login`**.
- Enter your email and password. If an authenticator is enrolled — which is
  required in production — the next screen asks for a six-digit code from your
  authenticator app, or one of your recovery codes. A password alone does not
  create a session.
- After several failed attempts the account locks for 15 minutes. MFA
  verification is also rate limited.
- Sessions can be revoked from the admin panel, and you can change your
  password from **Admin → Account**.
- You can review your MFA status and regenerate recovery codes from
  **`/admin/mfa`**.
- Only the Super Admin (you) can create staff accounts, reset passwords, clear
  lockouts, reset another administrator's MFA, or change role permissions. The
  last active Super Admin cannot be disabled or demoted.
- When you create a staff account, require that person to enrol an authenticator
  at their first sign-in.

## 5. Routine operations you can manage yourself

All of these are in the admin panel (`/admin`) and require no developer help:

| What | Where |
| --- | --- |
| Products: create, edit, price, publish/unpublish, feature, archive, internal notes, SEO fields | Admin → Products |
| Product images (upload/remove, with alt text) — Vercel Blob in production; local development storage when Blob is unset | Admin → Products (image upload) / Media |
| Categories, brands | Admin → Categories / Brands |
| Suppliers: create, edit, archive/restore (archive is blocked while published products are linked) | Admin → Suppliers |
| Inventory and stock movements, low-stock thresholds | Admin → Inventory |
| Orders and order status, production status, internal notes, courier shipment tracking | Admin → Orders |
| Payment records: customers submit references; you verify or reject manually — nothing is ever auto-verified | Admin → Orders (payment section) |
| Returns and refunds: requests, approvals, refund reference recording | Admin → Returns |
| Customers | Admin → Customers |
| Homepage hero text/image/buttons, site content pages, navigation | Admin → Content / Homepage / Navigation |
| Business contact details (email, WhatsApp, opening hours) | Admin → Settings → Business |
| Delivery estimate, Pakistan zone, courier configuration (see §6) | Admin → Settings → Shipping |
| Payment method labels and public instructions (account numbers cannot be entered there) | Admin → Settings → Payments |
| SEO and website settings | Admin → SEO |
| Staff accounts, roles, audit log | Admin → Users / Roles / Audit |

Notes:

- **Product variants** (like size or metal sub-options) were never part of the
  approved specification, so no variant management exists. Per-order personalisation
  is handled by the approved custom-name jewellery flow on each product.
- The catalogue is empty by design. Nothing is orderable until you add real
  supplier-backed products with prices, stock, and rights you control.
- Supplier records may remain empty until you have real supplier information;
  adding demo or invented supplier/product data is deliberately not supported.
  The full evidence and publication rules are in `docs/SUPPLIER_ONBOARDING.md`.

## 6. Couriers

No courier company is predefined in the store. You add the courier companies
you use from **Admin → Settings → Shipping**, with an optional contact
reference and a tracking URL template. **None is approved or operational until
you approve it.** The store keeps working normally: Pakistan orders ship
without a named courier and no shipping charge until a courier is fully
approved.

Important safety rule: many courier companies restrict or prohibit jewellery
under their standard terms. Do not record jewellery acceptance for any courier
until that company confirms in writing that it will carry your jewellery.

To add and make a courier usable, in this order:

1. Add the courier company with its name, delivery scope (Pakistan domestic
   or international), and optional contact details. Adding it is not
   approval: it starts "Not configured".
2. Open and verify the courier account (record an evidence reference such as
   an agreement or account confirmation).
3. Obtain and record written jewellery acceptance from the courier (evidence
   reference required by the form).
4. List the jewellery categories that are approved.
5. Add each destination country with an approved charge and estimate days,
   marked verified against courier confirmation. Domestic couriers accept
   Pakistan only; international couriers accept other countries only.
6. Set the courier status to Active. The server refuses to activate until
   steps 2–5 exist for at least one destination.

Until every gate passes, the courier appears nowhere to customers and no
shipping charge is ever applied from it. If two couriers are fully approved
for the same destination, the one first by company name is used.

Cash on delivery is not offered. Enabling it would be a separate future
decision with its own settlement workflow.

The full gate list, evidence requirements, and audit rules are in
`docs/COURIER_ONBOARDING.md`.

## 7. What still needs you before the store can sell

These stay closed until you supply them (tracked in `tasks.md`):

1. **Payment account values** — Islamic Bank and Easypaisa details (§2). Until
   set, checkout shows a "payment details not configured" notice instead of
   taking orders.
2. **Supplier data** — approved supplier records, products, costs, stock, and
   image rights. The catalogue stays empty until real data exists.
3. **Courier confirmations** (§6) for any courier shipping.
4. **Legal review** — the `/privacy`, `/terms`, `/returns`, and `/shipping`
   pages are published for review with pending-approval notices and `noindex`; a
   qualified legal review must approve the wording before launch and before the
   notices are removed. The 25% change-of-mind deduction never applies to
   defective, damaged, incorrect, or legally protected returns.
5. **Hosting, domain, and deployment approval** — see
   `docs/PRODUCTION_READINESS.md` for the deployment checklist. Nothing may be
   deployed until you explicitly approve it.
6. **Backups and monitoring** — confirm the production database backup/PITR
   position (`docs/BACKUP_RESTORE.md`) and configure hosting-layer monitoring
   (`docs/MONITORING_AND_SECURITY.md`).
7. **Administrator MFA key and first enrolment** — generate
   `ADMIN_MFA_ENCRYPTION_KEY`, enrol the Super Admin, and store the recovery
   codes offline (§4A, `docs/ADMIN_MFA.md`).
8. **Shared rate-limit store** — create the Upstash Redis store and set the
   three rate-limit variables; production fails closed without them
   (`docs/RATE_LIMITING.md`).
9. **WAF and bot protection** — put the approved domain behind an edge/WAF, add
   stricter rules for `/admin/*` and login, and assign alert ownership
   (`docs/WAF_AND_BOT_PROTECTION.md`).
10. **CI and dependency scanning** — review the local workflow files, commit
    them deliberately, enable CodeQL and Dependabot, and protect `main`
    (`docs/CI_AND_DEPENDENCY_SCANNING.md`).

## 8. Quick security rules for the owner

- Never share your password, the setup secret, or the MFA encryption key with
  anyone, including the developer.
- Keep your recovery codes offline and separate from your authenticator device.
  A recovery code is as powerful as a password.
- Create staff accounts only for people you trust, with the narrowest role
  that covers their work, and require MFA enrolment at first sign-in.
- Check **Admin → Audit** periodically to see every administrative change,
  including MFA enrolment and resets.
- If a staff member leaves, disable their account immediately.
- If you suspect an account is compromised, change the password, reset MFA,
   revoke sessions from the admin panel, and review the audit log.
- Never set `RATE_LIMIT_ALLOW_MEMORY_IN_PRODUCTION=true` on a multi-instance
   deployment; it silently removes the shared limit.
