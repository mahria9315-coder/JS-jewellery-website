import assert from "node:assert/strict";
import test from "node:test";

import {
  blobProductImageUrlError,
  isSupportedBlobProductImageUrl,
  isSupportedProductImageSource,
} from "../lib/product-images.ts";
import { getProductImageStorageKind } from "../lib/storage/product-image-storage.ts";

const VALID_BLOB_URL =
  "https://abc123.public.blob.vercel-storage.com/products/uploads/ring-abc123.webp";

test("valid Vercel Blob product URLs are accepted", () => {
  assert.equal(blobProductImageUrlError(VALID_BLOB_URL), null);
  assert.equal(isSupportedBlobProductImageUrl(VALID_BLOB_URL), true);
  assert.equal(
    isSupportedProductImageSource(
      "https://store.public.blob.vercel-storage.com/products/uploads/ring.jpg",
    ),
    true,
  );
});

test("external, insecure, and traversal Blob URLs are rejected", () => {
  const rejected = [
    "http://abc123.public.blob.vercel-storage.com/products/uploads/ring.webp",
    "https://example.com/products/uploads/ring.webp",
    "https://abc123.public.blob.vercel-storage.com/other/ring.webp",
    "https://abc123.public.blob.vercel-storage.com/products/uploads/../secret.webp",
    "https://abc123.public.blob.vercel-storage.com/products/uploads/ring.svg",
    "https://abc123.public.blob.vercel-storage.com/products/uploads/ring.webp?x=1",
    "https://user:pass@abc123.public.blob.vercel-storage.com/products/uploads/ring.webp",
    "not a url",
  ];

  for (const value of rejected) {
    assert.notEqual(blobProductImageUrlError(value), null, value);
    assert.equal(isSupportedBlobProductImageUrl(value), false, value);
  }
});

test("local product paths remain supported alongside Blob URLs", () => {
  assert.equal(
    isSupportedProductImageSource("/images/products/rings/example.webp"),
    true,
  );
  assert.equal(
    isSupportedProductImageSource("/images/products/uploads/ring-abc.png"),
    true,
  );
  assert.equal(isSupportedProductImageSource("/images/products/../secret.png"), false);
  assert.equal(isSupportedProductImageSource("https://example.com/ring.png"), false);
});

test("storage backend selection is explicit and fails closed in production", () => {
  assert.equal(
    getProductImageStorageKind({ NODE_ENV: "development" }),
    "local",
  );
  assert.equal(
    getProductImageStorageKind({
      NODE_ENV: "production",
      BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_EXAMPLE_TOKEN_123456789",
    }),
    "vercel-blob",
  );
  assert.equal(
    getProductImageStorageKind({ NODE_ENV: "production" }),
    "unconfigured-production",
  );
});
