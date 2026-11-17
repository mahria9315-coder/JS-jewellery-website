import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  PRODUCT_IMAGE_URL_PREFIX,
  blobProductImageUrlError,
} from "@/lib/product-images";
import { validateBlobToken } from "@/lib/env/production";

/**
 * Product image storage abstraction.
 *
 * Two backends are supported:
 *   - `local`: development only, files under `public/images/products/uploads/`.
 *   - `vercel-blob`: production, using the official `@vercel/blob` SDK.
 *
 * Selection is explicit: a configured `BLOB_READ_WRITE_TOKEN` selects Blob in
 * every environment. Without a token, local development keeps working and a
 * production deployment fails closed with a clear setup message rather than
 * writing to a read-only/ephemeral filesystem.
 *
 * Only the validated raster types accepted by `lib/product-image-upload.ts`
 * reach this module. Storage never accepts a caller-supplied path.
 */

export const PRODUCT_UPLOAD_URL_PREFIX = `${PRODUCT_IMAGE_URL_PREFIX}uploads/`;
export const BLOB_PRODUCT_PATH_PREFIX = "products/uploads/";
export const VERCEL_BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";
export const BLOB_READ_WRITE_TOKEN_ENV = "BLOB_READ_WRITE_TOKEN" as const;

export type ProductImageStorageKind =
  | "local"
  | "vercel-blob"
  | "unconfigured-production";

export class ProductImageStorageError extends Error {
  readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = "ProductImageStorageError";
    this.field = field;
  }
}

function tokenFromEnv(env: NodeJS.ProcessEnv): string {
  return env[BLOB_READ_WRITE_TOKEN_ENV]?.trim() ?? "";
}

/** Report which backend would be used without performing any I/O. */
export function getProductImageStorageKind(
  env: NodeJS.ProcessEnv = process.env,
): ProductImageStorageKind {
  if (tokenFromEnv(env)) {
    return "vercel-blob";
  }

  return env.NODE_ENV === "production" ? "unconfigured-production" : "local";
}

function uploadsDirectory(): string {
  return path.join(process.cwd(), "public", "images", "products", "uploads");
}

export type StoredProductImage = {
  src: string;
  fileName: string;
  storage: "local" | "vercel-blob";
};

/** Store one validated product image and return its public URL. */
export async function storeProductImage(input: {
  baseName: string;
  extension: string;
  mimeType: string;
  bytes: Uint8Array;
}): Promise<StoredProductImage> {
  const fileName = `${input.baseName}-${randomUUID().slice(0, 8)}.${input.extension}`;
  const kind = getProductImageStorageKind();

  if (kind === "unconfigured-production") {
    throw new ProductImageStorageError(
      "image",
      "Product image storage is not configured. Create a Vercel Blob store and set BLOB_READ_WRITE_TOKEN in the production environment.",
    );
  }

  if (kind === "vercel-blob") {
    const token = tokenFromEnv(process.env);
    const tokenError = validateBlobToken(token);

    if (tokenError) {
      throw new ProductImageStorageError("image", tokenError);
    }

    try {
      const { put } = await import("@vercel/blob");
      const pathname = `${BLOB_PRODUCT_PATH_PREFIX}${fileName}`;
      const result = await put(pathname, Buffer.from(input.bytes), {
        access: "public",
        contentType: input.mimeType,
        addRandomSuffix: false,
        allowOverwrite: false,
        token,
      });

      const urlError = blobProductImageUrlError(result.url);

      if (urlError) {
        // A malformed response is never written to the database. Remove the
        // just-created object so a retry cannot leave an unreferenced file.
        const { del } = await import("@vercel/blob");
        await del(result.url, { token }).catch(() => undefined);
        throw new ProductImageStorageError("image", urlError);
      }

      return { src: result.url, fileName, storage: "vercel-blob" };
    } catch (error) {
      if (error instanceof ProductImageStorageError) {
        throw error;
      }

      // Never surface a token or request body through the error chain.
      throw new ProductImageStorageError(
        "image",
        "The image could not be uploaded to Vercel Blob. Check the Blob store configuration and try again.",
      );
    }
  }

  const src = `${PRODUCT_UPLOAD_URL_PREFIX}${fileName}`;
  const directory = uploadsDirectory();
  const filePath = path.join(directory, fileName);

  try {
    await mkdir(directory, { recursive: true });
    await writeFile(filePath, input.bytes);
  } catch {
    throw new ProductImageStorageError(
      "image",
      "The image could not be written to local development storage.",
    );
  }

  return { src, fileName, storage: "local" };
}

/** Delete only the exact stored object; unrelated files are never touched. */
export async function deleteStoredProductImage(src: string): Promise<void> {
  const kind = getProductImageStorageKind();

  if (kind === "vercel-blob") {
    const urlError = blobProductImageUrlError(src);

    if (urlError) {
      return;
    }

    const token = tokenFromEnv(process.env);

    if (!token) {
      return;
    }

    try {
      const { del } = await import("@vercel/blob");
      await del(src, { token });
    } catch {
      // The database row is authoritative. A missing or already-deleted blob
      // must not block removal of the record.
    }

    return;
  }

  const filePath = localUploadPathFor(src);

  if (!filePath) {
    return;
  }

  try {
    await unlink(filePath);
  } catch {
    // The record is authoritative. A missing local file is not an error.
  }
}

/**
 * Resolve a local upload URL to its exact file path. Only a single file name
 * directly inside the uploads directory is accepted; paths, traversal, and
 * other public assets are rejected.
 */
export function localUploadPathFor(src: string): string | null {
  if (!src.startsWith(PRODUCT_UPLOAD_URL_PREFIX)) {
    return null;
  }

  const relative = src.slice(PRODUCT_UPLOAD_URL_PREFIX.length);

  if (relative === "" || relative.includes("..") || relative.includes("/")) {
    return null;
  }

  return path.join(uploadsDirectory(), relative);
}
