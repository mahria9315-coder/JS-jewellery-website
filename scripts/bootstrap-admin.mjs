#!/usr/bin/env node
/**
 * Secure first-administrator bootstrap.
 *
 * Usage (PowerShell):
 *   $env:ADMIN_BOOTSTRAP_EMAIL="owner@example.com"
 *   $env:ADMIN_BOOTSTRAP_PASSWORD="a-long-unique-password"
 *   npm run admin:bootstrap
 *
 * The password is read from the environment, hashed with scrypt, and written
 * directly to the database. It is never printed, logged, or committed. Running
 * the script again for the same email resets that account to an active Super
 * Admin and revokes its sessions, which is also the documented break-glass
 * recovery path.
 */

import { randomBytes, scryptSync } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { Client } from "pg";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;
const MAX_MEM = 64 * 1024 * 1024;

function loadEnvFile(fileName) {
  const filePath = path.join(process.cwd(), fileName);

  if (!fs.existsSync(filePath)) {
    return;
  }

  const contents = fs.readFileSync(filePath, "utf8");

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) continue;

    const separator = line.indexOf("=");

    if (separator <= 0) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: MAX_MEM,
  });

  return [
    "scrypt",
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("hex"),
    derived.toString("hex"),
  ].join("$");
}

function validate(email, password) {
  const problems = [];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    problems.push("ADMIN_BOOTSTRAP_EMAIL must be a valid email address.");
  }

  if (!password || password.length < 12 || password.length > 200) {
    problems.push(
      "ADMIN_BOOTSTRAP_PASSWORD must be 12-200 characters.",
    );
  } else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    problems.push(
      "ADMIN_BOOTSTRAP_PASSWORD must include at least one letter and one number.",
    );
  }

  return problems;
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const connectionString = process.env.DATABASE_URL?.trim();
const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
const name = process.env.ADMIN_BOOTSTRAP_NAME?.trim() || "Store Owner";

if (!connectionString) {
  console.error("Missing DATABASE_URL. Administrator bootstrap aborted.");
  process.exit(1);
}

const problems = validate(email, password);

if (problems.length > 0) {
  for (const problem of problems) console.error(problem);
  console.error("Administrator bootstrap aborted. No account was changed.");
  process.exit(1);
}

const client = new Client({ connectionString });

try {
  await client.connect();
  await client.query("BEGIN");

  const roleResult = await client.query(
    'SELECT "id" FROM "AdminRole" WHERE "key" = $1',
    ["SUPER_ADMIN"],
  );

  if (roleResult.rowCount === 0) {
    throw new Error(
      "The SUPER_ADMIN role is missing. Apply the reviewed Prisma migration first.",
    );
  }

  const roleId = roleResult.rows[0].id;
  const passwordHash = hashPassword(password);
  const existing = await client.query(
    'SELECT "id" FROM "AdminUser" WHERE "email" = $1',
    [email],
  );

  let userId;

  if (existing.rowCount > 0) {
    userId = existing.rows[0].id;

    await client.query(
      `UPDATE "AdminUser"
          SET "name" = $2,
              "passwordHash" = $3,
              "roleId" = $4,
              "status" = 'ACTIVE',
              "failedLoginCount" = 0,
              "lockedUntil" = NULL,
              "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = $1`,
      [userId, name, passwordHash, roleId],
    );

    await client.query('DELETE FROM "AdminSession" WHERE "userId" = $1', [
      userId,
    ]);
  } else {
    userId = `admin_${randomBytes(12).toString("hex")}`;

    await client.query(
      `INSERT INTO "AdminUser"
         ("id", "email", "name", "passwordHash", "roleId", "status",
          "failedLoginCount", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, 'ACTIVE', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [userId, email, name, passwordHash, roleId],
    );
  }

  await client.query("COMMIT");

  console.log(
    `Administrator bootstrap complete for ${email} (Super Admin). Sign in at /admin/login.`,
  );
  console.log(
    "Clear ADMIN_BOOTSTRAP_PASSWORD from your shell environment when finished.",
  );
} catch (error) {
  await client.query("ROLLBACK").catch(() => undefined);
  console.error(
    `Administrator bootstrap failed: ${
      error instanceof Error ? error.message : "unknown error"
    }`,
  );
  process.exitCode = 1;
} finally {
  await client.end().catch(() => undefined);
}
