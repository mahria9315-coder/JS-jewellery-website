import assert from "node:assert/strict";
import test from "node:test";

import {
  formatMoneyMinor,
  parseReportRange,
} from "../lib/admin/reports.ts";

test("an explicit report range is inclusive of both entered dates", () => {
  const range = parseReportRange("2026-11-01", "2026-11-07");

  assert.equal(range.from.toISOString(), "2026-11-01T00:00:00.000Z");
  assert.equal(range.to.toISOString(), "2026-11-08T00:00:00.000Z");
  assert.equal(range.label, "2026-11-01 to 2026-11-07");
});

test("a single-day range covers exactly that day", () => {
  const range = parseReportRange("2026-11-07", "2026-11-07");

  assert.equal(range.from.toISOString(), "2026-11-07T00:00:00.000Z");
  assert.equal(range.to.toISOString(), "2026-11-08T00:00:00.000Z");
  assert.equal(range.label, "2026-11-07 to 2026-11-07");
});

test("reversed ranges are normalised instead of returning negative days", () => {
  const range = parseReportRange("2026-11-20", "2026-11-10");

  assert.equal(range.from.toISOString(), "2026-11-10T00:00:00.000Z");
  assert.equal(range.to.toISOString(), "2026-11-11T00:00:00.000Z");
  assert.equal(range.label, "");
});

test("missing or malformed dates fall back to safe defaults", () => {
  const now = new Date();
  const fallbackStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);

  for (const [from, to] of [
    [undefined, undefined],
    ["", ""],
    ["07/11/2026", "2026-11-07"],
    ["2026-13-01", "2026-11-07"],
    ["2026-11-07extra", "2026-11-07"],
  ]) {
    const range = parseReportRange(from, to);

    assert.equal(Number.isNaN(range.from.getTime()), false);
    assert.equal(Number.isNaN(range.to.getTime()), false);
    assert.ok(range.from < range.to, `${from} -> ${to}`);
    assert.ok(range.from.getTime() >= fallbackStart, `${from} -> ${to}`);
  }

  const range = parseReportRange(undefined, undefined);
  assert.equal(range.from.getTime(), fallbackStart);
  assert.match(range.label, /^\d{4}-\d{2}-01 to \d{4}-\d{2}-\d{2}$/);
});

test("no range can extend past the requested day boundary", () => {
  const range = parseReportRange("2026-02-28", "2026-02-28");

  assert.equal(range.to.toISOString(), "2026-03-01T00:00:00.000Z");
});

test("money is formatted from minor units without hidden fractions", () => {
  assert.match(formatMoneyMinor(250000), /2,500/);
  assert.match(formatMoneyMinor(0), /0/);
  assert.equal(/[.,]\d{2}$/.test(formatMoneyMinor(250000)), false);
  assert.match(formatMoneyMinor(100000000), /1,000,000/);

  // Rounding is display-only and never introduces a decimal currency string.
  assert.equal(formatMoneyMinor(12345).includes(".45"), false);
});

test("a non-default currency is formatted explicitly", () => {
  const usd = formatMoneyMinor(123456, "USD");

  assert.match(usd, /1,235/);
  assert.match(usd, /\$|USD/);
});
