import assert from "node:assert/strict";
import test from "node:test";

import {
  createLogEntry,
  sanitizeLogDetails,
  sanitizeLogString,
  sanitizePath,
} from "../lib/logging/logger.ts";

test("credential-shaped strings are redacted", () => {
  const database =
    "postgresql://app:super-secret@ep-example.neon.tech/neondb?sslmode=require";
  const output = sanitizeLogString(
    `failed ${database} with Bearer abc.def.ghi and vercel_blob_rw_TOKEN123`,
  );

  assert.equal(output.includes("super-secret"), false);
  assert.equal(output.includes("abc.def.ghi"), false);
  assert.equal(output.includes("TOKEN123"), false);
  assert.match(output, /redacted-database-url/);
  assert.match(output, /redacted-blob-token/);
});

test("authenticator secrets and recovery codes are redacted", () => {
  const output = sanitizeLogString(
    "otpauth://totp/JS%20Jewellers:admin@example.com?secret=JBSWY3DPEHPK3PXP&issuer=JS%20Jewellers",
  );

  assert.equal(output.includes("JBSWY3DPEHPK3PXP"), false);
  assert.match(output, /redacted-otpauth-uri/);

  const sanitized = sanitizeLogDetails({
    mfaSecret: "JBSWY3DPEHPK3PXP",
    recoveryCode: "ABCDE-FGHJK",
    authenticatorKey: "secret",
    nested: { otp: "123456" },
    safeUserId: "user_1",
  });
  const text = JSON.stringify(sanitized);

  assert.equal(text.includes("JBSWY3DPEHPK3PXP"), false);
  assert.equal(text.includes("ABCDE-FGHJK"), false);
  assert.equal(text.includes("123456"), false);
  assert.match(text, /safeUserId/);
});

test("sensitive keys are redacted at any nesting depth", () => {
  const sanitized = sanitizeLogDetails({
    orderId: "ord_1",
    customer: {
      email: "person@example.com",
      phone: "+920000000000",
      address: "1 Example Street",
      name: "A Customer",
    },
    payment: {
      accountNumber: "1234567890",
      accountHolder: "A Customer",
      nested: { password: "hunter2", tokenHash: "abc" },
    },
    safeCount: 3,
  });

  const text = JSON.stringify(sanitized);

  assert.equal(text.includes("person@example.com"), false);
  assert.equal(text.includes("hunter2"), false);
  assert.equal(text.includes("1234567890"), false);
  assert.match(text, /ord_1/);
  assert.match(text, /safeCount/);
});

test("long strings and large arrays are bounded", () => {
  const long = sanitizeLogString("x".repeat(5000));
  assert.equal(long.length <= 501, true);

  const items = sanitizeLogDetails(
    Array.from({ length: 100 }, (_, index) => `item-${index}`),
  );
  assert.equal(Array.isArray(items), true);
  assert.equal(items.length, 20);
});

test("log entries never include a request query string", () => {
  assert.equal(sanitizePath("/checkout?email=person%40example.com"), "/checkout");
  assert.equal(sanitizePath("/orders/abc?token=secret"), "/orders/abc");
  assert.equal(sanitizePath(undefined), "unknown");
});

test("structured entries carry service, level, and sanitised details", () => {
  const entry = createLogEntry("error", "request.error", {
    path: "/checkout",
    message: "postgresql://u:secret@localhost/db failed",
    cookie: "js_admin_session=secret",
  });
  const text = JSON.stringify(entry);

  assert.equal(entry.service, "js-jewellers");
  assert.equal(entry.level, "error");
  assert.equal(entry.event, "request.error");
  assert.equal(text.includes("secret@localhost"), false);
  assert.equal(text.includes("js_admin_session=secret"), false);
});
