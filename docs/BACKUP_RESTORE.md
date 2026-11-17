# JS Jewellers — Database Backup and Restore Runbook

**Prepared:** 12 November 2026
**Audience:** The website owner and the person operating the production
database.
**Status:** The scripts and documentation exist and are verified locally. No
production backup has been taken, no production restore has been rehearsed, and
no Neon point-in-time-recovery (PITR) window has been verified. Those remain
owner/deployment actions.

This runbook covers the guarded backup and restore helpers in the repository. It
does not connect to production automatically, does not store credentials, and
does not run any destructive operation on its own.

> **Rule:** never restore over the live application database without a verified
> backup and explicit owner approval. Never run a destructive command against
> production as part of a test.

---

## 1. What exists in the repository

| Command | What it does |
| --- | --- |
| `npm run db:backup:check` | Confirms `DATABASE_URL` is a valid PostgreSQL URL and that `pg_dump` can be found. Changes nothing. |
| `npm run db:backup` | Writes a compressed custom-format dump to `backups/` (or `--output-dir`). Requires an explicit `--run`, which the npm script supplies. |
| `npm run db:restore:check` | Confirms the named backup file exists, `RESTORE_DATABASE_URL` is valid, and refuses the same database as `DATABASE_URL` unless explicitly overridden. Changes nothing. |
| `node scripts/database-restore.mjs --file=…` | Prints a restore plan. Restores only with `--run --confirm-restore`. |

Scripts:

- `scripts/database-backup.mjs`
- `scripts/database-restore.mjs`
- `scripts/support/database-tools.mjs` (URL validation, same-target guard,
  timestamped file names, PostgreSQL binary discovery)

The scripts never print a connection string or password. A restore target is
read **only** from `RESTORE_DATABASE_URL`, never from a command-line argument, so
it cannot leak into shell history.

`backups/` is Git-ignored. Backups contain customer and order data: store them
encrypted, off-site, with restricted access, and never commit them.

## 2. Prerequisites

- PostgreSQL client tools (`pg_dump`, `pg_restore`) matching or newer than the
  production server. On Windows the installer does not add them to `PATH`; the
  scripts check the documented install locations
  (`C:\Program Files\PostgreSQL\18\bin`, then 17 and 16) and the `PG_BIN`
  environment variable. Set `PG_BIN` if they live elsewhere.
- `DATABASE_URL` for the source database (server-only).
- `RESTORE_DATABASE_URL` for an **isolated** restore target (server-only).
- An isolated database for restore tests. Never use the application database as
  a restore rehearsal target.

## 3. Taking a backup

1. Confirm prerequisites:

   ```bash
   npm run db:backup:check
   ```

2. Write the backup:

   ```bash
   npm run db:backup
   ```

   To choose a location:

   ```bash
   node scripts/database-backup.mjs --run --output-dir=D:\secure-backups
   ```

3. Record the filename and timestamp, then copy the file to encrypted off-site
   storage. Verify the copy before deleting anything locally.

`pg_dump` runs with `--format=custom --compress=9 --no-owner --no-acl`. It only
reads the database.

## 4. Rehearsing a restore (required before launch)

1. Create an isolated empty PostgreSQL database (for example
   `js_jewellers_restore_test`) that is **not** the application database.
2. Set `RESTORE_DATABASE_URL` to that isolated database.
3. Check the plan:

   ```bash
   node scripts/database-restore.mjs --check --file=backups/js-jewellers-YYYYMMDD-HHMMSS.dump
   ```

4. Restore with explicit confirmation:

   ```bash
   node scripts/database-restore.mjs --run --confirm-restore --file=backups/js-jewellers-YYYYMMDD-HHMMSS.dump
   ```

5. Verify the restored database with read-only checks: expected row counts in
   business tables, migration history, and a few known records. Run
   `prisma migrate status` against the isolated target if you need to confirm
   migration state.
6. Destroy the isolated test database only after the verification is recorded.

Safety behaviour:

- A restore never starts without `--run` **and** `--confirm-restore`.
- If `RESTORE_DATABASE_URL` resolves to the same host, port, and database as
  `DATABASE_URL`, the script refuses unless `--allow-same-database` is supplied.
  Do not use that override for a routine test.
- Existing objects are dropped only when `--allow-overwrite` is supplied;
  otherwise use a fresh, isolated target.
- The restore runs in a single transaction and rolls back where possible.

## 5. Restore decision and rollback

Before launch, the owner and the deployment operator must agree:

- who can authorise a restore;
- how the backup is verified before a restore;
- how the application is paused during a restore;
- how a failed restore is rolled back;
- the previous build artifact and database restore point to use;
- where the backup is stored and how access is controlled.

Record the decision in the deployment log. Do not rely on a single backup.

## 6. Neon PostgreSQL backups and PITR

Neon takes its own backups and may offer point-in-time recovery. **PITR
availability and the recovery window depend on the Neon plan and are not
verified by this repository.** Do not claim PITR is available until the owner
has:

1. confirmed the Neon plan and the recovery window in the Neon console;
2. confirmed whether PITR is enabled for the production project;
3. recorded the exact recovery steps and who may perform them;
4. run a restore rehearsal from a Neon branch or verified backup.

If PITR is not available on the chosen plan, use the `pg_dump` backups in §3 and
the restore rehearsal in §4 as the primary recovery path, and document the
acceptable recovery point objective (RPO) and recovery time objective (RTO).

Do not run a Neon restore against the production branch without owner approval.
Neon also provides branches, which are a safer place to test a restore.

## 7. What is still an owner action

- Provision the production database and confirm the plan's backup/PITR features.
- Decide and document the backup schedule, retention, encryption, and off-site
  storage.
- Run at least one restore rehearsal before launch.
- Record the recovery decision-maker and rollback plan.
- Approve any production migration or restore.
