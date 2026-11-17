# JS Jewellers

Next.js storefront for JS Jewellers. This repository contains the verified T003A baseline, T004 design tokens, T005 shared layout, T006 homepage, T008-T010 collections and product pages, and T011 search/filtering/sorting. T003B aligned the governing documentation with the approved brand, demo-content, and payment decisions. The production catalogue is intentionally empty until approved supplier-backed product records exist. Demo products and demo images are approved for development/preview only: any record explicitly marked `DEMO` is labelled in the admin panel and can never be published or ordered. PostgreSQL 18 and Prisma 7 are configured and verified for local development, and the owner-approved T013A/T052 migrations added the supplier/catalogue, order/payment/return, and admin schema. The cart, checkout, order, manual-payment, return, refund, supplier, product, and guarded admin workflows exist, but both approved payment methods remain unavailable until their server-only account values are configured. Product images use Vercel Blob in production (with a local development fallback) and fail closed if no Blob token is configured. Courier support is a generic, owner-managed registry behind fail-closed gating: no courier company is predefined, and none is approved or operational, so accounts, jewellery acceptance, charges, destinations, and activation remain owner actions recorded in the Admin Panel. No administrator account exists until the website owner completes the secure one-time `/admin/setup` flow during handover; the break-glass bootstrap script is an owner-run recovery option only. The privacy, terms, returns, and shipping pages are drafts marked pending owner approval and `noindex`. Formal legal review and final owner approval remain outstanding. No live payment or marketing integration is active. The domain is not finalized, and Vercel is only a future hosting option.

See `AGENTS.md`, `spec.md`, `plan.md`, and `tasks.md` for the approved requirements and task status. See `DESIGN_SYSTEM.md` for colour, typography, spacing, and focus conventions. See `DATABASE.md` for the local PostgreSQL/Prisma topology and migration workflow. See `MARKETING_INTEGRATIONS.md` and `PAYMENT_INTEGRATIONS.md` for integration requirements and their current pending, blocked, or deferred status. No integration is live. See `REPOSITORY_AUDIT.md` for the T001 repository audit and `QUALITY_VERIFICATION.md` for the T040/T041 responsive, accessibility, and performance evidence. For handover: `docs/OWNER_SETUP_GUIDE.md` is the owner-facing setup and administration guide; `docs/PRODUCTION_READINESS.md` holds the deployment checklist; `docs/SUPPLIER_ONBOARDING.md`, `docs/COURIER_ONBOARDING.md`, `docs/BACKUP_RESTORE.md`, and `docs/MONITORING_AND_SECURITY.md` cover supplier evidence, courier gates, recovery, and monitoring/security. T064 adds `docs/ADMIN_MFA.md`, `docs/RATE_LIMITING.md`, `docs/WAF_AND_BOT_PROTECTION.md`, `docs/CI_AND_DEPENDENCY_SCANNING.md`, `docs/SECURITY_CHECKLIST.md`, and `docs/SECURITY_AUDIT_T064.md`.

## Prerequisites

- Node.js 20.9 or later (verified with Node.js 24.21.0)
- npm 10 or later (verified with npm 11.19.0)
- PostgreSQL 18 running locally for database work (verified with 18.6)

## Setup

```bash
npm install
cp .env.example .env.local   # Windows PowerShell: Copy-Item .env.example .env.local
npm run dev
```

Open <http://localhost:3000>.

