# J's Jewellery

Next.js storefront for J's Jewellery. This repository currently contains the verified T003A baseline, T004 design tokens, T005 shared layout, T006 homepage, T008-T010 collections and product pages, and T011 search/filtering/sorting. The catalogue is intentionally empty until approved supplier-backed product records exist, so product sections show clearly labelled empty states. Cart, checkout, payments, admin, database, and live integrations have not started.

See `AGENTS.md`, `spec.md`, `plan.md`, and `tasks.md` for the approved requirements and task status. See `DESIGN_SYSTEM.md` for colour, typography, spacing, and focus conventions. See `MARKETING_INTEGRATIONS.md` and `PAYMENT_INTEGRATIONS.md` for integration requirements and their current pending or blocked status. No integration is live. See `REPOSITORY_AUDIT.md` for the T001 repository audit and `QUALITY_VERIFICATION.md` for the T040/T041 responsive, accessibility, and performance evidence.

## Prerequisites

- Node.js 20.9 or later (verified with Node.js 24.21.0)
- npm 10 or later (verified with npm 11.19.0)

## Setup

```bash
npm install
cp .env.example .env.local   # Windows PowerShell: Copy-Item .env.example .env.local
npm run dev
```

Open <http://localhost:3000>.

`.env.example` contains placeholders only. Do not commit real credentials. The baseline does not require any environment variable to build or run.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript compiler without emitting files |
| `npm run check:contrast` | Verify the documented WCAG colour-contrast pairs |

## Verification

```bash
npm run check:contrast
npm run lint
npm run typecheck
npm run build
```

All four checks must pass before feature work begins.

## Structure

```text
app/                  App Router pages, layout, and design tokens
components/catalogue/ Collection, product, search, and empty-state UI
components/home/      Homepage hero, category navigation, and showcase sections
components/layout/    Shared header, mobile navigation, logo, and footer
lib/                  Collections, navigation, catalogue types, and query validation
public/               Static assets (approved images not added yet)
scripts/              Repeatable verification scripts
proxy.ts              Real-404 rewrite for unknown product and collection slugs
DESIGN_SYSTEM.md      Approved colour, typography, spacing, and focus rules
REPOSITORY_AUDIT.md   T001 repository audit and recorded risks
QUALITY_VERIFICATION.md  T040/T041 responsive, accessibility, and performance evidence
eslint.config.mjs
next.config.ts
tsconfig.json
.env.example          Placeholder environment variables only
```

## Scope

Implemented: design tokens, shared layout, homepage, eight collection pages, product detail UI, search/filtering/sorting, empty states, and branded 404s. The production catalogue is intentionally empty.

Not implemented yet: approved products and images, database/Prisma, customization, cart, checkout, orders, admin, policies, SEO extras, live integrations, and deployment. Those tasks remain blocked or pending owner decisions in `tasks.md`.
