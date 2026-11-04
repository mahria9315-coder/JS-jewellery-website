# J's Jewellery

Next.js baseline, approved design system, shared site layout, and homepage for the J's Jewellery storefront. This repository currently contains the verified T003A baseline, T004 design tokens, T005 header/navigation/footer, and T006 homepage sections: Next.js App Router, strict TypeScript, Tailwind CSS, ESLint, and placeholder configuration. No product data, database, payments, admin, or owner/supplier data are implemented yet, so product sections show clearly labelled empty states.

See `AGENTS.md`, `spec.md`, `plan.md`, and `tasks.md` for the approved requirements and task status. See `DESIGN_SYSTEM.md` for colour, typography, spacing, and focus conventions. See `MARKETING_INTEGRATIONS.md` and `PAYMENT_INTEGRATIONS.md` for integration requirements and their current pending or blocked status. No integration is live.

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
app/                App Router layout, homepage, and design tokens
components/home/    Homepage hero, category navigation, and showcase sections
components/layout/  Shared header, logo, and footer components
lib/                Shared navigation data
public/             Static assets
scripts/            Repeatable verification scripts
DESIGN_SYSTEM.md    Approved colour, typography, spacing, and focus rules
eslint.config.mjs
next.config.ts
tsconfig.json
.env.example        Placeholder environment variables only
```

## Scope

Out of scope for the baseline: homepage and store features, catalogue, cart, checkout, admin, authentication, Prisma/PostgreSQL, payment providers, real supplier or owner data, secrets, and deployment.