`.env.example` contains placeholders only. Do not commit real credentials. The
storefront builds and runs without a database, but the Prisma commands require a
real `DATABASE_URL` in `.env.local`. The verified local setup uses the
`js_jewellers_app` role and `js_jewellers` database; see `DATABASE.md` for the
topology and the migration workflow.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run postinstall` | Regenerate the Prisma Client after `npm install`/`npm ci` (runs automatically; `generated/prisma` is Git-ignored, so a fresh clone needs it before `next build`) |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript compiler without emitting files |
| `npm run check:contrast` | Verify the documented WCAG colour-contrast pairs |
| `npm test` | Run the full Node test suite |
| `npm run env:check` | Validate the production environment variable names/structure without connecting or printing values |
| `npm run env:check:dev` | Validate the local development environment |
| `npm run db:backup:check` | Check that `DATABASE_URL` and `pg_dump` are available; changes nothing |
| `npm run db:backup` | Write a compressed local database dump to `backups/` (never auto-run; see `docs/BACKUP_RESTORE.md`) |
| `npm run db:restore:check` | Check a restore plan against an isolated `RESTORE_DATABASE_URL`; changes nothing |
| `npm run prisma:validate` | Validate the Prisma schema |
| `npm run prisma:generate` | Regenerate the Prisma Client into `generated/prisma` |
| `npm run prisma:status` | Show applied and pending migrations |
| `npm run prisma:deploy` | Apply pending migrations (`prisma migrate deploy`) |
| `npm run prisma:migrate` | Create/apply a development migration (`prisma migrate dev`; needs a shadow database) |
| `npm run admin:bootstrap` | Owner-run break-glass recovery script (reads credentials from server environment; never prints passwords; not the normal handover path) |

## Administrator access (owner handover)

There are **no default administrator credentials**, **no public administrator registration**, and **no developer-owned administrator account**. The website owner (client) creates and owns the first Super Admin account during handover. The developer must not run the setup flow or the bootstrap script, and must not keep an administrator account for themselves.

### Client handover: create the first Super Admin

The normal handover path is the secure one-time `/admin/setup` flow. The website owner performs these steps:

1. The developer configures the database (`DATABASE_URL`) and applies migrations, **without creating any administrator account**.
2. The owner generates a long random setup secret locally:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
   ```

3. The owner sets the secret as a **server-side** environment variable named `ADMIN_SETUP_SECRET` in the deployment's server environment (for local development, in `.env.local`), or supplies it through a secure handover channel agreed with the developer. Never prefix it with `NEXT_PUBLIC_`, never commit it, and never share it in logs, screenshots, or chat.
4. The owner starts or redeploys the application so the server can read the variable.
5. The owner visits `/admin/setup` while no administrator account exists and enters **their own** name, email, password, password confirmation, and the server-configured setup secret.
6. The secret is validated only on the server with constant-time comparison. The first Super Admin is created through the existing secure password hashing and server-session system inside a database transaction with an advisory lock, so two people cannot claim setup at the same time.
7. Once any administrator account exists, `/admin/setup` is permanently disabled and cannot register another account. `/admin/login` is the normal sign-in page.
8. The owner may remove `ADMIN_SETUP_SECRET` from the server environment after setup completes (or rotate it first if handover is still in progress). The owner must not share their password with the developer. Ongoing access is managed from the Admin Panel.

`ADMIN_SESSION_SECRET` is not part of this flow. Administrator sessions are database-backed opaque tokens; the application does not use an HMAC session secret. Set `CHECKOUT_DRAFT_SECRET` for checkout drafts instead.

### Administrator MFA (required in production)

Production always requires a second factor. Before creating the first Super Admin, generate `ADMIN_MFA_ENCRYPTION_KEY` (32 random bytes as base64 or 64 hex characters) and store it in the hosting secret manager. After setup, the owner is sent to `/admin/mfa` to enrol an authenticator and must save the ten one-time recovery codes offline. A password alone never creates a session while an authenticator is enrolled. A Super Admin can reset another administrator's MFA from the user detail page. Full procedure: `docs/ADMIN_MFA.md`.

### Shared rate limiting (required in production)

