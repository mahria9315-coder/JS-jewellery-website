#!/usr/bin/env node
/**
 * Guarded PostgreSQL restore helper.
 *
 * Usage:
 *   node scripts/database-restore.mjs --check --file=backups/js-jewellers-....dump
 *   node scripts/database-restore.mjs --file=backups/js-jewellers-....dump
 *   $env:RESTORE_DATABASE_URL="postgresql://...isolated-target..."
 *   node scripts/database-restore.mjs --run --file=... --confirm-restore
 *
 * Safety rules:
 *   - The target comes only from RESTORE_DATABASE_URL, never from a command-line
 *     argument (so it cannot leak into shell history).
 *   - A restore never runs without `--run` plus `--confirm-restore`.
 *   - Restoring over the application's own DATABASE_URL is refused unless
 *     `--allow-same-database` is also supplied.
 *   - Existing objects are only dropped when `--allow-overwrite` is supplied.
 *   - Nothing here is run automatically by the application or deployment.
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

import {
  findPgBinary,
  isSameDatabaseTarget,
  isValidPostgresUrl,
  parseArgs,
} from "./support/database-tools.mjs";

const args = parseArgs(process.argv.slice(2));

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

function appDatabaseUrl() {
  return process.env.DATABASE_URL?.trim() ?? "";
}

function restoreDatabaseUrl() {
  return process.env.RESTORE_DATABASE_URL?.trim() ?? "";
}

function describeTarget(url) {
  try {
    const parsed = new URL(url);
    const local =
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "[::1]";

    return `${local ? "local" : "remote"} database, connection details hidden`;
  } catch {
    return "unrecognised target";
  }
}

function fileArgument() {
  const value = args.get("file");
  return value ? path.resolve(value) : null;
}

function checks() {
  const results = [];
  const target = restoreDatabaseUrl();
  const file = fileArgument();

  if (!file) {
    results.push({
      ok: false,
      label: "backup file",
      detail: "missing. Pass --file=backups/<name>.dump.",
    });
  } else if (!existsSync(file)) {
    results.push({
      ok: false,
      label: "backup file",
      detail: `${file} does not exist.`,
    });
  } else {
    results.push({ ok: true, label: "backup file", detail: file });
  }

  if (!target) {
    results.push({
      ok: false,
      label: "RESTORE_DATABASE_URL",
      detail:
        "missing. Set it to an isolated restore target; never pass it on the command line.",
    });
  } else if (!isValidPostgresUrl(target)) {
    results.push({
      ok: false,
      label: "RESTORE_DATABASE_URL",
      detail: "is not a valid postgresql:// URL.",
    });
  } else {
    results.push({
      ok: true,
      label: "RESTORE_DATABASE_URL",
      detail: describeTarget(target),
    });

    if (isSameDatabaseTarget(target, appDatabaseUrl())) {
      const allowed = args.has("allow-same-database");
      results.push({
        ok: allowed,
        label: "same-database guard",
        detail: allowed
          ? "WARNING: the restore target is the application database and --allow-same-database was supplied."
          : "refused. The restore target is the application database. Use an isolated database, or add --allow-same-database only after taking a verified backup.",
      });
    }
  }

  const binary = findPgBinary("pg_restore");

  if (binary) {
    results.push({ ok: true, label: "pg_restore", detail: binary });
  } else {
    results.push({
      ok: false,
      label: "pg_restore",
      detail:
        "not found. Install PostgreSQL client tools or set PG_BIN to their bin directory.",
    });
  }

  return { results, binary, target, file };
}

function selfTest() {
  const samples = [
    ["postgresql://u:p@localhost:5432/a", true],
    ["postgres://u:p@host/a", true],
    ["mysql://u:p@host/a", false],
    ["", false],
  ];
  let failed = 0;

  for (const [value, expected] of samples) {
    const actual = isValidPostgresUrl(value);
    if (actual !== expected) failed += 1;
    console.log(`[${actual === expected ? "PASS" : "FAIL"}] restore URL validation`);
  }

  const same = isSameDatabaseTarget(
    "postgresql://u:p@localhost:5432/js_jewellers",
    "postgresql://other:secret@localhost:5432/js_jewellers",
  );
  const different = isSameDatabaseTarget(
    "postgresql://u:p@localhost:5432/js_jewellers",
    "postgresql://u:p@localhost:5432/js_jewellers_restore_test",
  );

  console.log(`[${same ? "PASS" : "FAIL"}] same-target guard detects the same database`);
  console.log(`[${!different ? "PASS" : "FAIL"}] different databases are distinguished`);

  if (!same || different) failed += 1;

  console.log("");
  console.log(failed === 0 ? "Self-test passed." : `${failed} self-test check(s) failed.`);
  process.exit(failed === 0 ? 0 : 1);
}

function printChecks({ results, target, file }) {
  console.log("Database restore check");
  console.log("");

  for (const result of results) {
    console.log(`[${result.ok ? "OK" : "FAIL"}] ${result.label} — ${result.detail}`);
  }

  console.log("");

  if (results.some((result) => !result.ok)) {
    console.log("Restore is not ready. Nothing was restored and nothing was changed.");
    return false;
  }

  console.log(`Backup: ${file}`);
  console.log(`Target: ${describeTarget(target)}`);
  console.log(
    args.has("allow-overwrite")
      ? "Existing objects in the target may be dropped (--allow-overwrite)."
      : "Existing objects will not be dropped; use a fresh/isolated target database.",
  );
  console.log("");
  console.log(
    "This is a plan only. Re-run with --run --confirm-restore to restore into the isolated target.",
  );

  return true;
}

function runRestore({ binary, target, file }) {
  if (!args.has("confirm-restore")) {
    console.error(
      "Refusing to restore without --confirm-restore. Nothing was changed.",
    );
    process.exit(1);
  }

  const restoreArguments = [
    "--no-owner",
    "--no-acl",
    "--single-transaction",
    `--dbname=${target}`,
  ];

  if (args.has("allow-overwrite")) {
    restoreArguments.push("--clean", "--if-exists");
  }

  restoreArguments.push(file);

  console.log(`Restoring ${file}`);
  console.log(`Target: ${describeTarget(target)}`);

  const child = spawn(binary, restoreArguments, {
    stdio: ["ignore", "inherit", "inherit"],
    shell: false,
  });

  child.on("error", (error) => {
    console.error(`Restore failed to start: ${error.message}`);
    process.exit(1);
  });

  child.on("close", (code) => {
    if (code !== 0) {
      console.error(
        `pg_restore exited with code ${code}. The transaction was rolled back where possible. Inspect the message above.`,
      );
      process.exit(code ?? 1);
    }

    console.log("");
    console.log("Restore complete. Verify the target with read-only checks and the Prisma migration status before using it.");
  });
}

if (args.has("self-test")) {
  selfTest();
} else {
  const state = checks();

  if (args.has("check")) {
    const ok = state.results.every((result) => result.ok);
    for (const result of state.results) {
      console.log(`[${result.ok ? "OK" : "FAIL"}] ${result.label} — ${result.detail}`);
    }
    console.log("");
    console.log(ok ? "Restore prerequisites are available." : "Restore prerequisites are missing.");
    process.exit(ok ? 0 : 1);
  }

  const ready = printChecks(state);

  if (!ready) {
    process.exit(1);
  }

  if (args.has("run")) {
    runRestore(state);
  }
}
