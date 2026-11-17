import assert from "node:assert/strict";
import test from "node:test";

import { PAYMENT_ENV_KEYS } from "../lib/payments/config.ts";
import {
  getCheckoutPaymentMethods,
  getPaymentInstructions,
  isPaymentMethodConfigured,
} from "../lib/payments/methods.ts";

const PAYMENT_KEYS = Object.values(PAYMENT_ENV_KEYS);

function withPaymentEnv(values, callback) {
  const previous = new Map(PAYMENT_KEYS.map((key) => [key, process.env[key]]));

  for (const key of PAYMENT_KEYS) {
    delete process.env[key];
  }

  for (const [key, value] of Object.entries(values)) {
    process.env[key] = value;
  }

  try {
    return callback();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

test("checkout offers exactly the two approved payment methods", () => {
  withPaymentEnv({}, () => {
    const methods = getCheckoutPaymentMethods();

    assert.deepEqual(
      methods.map((method) => method.id),
      ["bank-transfer", "easypaisa"],
    );
    assert.deepEqual(
      methods.map((method) => method.label),
      ["Bank Transfer", "Easypaisa"],
    );
    assert.equal(methods.some((method) => method.id === "card"), false);
    assert.equal(methods.some((method) => method.id === "cod"), false);

    for (const method of methods) {
      assert.deepEqual(Object.keys(method).sort(), [
        "configured",
        "id",
        "label",
        "missingEnvKeys",
      ]);
    }
  });
});

test("unconfigured methods are unavailable and expose no instructions", () => {
  withPaymentEnv({}, () => {
    assert.equal(isPaymentMethodConfigured("bank-transfer"), false);
    assert.equal(isPaymentMethodConfigured("easypaisa"), false);
    assert.equal(getPaymentInstructions("bank-transfer"), null);
    assert.equal(getPaymentInstructions("easypaisa"), null);

    for (const method of getCheckoutPaymentMethods()) {
      assert.equal(method.configured, false);
      assert.ok(method.missingEnvKeys.length > 0);
    }
  });
});

test("configured methods return instructions only for the selected method", () => {
  withPaymentEnv(
    {
      PAYMENT_BANK_ACCOUNT_NUMBER: "TEST-BANK-ACCOUNT",
      PAYMENT_BANK_ACCOUNT_HOLDER: "Test Bank Holder",
      PAYMENT_EASYPAISA_NUMBER: "TEST-WALLET-NUMBER",
      PAYMENT_EASYPAISA_ACCOUNT_HOLDER: "Test Wallet Holder",
    },
    () => {
      assert.equal(isPaymentMethodConfigured("bank-transfer"), true);
      assert.equal(isPaymentMethodConfigured("easypaisa"), true);

      assert.deepEqual(getPaymentInstructions("bank-transfer"), {
        method: "bank-transfer",
        label: "Bank Transfer",
        bankDisplayName: "Islamic Bank",
        accountNumber: "TEST-BANK-ACCOUNT",
        accountHolder: "Test Bank Holder",
      });

      assert.deepEqual(getPaymentInstructions("easypaisa"), {
        method: "easypaisa",
        label: "Easypaisa",
        accountNumber: "TEST-WALLET-NUMBER",
        accountHolder: "Test Wallet Holder",
      });
    },
  );
});

test("the public checkout method list never contains account values", () => {
  withPaymentEnv(
    {
      PAYMENT_BANK_ACCOUNT_NUMBER: "TEST-BANK-ACCOUNT",
      PAYMENT_BANK_ACCOUNT_HOLDER: "Test Bank Holder",
      PAYMENT_EASYPAISA_NUMBER: "TEST-WALLET-NUMBER",
      PAYMENT_EASYPAISA_ACCOUNT_HOLDER: "Test Wallet Holder",
    },
    () => {
      const serialised = JSON.stringify(getCheckoutPaymentMethods());

      for (const value of [
        "TEST-BANK-ACCOUNT",
        "Test Bank Holder",
        "TEST-WALLET-NUMBER",
        "Test Wallet Holder",
      ]) {
        assert.equal(serialised.includes(value), false, value);
      }
    },
  );
});

test("a partially configured method stays unavailable", () => {
  withPaymentEnv(
    { PAYMENT_BANK_ACCOUNT_NUMBER: "TEST-BANK-ACCOUNT" },
    () => {
      assert.equal(isPaymentMethodConfigured("bank-transfer"), false);
      assert.equal(getPaymentInstructions("bank-transfer"), null);
    },
  );
});