Production refuses an unset provider and refuses in-memory counters unless explicitly allowed. Create an Upstash Redis store, then set `RATE_LIMIT_PROVIDER=upstash`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN`. The adapter fails closed when the provider is unreachable. Limits and operations: `docs/RATE_LIMITING.md`.

### Ownership and delegation rules

- Only the active **Super Admin** can create or change administrator accounts, reset passwords, clear lockouts, or edit role permissions.
- `users.manage` and `roles.manage` are reserved for the Super Admin role and cannot be granted to any other role. This is enforced on the server; hidden UI controls are not the security boundary.
- Additional staff accounts require explicit Super Admin authorization and are created from `/admin/users`. The Super Admin chooses each staff member's role.
- The last active Super Admin cannot be disabled or demoted.

### Break-glass bootstrap script (owner-run recovery only)

The bootstrap script is **not** the normal handover path and must not be run by the developer. Only the website owner, or someone the owner explicitly authorizes, may use it for controlled server recovery:

```bash
ADMIN_BOOTSTRAP_EMAIL=owner@example.com
ADMIN_BOOTSTRAP_PASSWORD='a-long-unique-password' npm run admin:bootstrap
```

The script reads values from the environment, hashes the password with scrypt, writes only the hash to the database, and never prints the password. Delete the bootstrap environment values after the account is created. Do not use it to create an account on the owner's behalf during normal handover.

## Verification

```bash
npm run check:contrast
npm run lint
npm run typecheck
npm run test
npm run env:check:dev
npm run build
```

All checks must pass before feature work begins.

Database checks (require `.env.local` with a real `DATABASE_URL`):

```bash
npm run prisma:validate
npm run prisma:status
```

`npm run prisma:status` reports `Database schema is up to date!` after the
baseline migration has been applied. See `DATABASE.md` for details.

## Structure

```text
app/                  App Router pages, layout, and design tokens
components/catalogue/ Collection, product, search, and empty-state UI
components/home/      Homepage hero, category navigation, and showcase sections
components/layout/    Shared header, mobile navigation, logo, and footer
lib/                  Collections, navigation, catalogue types, and query validation
prisma/               Prisma schema, migrations, and generated models
generated/prisma/     Generated Prisma Client (ignored by Git)
public/               Static assets (owner logo and approved images not added yet)
scripts/              Repeatable verification, environment, and backup/restore scripts
tests/                Node test suite (245 tests)
docs/                 Handover, readiness, supplier, courier, backup, and security guides
proxy.ts              Real-404 rewrite for unknown product and collection slugs
DATABASE.md           Local PostgreSQL/Prisma topology and migration workflow
DESIGN_SYSTEM.md      Approved colour, typography, spacing, and focus rules
REPOSITORY_AUDIT.md   T001 repository audit and recorded risks
QUALITY_VERIFICATION.md  T040/T041 responsive, accessibility, and performance evidence
prisma.config.ts      Prisma 7 CLI configuration
eslint.config.mjs
next.config.ts
tsconfig.json
.env.example          Placeholder environment variables only
```

## Scope

Implemented: design tokens, shared layout, homepage, eight collection pages, product detail UI, search/filtering/sorting, empty states, branded 404s, local PostgreSQL 18/Prisma 7 infrastructure with the approved domain schema and seven migrations, the cart, checkout, order, manual-payment, return, refund, supplier, product, and guarded admin workflows, administrator TOTP MFA with recovery codes (enforced in production), and a fail-closed shared rate-limit adapter (memory for development, Upstash in production). Product images use Vercel Blob in production with a local development fallback. The production catalogue is intentionally empty. Demo content is approved for preview only and is never publishable or orderable.

Not implemented or not live: the owner's logo, approved real products and images, real supplier onboarding, live payment receipt or verification, live marketing integrations, and deployment. Bank Transfer (Islamic Bank) and Easypaisa are approved, but both stay unavailable until their server-only account values are configured, and submitted payments are verified manually by an administrator. There is no administrator account until the website owner completes the secure first-time setup flow during handover; the break-glass bootstrap script is an owner-run recovery option only. The privacy, terms, returns, and shipping pages are drafts pending owner approval and legal review. Hosting-layer monitoring, backups, and Neon PITR remain owner/deployment actions. Those tasks remain blocked or pending owner decisions in `tasks.md`.
