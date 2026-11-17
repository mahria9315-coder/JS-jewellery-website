import assert from "node:assert/strict";
import test from "node:test";

import {
  getClientIp,
  isSameOrigin,
  isSameOriginRequestHeaders,
  safeRelativePath,
} from "../lib/security/request.ts";

function request(url, headers = {}) {
  return new Request(url, { method: "POST", headers });
}

function headerGetter(headers) {
  const map = new Map(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]),
  );

  return (name) => map.get(name.toLowerCase()) ?? null;
}

test("same-origin accepts missing Origin and matching origins", () => {
  assert.equal(isSameOrigin(request("https://shop.example/checkout")), true);
  assert.equal(
    isSameOrigin(
      request("https://shop.example/checkout", {
        origin: "https://shop.example",
      }),
    ),
    true,
  );
});

test("same-origin rejects cross-origin, protocol downgrade, and malformed origins", () => {
  assert.equal(
    isSameOrigin(
      request("https://shop.example/checkout", {
        origin: "https://evil.example",
      }),
    ),
    false,
  );
  assert.equal(
    isSameOrigin(
      request("https://shop.example/checkout", {
        origin: "http://shop.example",
      }),
    ),
    false,
  );
  assert.equal(
    isSameOrigin(
      request("https://shop.example/checkout", {
        origin: "null",
      }),
    ),
    false,
  );
  assert.equal(
    isSameOrigin(
      request("https://shop.example/checkout", {
        origin: "not a url",
      }),
    ),
    false,
  );
});

test("server-action origin checks compare Origin with the public host", () => {
  assert.equal(
    isSameOriginRequestHeaders(
      headerGetter({ origin: "https://shop.example", host: "shop.example" }),
      true,
    ),
    true,
  );
  assert.equal(
    isSameOriginRequestHeaders(
      headerGetter({
        origin: "https://shop.example",
        host: "internal:3000",
        "x-forwarded-host": "shop.example",
        "x-forwarded-proto": "https",
      }),
      true,
    ),
    true,
  );
  assert.equal(
    isSameOriginRequestHeaders(headerGetter({ host: "shop.example" }), true),
    true,
  );
  assert.equal(
    isSameOriginRequestHeaders(
      headerGetter({ origin: "https://evil.example", host: "shop.example" }),
      true,
    ),
    false,
  );
  assert.equal(
    isSameOriginRequestHeaders(
      headerGetter({ origin: "http://shop.example", host: "shop.example" }),
      true,
    ),
    false,
  );
  assert.equal(
    isSameOriginRequestHeaders(
      headerGetter({ origin: "http://shop.example", host: "shop.example" }),
      false,
    ),
    true,
  );
  assert.equal(
    isSameOriginRequestHeaders(
      headerGetter({
        origin: "https://shop.example",
        host: "shop.example",
        "x-forwarded-proto": "http",
      }),
      true,
    ),
    false,
  );
  assert.equal(
    isSameOriginRequestHeaders(
      headerGetter({ origin: "not a url", host: "shop.example" }),
      true,
    ),
    false,
  );
});

test("client IP prefers x-real-ip, otherwise uses the safest forwarded value", () => {
  assert.equal(
    getClientIp(
      request("https://shop.example/", {
        "x-forwarded-for": "203.0.113.7, 10.0.0.1, 10.0.0.2",
      }),
    ),
    "10.0.0.2",
  );
  assert.equal(
    getClientIp(
      request("https://shop.example/", {
        "x-forwarded-for": "203.0.113.8",
        "x-real-ip": "198.51.100.1",
      }),
    ),
    "198.51.100.1",
  );
  assert.equal(
    getClientIp(
      request("https://shop.example/", { "x-real-ip": "198.51.100.2" }),
    ),
    "198.51.100.2",
  );
  assert.equal(getClientIp(request("https://shop.example/")), "unknown");
  assert.equal(
    getClientIp(
      request("https://shop.example/", { "x-forwarded-for": " , 10.0.0.1" }),
    ),
    "10.0.0.1",
  );
});

test("redirect targets accept only safe site-relative paths", () => {
  assert.equal(safeRelativePath("/admin/orders", "/admin"), "/admin/orders");
  assert.equal(safeRelativePath("/cart?updated=1", "/"), "/cart?updated=1");

  for (const unsafe of [
    "//evil.example",
    "///evil.example",
    "https://evil.example",
    "http://evil.example/path",
    "admin/orders",
    "",
    null,
    undefined,
  ]) {
    assert.equal(safeRelativePath(unsafe, "/admin"), "/admin", String(unsafe));
  }
});

test("redirect targets reject backslash and control-character bypasses", () => {
  // Browsers treat `\` like `/` in special URLs, so `/\evil.example` would
  // otherwise resolve to `//evil.example`.
  for (const unsafe of [
    "/\\evil.example",
    "/\\\\evil.example",
    "/\tevil.example",
    "/\nevil.example",
    "/\u0000evil.example",
    "/\u007Fevil.example",
  ]) {
    assert.equal(safeRelativePath(unsafe, "/"), "/", JSON.stringify(unsafe));
  }
});
