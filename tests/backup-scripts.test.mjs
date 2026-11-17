import assert from "node:assert/strict";
import test from "node:test";

import {
  backupFileName,
  backupTimestamp,
  databaseFingerprint,
  findPgBinary,
  isSameDatabaseTarget,
  isValidPostgresUrl,
  parseArgs,
} from "../scripts/support/database-tools.mjs";

test("backup/restore validates PostgreSQL URLs without echoing them", () => {
  assert.equal(isValidPostgresUrl("postgresql://u:p@localhost:5432/db"), true);
  assert.equal(isValidPostgresUrl("postgres://u:p@host/db?sslmode=require"), true);
  assert.equal(isValidPostgresUrl("mysql://u:p@host/db"), false);
  assert.equal(isValidPostgresUrl("postgresql://u:p@host/"), false);
  assert.equal(isValidPostgresUrl("not a url"), false);
  assert.equal(isValidPostgresUrl(""), false);
});

test("database fingerprints identify a target without credentials", () => {
  const fingerprint = databaseFingerprint(
    "postgresql://user:secret@db.example.com:5433/shop?sslmode=require",
  );

  assert.deepEqual(fingerprint, {
    host: "db.example.com",
    port: "5433",
    database: "shop",
  });
  assert.equal(JSON.stringify(fingerprint).includes("secret"), false);
  assert.equal(JSON.stringify(fingerprint).includes("user"), false);
});

test("same-target guard compares host, port, and database only", () => {
  assert.equal(
    isSameDatabaseTarget(
      "postgresql://a:one@localhost:5432/shop",
      "postgresql://b:two@localhost:5432/shop",
    ),
    true,
  );
  assert.equal(
    isSameDatabaseTarget(
      "postgresql://a:one@localhost:5432/shop",
      "postgresql://a:one@localhost:5432/shop_restore_test",
    ),
    false,
  );
  assert.equal(
    isSameDatabaseTarget(
      "postgresql://a:one@localhost:5432/shop",
      "postgresql://a:one@otherhost:5432/shop",
    ),
    false,
  );
});

test("backup file names are sortable and contain no connection details", () => {
  const date = new Date("2026-11-12T09:08:07Z");

  assert.equal(backupTimestamp(date), "20261112-090807");
  assert.equal(backupFileName(date), "js-jewellers-20261112-090807.dump");
  assert.equal(backupFileName(date).includes("postgres"), false);
});

test("PostgreSQL tools can be located by documented install path", () => {
  const found = findPgBinary("pg_dump", {
    platform: "win32",
    env: {},
    candidateRoots: ["C:\\Program Files\\PostgreSQL\\18\\bin"],
    fileExists: (candidate) =>
      candidate === "C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe",
  });

  assert.equal(found, "C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe");
  assert.equal(
    findPgBinary("pg_dump", {
      platform: "win32",
      env: {},
      candidateRoots: ["C:\\missing"],
      fileExists: () => false,
    }),
    null,
  );
});

test("script arguments require explicit run and confirmation flags", () => {
  const parsed = parseArgs([
    "--run",
    "--confirm-restore",
    "--file=backups/example.dump",
    "--output-dir=C:\\secure backups",
  ]);

  assert.equal(parsed.has("run"), true);
  assert.equal(parsed.has("confirm-restore"), true);
  assert.equal(parsed.get("file"), "backups/example.dump");
  assert.equal(parsed.get("output-dir"), "C:\\secure backups");
  assert.equal(parsed.has("allow-overwrite"), false);
});
