import assert from "node:assert/strict";
import test from "node:test";

import {
  APPROVED_BANK_DISPLAY_NAME,
  PAYMENT_ENV_KEYS,
  getBankTransferConfig,
  getEasypaisaConfig,
  getPaymentConfigurationStatus,
} from "../lib/payments/config.ts";
import {
  PAYMENT_STATUSES,
  canTransitionPayment,
  getAllowedPaymentTransitions,
  isPaymentState,
  paymentStatusLabel,
} from "../lib/payments/transitions.ts";
import {
  formatPaymentReference,
  fromDatabasePaymentMethod,
  isPaymentMethodId,
  paymentMethodLabel,
  toDatabasePaymentMethod,
} from "../lib/payments/reference.ts";

const PAYMENT_KEYS = Object.values(PAYMENT_ENV_KEYS);

function clearPaymentEnv() {
  for (const key of PAYMENT_KEYS) {
    delete process.env[key];
  }
}

function withPaymentEnv(values, callback) {
  const previous = new Map(PAYMENT_KEYS.map((key) => [key, process.env[key]]));
  clearPaymentEnv();

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

test("payment states are exactly the five manual states", () => {
  assert.deepEqual(PAYMENT_STATUSES, [
    "PENDING",
    "SUBMITTED",
    "VERIFIED",
    "REJECTED",
    "REFUNDED",
  ]);
  assert.equal(isPaymentState("VERIFIED"), true);
  assert.equal(isPaymentState("PAID"), false);
  assert.equal(paymentStatusLabel("PENDING"), "Pending payment");
});

test("a customer may submit but never verify a payment", () => {
  assert.equal(canTransitionPayment("PENDING", "SUBMITTED", "CUSTOMER"), true);
  assert.equal(canTransitionPayment("PENDING", "VERIFIED", "CUSTOMER"), false);
  assert.equal(canTransitionPayment("SUBMITTED", "VERIFIED", "CUSTOMER"), false);
  assert.equal(canTransitionPayment("SUBMITTED", "VERIFIED", "ADMIN"), true);
});

test("payments cannot skip from pending straight to verified", () => {
  assert.equal(canTransitionPayment("PENDING", "VERIFIED", "ADMIN"), false);
  assert.equal(canTransitionPayment("PENDING", "REFUNDED", "ADMIN"), false);
  assert.deepEqual(getAllowedPaymentTransitions("PENDING", "CUSTOMER"), [
    "SUBMITTED",
  ]);
});

test("admins may reject, verify, and refund only along allowed edges", () => {
  assert.equal(canTransitionPayment("PENDING", "REJECTED", "ADMIN"), true);
  assert.equal(canTransitionPayment("SUBMITTED", "REJECTED", "ADMIN"), true);
  assert.equal(canTransitionPayment("REJECTED", "SUBMITTED", "CUSTOMER"), true);
  assert.equal(canTransitionPayment("VERIFIED", "REFUNDED", "ADMIN"), true);
  assert.equal(canTransitionPayment("REFUNDED", "VERIFIED", "ADMIN"), false);
  assert.deepEqual(getAllowedPaymentTransitions("REFUNDED", "ADMIN"), []);
});

test("bank transfer is unconfigured when its env keys are absent", () => {
  withPaymentEnv({}, () => {
    const bank = getBankTransferConfig();

    assert.equal(bank.isConfigured, false);
    assert.deepEqual(bank.missingEnvKeys, [
      PAYMENT_ENV_KEYS.bankAccountNumber,
      PAYMENT_ENV_KEYS.bankAccountHolder,
    ]);
    assert.equal(bank.accountNumber, null);
    assert.equal(bank.accountHolder, null);
  });
});

test("bank transfer needs both account number and holder", () => {
  withPaymentEnv(
    {
      PAYMENT_BANK_ACCOUNT_NUMBER: "TEST-ACCOUNT",
    },
    () => {
      const bank = getBankTransferConfig();

      assert.equal(bank.isConfigured, false);
      assert.deepEqual(bank.missingEnvKeys, [PAYMENT_ENV_KEYS.bankAccountHolder]);
    },
  );

  withPaymentEnv(
    {
      PAYMENT_BANK_ACCOUNT_NUMBER: "TEST-ACCOUNT",
      PAYMENT_BANK_ACCOUNT_HOLDER: "Test Holder",
    },
    () => {
      const bank = getBankTransferConfig();

      assert.equal(bank.isConfigured, true);
      assert.deepEqual(bank.missingEnvKeys, []);
      assert.equal(bank.accountNumber, "TEST-ACCOUNT");
      assert.equal(bank.accountHolder, "Test Holder");
    },
  );
});

test("the optional bank display name falls back to the approved name", () => {
  withPaymentEnv(
    {
      PAYMENT_BANK_DISPLAY_NAME: "Some Other Bank",
      PAYMENT_BANK_ACCOUNT_NUMBER: "TEST-ACCOUNT",
      PAYMENT_BANK_ACCOUNT_HOLDER: "Test Holder",
    },
    () => {
      assert.equal(getBankTransferConfig().displayName, "Some Other Bank");
    },
  );

  withPaymentEnv(
    {
      PAYMENT_BANK_ACCOUNT_NUMBER: "TEST-ACCOUNT",
      PAYMENT_BANK_ACCOUNT_HOLDER: "Test Holder",
    },
    () => {
      assert.equal(getBankTransferConfig().displayName, "Islamic Bank");
      assert.equal(APPROVED_BANK_DISPLAY_NAME, "Islamic Bank");
    },
  );

  withPaymentEnv(
    {
      PAYMENT_BANK_DISPLAY_NAME: "   ",
      PAYMENT_BANK_ACCOUNT_NUMBER: "TEST-ACCOUNT",
      PAYMENT_BANK_ACCOUNT_HOLDER: "Test Holder",
    },
    () => {
      assert.equal(getBankTransferConfig().displayName, "Islamic Bank");
    },
  );
});

test("easypaisa reports each missing key independently", () => {
  withPaymentEnv({ PAYMENT_EASYPAISA_NUMBER: "TEST-WALLET" }, () => {
    const easypaisa = getEasypaisaConfig();

    assert.equal(easypaisa.isConfigured, false);
    assert.deepEqual(easypaisa.missingEnvKeys, [
      PAYMENT_ENV_KEYS.easypaisaAccountHolder,
    ]);
  });

  withPaymentEnv(
    {
      PAYMENT_EASYPAISA_NUMBER: "TEST-WALLET",
      PAYMENT_EASYPAISA_ACCOUNT_HOLDER: "Test Holder",
    },
    () => {
      assert.equal(getEasypaisaConfig().isConfigured, true);
    },
  );
});

test("configuration status exposes only booleans and key names", () => {
  withPaymentEnv({}, () => {
    const status = getPaymentConfigurationStatus();

    assert.equal(status.checkoutImplemented, true);
    assert.equal(status.bankTransfer.configured, false);
    assert.equal(status.bankTransfer.accountHolderConfigured, false);
    assert.equal(status.easypaisa.configured, false);
    assert.deepEqual(Object.keys(status.bankTransfer).sort(), [
      "accountHolderConfigured",
      "configured",
      "missingEnvKeys",
    ]);
  });
});

test("payment references are unique per order number", () => {
  assert.equal(formatPaymentReference("JS-20261108-ABC123"), "PAY-JS-20261108-ABC123");
  assert.notEqual(
    formatPaymentReference("JS-20261108-ABC123"),
    formatPaymentReference("JS-20261108-ABC124"),
  );
});

test("payment method mapping round-trips between UI and database values", () => {
  assert.equal(toDatabasePaymentMethod("bank-transfer"), "BANK_TRANSFER");
  assert.equal(toDatabasePaymentMethod("easypaisa"), "EASYPAISA");
  assert.equal(fromDatabasePaymentMethod("BANK_TRANSFER"), "bank-transfer");
  assert.equal(fromDatabasePaymentMethod("EASYPAISA"), "easypaisa");
  assert.equal(isPaymentMethodId("bank-transfer"), true);
  assert.equal(isPaymentMethodId("card"), false);
  assert.equal(paymentMethodLabel("bank-transfer"), "Bank Transfer");
  assert.equal(paymentMethodLabel("easypaisa"), "Easypaisa");
});
