# J's Jewellery

Next.js baseline for the J's Jewellery storefront. This repository currently contains the verified T003A baseline only: Next.js App Router, strict TypeScript, Tailwind CSS, ESLint, and placeholder configuration. No store features, database, payments, admin, or owner/supplier data are implemented yet.

See `AGENTS.md`, `spec.md`, `plan.md`, and `tasks.md` for the approved requirements and task status.

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

## Verification

```bash
npm run lint
npm run typecheck
npm run build
```

The T003A baseline must pass all three before feature work begins.

## Structure

```text
app/            App Router layout and placeholder page
public/         Static assets
eslint.config.mjs
next.config.ts
tsconfig.json
.env.example    Placeholder environment variables only
```

## Scope

Out of scope for the baseline: homepage and store features, catalogue, cart, checkout, admin, authentication, Prisma/PostgreSQL, payment providers, real supplier or owner data, secrets, and deployment.
