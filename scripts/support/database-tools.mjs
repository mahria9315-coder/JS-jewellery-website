/**
 * Shared, dependency-free helpers for the database backup and restore scripts.
 *
 * Nothing here connects to a database or prints a connection string. The
 * helpers are kept separate so they can be unit-tested without PostgreSQL
 * client tools installed.
 */

import { existsSync } from "node:fs";
import path from "node:path";

export const BACKUP_DIRECTORY = "backups";

export function isValidPostgresUrl(value) {
  if (!value || /\s/.test(value)) return false;

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }

  return (
    (parsed.protocol === "postgres:" || parsed.protocol === "postgresql:") &&
    Boolean(parsed.hostname) &&
    Boolean(parsed.pathname) &&
    parsed.pathname !== "/"
  );
}

/** Identify the database without exposing credentials. */
export function databaseFingerprint(value) {
  if (!isValidPostgresUrl(value)) return null;

  const parsed = new URL(value);

  return {
    host: parsed.hostname.toLowerCase(),
    port: parsed.port || "5432",
    database: parsed.pathname.replace(/^\//, ""),
  };
}

export function isSameDatabaseTarget(first, second) {
  const a = databaseFingerprint(first);
  const b = databaseFingerprint(second);

  if (!a || !b) return false;

  return (
    a.host === b.host && a.port === b.port && a.database === b.database
  );
}

/** A sortable, filename-safe UTC timestamp. */
export function backupTimestamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");

  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
  ].join("") + `-${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}`;
}

export function backupFileName(date = new Date()) {
  return `js-jewellers-${backupTimestamp(date)}.dump`;
}

/**
 * Locate a PostgreSQL client tool. The Windows installer does not add the
 * PostgreSQL bin directory to PATH, so documented install locations are
 * checked after PATH. Only the resolved path is ever reported.
 */
export function findPgBinary(name, options = {}) {
  const {
    env = process.env,
    platform = process.platform,
    fileExists = existsSync,
    candidateRoots,
  } = options;

  const executable = platform === "win32" ? `${name}.exe` : name;
  const roots = candidateRoots ?? [
    env.PG_BIN,
    ...(platform === "win32"
      ? [
          "C:\\Program Files\\PostgreSQL\\18\\bin",
          "C:\\Program Files\\PostgreSQL\\17\\bin",
          "C:\\Program Files\\PostgreSQL\\16\\bin",
        ]
      : ["/usr/bin", "/usr/local/bin", "/opt/homebrew/bin"]),
    ...(env.PATH ?? "")
      .split(path.delimiter)
      .filter(Boolean),
  ].filter(Boolean);

  for (const root of roots) {
    const candidate = path.join(root, executable);

    if (fileExists(candidate)) {
      return candidate;
    }
  }

  return null;
}

export function parseArgs(argv) {
  const flags = new Set();
  const values = new Map();

  for (const argument of argv) {
    if (argument.startsWith("--")) {
      const [key, ...rest] = argument.slice(2).split("=");
      const value = rest.join("=");

      if (value) {
        values.set(key, value);
      } else {
        flags.add(key);
      }
    }
  }

  return {
    has: (name) => flags.has(name),
    get: (name) => values.get(name) ?? null,
  };
}

export function safeDirectoryName(value) {
  const resolved = path.resolve(value);
  return resolved;
}
