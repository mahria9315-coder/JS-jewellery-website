import assert from "node:assert/strict";
import test from "node:test";

import {
  ADMIN_SETUP_SECRET_ENV,
  AdminSetupError,
  isAdminSetupSecretConfigured,
} from "../lib/admin/setup-shared.ts";
import { safeStringEqual } from "../lib/admin/auth-crypto.ts";

test("setup uses a dedicated server-only environment variable name", () => {
  assert.equal(ADMIN_SETUP_SECRET_ENV, "ADMIN_SETUP_SECRET");
  assert.equal(ADMIN_SETUP_SECRET_ENV.startsWith("NEXT_PUBLIC_"), false);
});

test("setup secret configuration checks only non-empty server env values", () => {
  const previous = process.env[ADMIN_SETUP_SECRET_ENV];

  try {
    delete process.env[ADMIN_SETUP_SECRET_ENV];
    assert.equal(isAdminSetupSecretConfigured(), false);

    process.env[ADMIN_SETUP_SECRET_ENV] = "   ";
    assert.equal(isAdminSetupSecretConfigured(), false);

    process.env[ADMIN_SETUP_SECRET_ENV] = "long-random-server-secret";
    assert.equal(isAdminSetupSecretConfigured(), true);
  } finally {
    if (previous === undefined) {
      delete process.env[ADMIN_SETUP_SECRET_ENV];
    } else {
      process.env[ADMIN_SETUP_SECRET_ENV] = previous;
    }
  }
});

test("setup secret comparison uses constant-time string equality", () => {
  const secret = "test-secret-not-real";
  assert.equal(safeStringEqual(secret, secret), true);
  assert.equal(safeStringEqual(secret, "wrong"), false);
});

test("AdminSetupError carries a safe operator message", () => {
  const error = new AdminSetupError("safe message");
  assert.equal(error.name, "AdminSetupError");
  assert.equal(error.message, "safe message");
  assert.equal(error.message.includes("ADMIN_SETUP_SECRET="), false);
});
