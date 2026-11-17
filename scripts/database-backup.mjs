#!/usr/bin/env node
/**
 * Safe PostgreSQL backup helper.
 *
 * Usage:
 *   node scripts/database-backup.mjs --check
 *   node scripts/database-backup.mjs                 (plan only)
 *   node scripts/database-backup.mjs --run
 *   node scripts/database-backup.mjs --run --output-dir=D:\secure-backups
 *
 * A backup only runs with an explicit `--run`. The script never prints the
 * connection string, never changes the database, and never uploads anything.
 * Store the resulting file encrypted and off-site; do not commit it.
 */

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

import {
  BACKUP_DIRECTORY,
  backupFileName,
  findPgBinary,
  isValidPostgresUrl,
  parseArgs,
} from "./support/database-tools.mjs";

const args = parseArgs(process.argv.slice(2));

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

function databaseUrl() {
  return process.env.DATABASE_URL?.trim() ?? "";
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

function checks() {
  const results = [];
  const url = databaseUrl();

  if (!url) {
    results.push({
      ok: false,
      label: "DATABASE_URL",
      detail: "missing. Set it in .env.local or the server environment.",
    });
  } else if (!isValidPostgresUrl(url)) {
    results.push({
      ok: false,
      label: "DATABASE_URL",
      detail: "is not a valid postgresql:// URL.",
    });
  } else {
    results.push({
      ok: true,
      label: "DATABASE_URL",
      detail: describeTarget(url),
    });
  }

  const binary = findPgBinary("pg_dump");

  if (binary) {
    results.push({ ok: true, label: "pg_dump", detail: binary });
  } else {
    results.push({
      ok: false,
      label: "pg_dump",
      detail:
        "not found. Install PostgreSQL client tools or set PG_BIN to their bin directory.",
    });
  }

  return { results, binary, url };
}

function selfTest() {
  const samples = [
    ["postgresql://u:p@localhost:5432/db", true],
    ["postgres://u:p@host/db", true],
    ["mysql://u:p@host/db", false],
    ["not a url", false],
    ["", false],
  ];

  let failed = 0;

  for (const [value, expected] of samples) {
    const actual = isValidPostgresUrl(value);
    const ok = actual === expected;
    if (!ok) failed += 1;
    console.log(`[${ok ? "PASS" : "FAIL"}] URL validation for ${value ? "sample" : "empty value"}`);
  }

  const name = backupFileName(new Date("2026-11-12T09:08:07Z"));
  const nameOk = name === "js-jewellers-20261112-090807.dump";
  if (!nameOk) failed += 1;
  console.log(`[${nameOk ? "PASS" : "FAIL"}] backup file name is timestamped and safe`);

  console.log("");
  console.log(failed === 0 ? "Self-test passed." : `${failed} self-test check(s) failed.`);
  process.exit(failed === 0 ? 0 : 1);
}

function printChecks({ results, binary, url }) {
  console.log("Database backup check");
  console.log("");

  for (const result of results) {
    console.log(`[${result.ok ? "OK" : "FAIL"}] ${result.label} — ${result.detail}`);
  }

  console.log("");

  if (results.some((result) => !result.ok)) {
    console.log("Backup is not ready. Nothing was written and nothing was changed.");
    return false;
  }

  const outputDirectory = path.resolve(
    args.get("output-dir") ?? BACKUP_DIRECTORY,
  );

  console.log(`Planned output: ${path.join(outputDirectory, backupFileName())}`);
  console.log(`Target: ${describeTarget(url)}`);
  console.log(`Binary: ${binary}`);
  console.log("");
  console.log(
    "This is a plan only. Re-run with --run to write the backup file. Store it encrypted and off-site; never commit it.",
  );

  return true;
}

function runBackup({ binary, url }) {
  const outputDirectory = path.resolve(
    args.get("output-dir") ?? BACKUP_DIRECTORY,
  );
  mkdirSync(outputDirectory, { recursive: true });

  const filePath = path.join(outputDirectory, backupFileName());

  console.log(`Writing backup to ${filePath}`);
  console.log("The database is only read; no schema or data is changed.");

  const child = spawn(
    binary,
    [
      "--format=custom",
      "--compress=9",
      "--no-owner",
      "--no-acl",
      `--file=${filePath}`,
      `--dbname=${url}`,
    ],
    { stdio: ["ignore", "inherit", "inherit"], shell: false },
  );

  child.on("error", (error) => {
    console.error(`Backup failed to start: ${error.message}`);
    process.exit(1);
  });

  child.on("close", (code) => {
    if (code !== 0) {
      console.error(
        `pg_dump exited with code ${code}. Inspect its message above; no connection details are printed by this script.`,
      );
      process.exit(code ?? 1);
    }

    const size = existsSync(filePath) ? statSync(filePath).size : 0;
    console.log("");
    console.log(`Backup complete: ${filePath} (${(size / 1024 / 1024).toFixed(2)} MB)`);
    console.log(
      "Next: copy it to encrypted off-site storage, record the timestamp, and test a restore into an isolated database.",
    );
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
    console.log(ok ? "Backup prerequisites are available." : "Backup prerequisites are missing.");
    process.exit(ok ? 0 : 1);
  }

  const ready = printChecks(state);

  if (!ready) {
    process.exit(1);
  }

  if (args.has("run")) {
    runBackup(state);
  }
}
