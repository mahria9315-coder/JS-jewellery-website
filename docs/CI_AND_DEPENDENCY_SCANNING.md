# JS Jewellers — CI and Dependency Scanning

**Prepared:** 12 November 2026
**Audience:** The website owner and the deployment operator.
**Status:** Workflow files exist **locally only**. No GitHub repository is
connected, no workflow has been pushed, and no CI run, CodeQL scan, or
Dependabot update has occurred. Nothing in this document claims otherwise.

---

## 1. What is prepared

Three files are present in the working tree, uncommitted:

| File | Purpose |
| --- | --- |
| `.github/workflows/ci.yml` | Typecheck, lint, tests, contrast checks, Prisma validate/migrate, production build, and a production-dependency audit on every push/PR to `main`. |
| `.github/workflows/codeql.yml` | CodeQL static analysis for JavaScript/TypeScript on push, PR, a weekly schedule, and manual dispatch. |
| `.github/dependabot.yml` | Weekly grouped npm and GitHub Actions update PRs. |

They were written to be safe by default:

- CI uses an **ephemeral PostgreSQL 18 service container** with placeholder
  credentials (`ci-not-a-real-password`) and a non-production `ci.invalid` site
  URL. No repository secret is required.
- The CI environment uses an explicitly opt-in memory rate limiter and a
  test-only MFA key. These values exist to compile and boot the app; they are
  not production values and are rejected by the production environment check if
  reused there.
- CodeQL has `contents: read` and `security-events: write` only.
- Dependabot only opens pull requests. Auto-merge is **not** configured.
  Major upgrades of Next.js and Prisma are ignored so they require a planned
  upgrade and a full test run.
- No workflow deploys, publishes, or contacts the production database.

---

## 2. What each check does

### `ci.yml`

1. Check out, install Node.js 24 with npm cache, run `npm ci`.
2. `npm run prisma:validate`.
3. `npm run prisma:deploy` against the ephemeral CI database.
4. `npm run typecheck`.
5. `npm run lint`.
6. `npm test` (the full Node suite, including security and MFA tests).
7. `npm run check:contrast`.
8. `npm run build`.
9. `npm audit --omit=dev --audit-level=high`.

A failure at any step fails the job. Concurrency cancels superseded runs.

### `codeql.yml`

- Initialises CodeQL for `javascript-typescript` with `security-extended`
  queries, autobuilds, and uploads results to GitHub code scanning.
- Runs weekly in addition to push/PR so new query packs catch existing code.

### `dependabot.yml`

- Weekly npm updates, grouped into production and development, plus GitHub
  Actions updates.
- Opens at most five npm and three Actions PRs at a time.
- Major `next`, `prisma`, `@prisma/client`, and `@prisma/adapter-pg` updates are
  ignored and must be handled deliberately.

---

## 3. How to enable (owner action)

Enabling CI is a deliberate, reviewed step. Do not push these files
automatically.

1. The owner creates or approves the GitHub repository and access.
2. The owner/operator reviews the three files and commits them through the
   normal review process.
3. In GitHub, open **Actions** and confirm the `CI` and `CodeQL` workflows are
   enabled. CodeQL needs code scanning enabled for the repository (public
   repositories have it by default; private repositories may need GitHub Code
   Security).
4. Enable Dependabot alerts and security updates in the repository settings.
5. Protect `main`: require the CI check before merge, require review, and
   disallow force-pushes. Do not enable auto-merge for Dependabot.
6. Decide who triages Dependabot and CodeQL findings and within what time.
7. Run the workflow once with **Run workflow** and confirm all steps pass before
   relying on it.

Until these steps are completed, the repository has **no active CI, no
automated scanning, and no dependency-update automation**.

---

## 4. Manual equivalents

Until CI is active, these commands are the local gate. Run them before handing
over a release candidate:

```bash
npm ci
npm run prisma:validate
npm run prisma:deploy        # only against a disposable/approved database
npm run typecheck
npm run lint
npm test
npm run check:contrast
npm run build
npm audit --omit=dev --audit-level=high
```

At the last local run (12 November 2026): typecheck, lint, 245 tests, contrast,
Prisma validate/status (seven migrations), production build, and
`npm audit --omit=dev` all pass. The full `npm audit` reports seven moderate
advisories confined to the development-only ESLint/TypeScript toolchain; no
production dependency is affected. Record any change in the handover log rather
than assuming the toolchain warning is harmless.

---

## 5. Dependency-scanning policy

- **Production dependencies:** a high or critical advisory blocks release until
  patched, overridden, or documented with an accepted risk.
- **Development dependencies:** track and patch promptly, but a moderate
  advisory in the lint toolchain does not block a runtime release. Keep the
  distinction visible; do not hide the full-audit result.
- **Overrides:** this repository already uses an `overrides` entry for a
  transitive `zod` version pulled in by the Blob dependency chain. Overrides must
  be reviewed and removed when no longer needed.
- **CodeQL findings:** triage every high/critical result. A dismissal must have a
  written reason.
- **Secrets:** GitHub secret scanning and push protection should be enabled.
  Never commit `.env.local`; it is Git-ignored.
- **Supply chain:** pin GitHub Actions to reviewed versions and review Dependabot
  PRs rather than merging automatically.

---

## 6. What is not configured

- No GitHub repository, Actions minute budget, or code-scanning entitlement is
  active.
- No branch-protection rule enforces CI.
- No container image scanning exists (the app is not containerised in this
  repository).
- No runtime SCA/DAST, no penetration test, and no independent security review.
- No Dependabot alert has been received because Dependabot is not enabled.

These remain owner/operator actions. The production verdict stays
**NOT READY (NO-GO)** until the release gates in
`docs/PRODUCTION_READINESS.md` and `docs/SECURITY_CHECKLIST.md` are satisfied.
