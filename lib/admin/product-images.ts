import { getDb } from "@/lib/db";
import {
  ProductImageStorageError,
  deleteStoredProductImage,
  storeProductImage,
} from "@/lib/storage/product-image-storage";
import {
  ProductImageUploadError,
  hasValidImageSignature,
  validateProductImageUpload,
} from "@/lib/product-image-upload";

import { recordAdminAudit } from "./audit";

/**
 * Product image uploads.
 *
 * Validation (type, size, magic bytes, alt text) happens before storage. The
 * storage backend is chosen by `lib/storage/product-image-storage.ts`: Vercel
 * Blob when `BLOB_READ_WRITE_TOKEN` is configured, otherwise local development
 * storage. Production without Blob fails closed with a clear message. Only the
 * stored URL is written to PostgreSQL, and removal deletes only the exact
 * object that this product image references.
 */

export {
  MAX_PRODUCT_IMAGE_BYTES,
  hasValidImageSignature,
  validateProductImageUpload,
} from "@/lib/product-image-upload";
export { ProductImageUploadError } from "@/lib/product-image-upload";
export {
  PRODUCT_UPLOAD_URL_PREFIX,
  ProductImageStorageError,
  getProductImageStorageKind,
} from "@/lib/storage/product-image-storage";

async function assertProductExists(productId: string) {
  const product = await getDb().product.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!product) {
    throw new ProductImageUploadError("productId", "Product not found.");
  }
}

export async function saveProductImage(
  input: {
    productId: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    bytes: Uint8Array;
    alt: string;
  },
  actor: string,
) {
  const validated = validateProductImageUpload(input);

  if (!hasValidImageSignature(input.bytes, validated.mimeType)) {
    throw new ProductImageUploadError(
      "image",
      "The file content does not match its image type. Upload a real JPEG, PNG, WebP, or AVIF image.",
    );
  }

  await assertProductExists(input.productId);

  let stored: Awaited<ReturnType<typeof storeProductImage>>;

  try {
    stored = await storeProductImage({
      baseName: validated.baseName,
      extension: validated.extension,
      mimeType: validated.mimeType,
      bytes: input.bytes,
    });
  } catch (error) {
    if (error instanceof ProductImageStorageError) {
      throw new ProductImageUploadError(error.field, error.message);
    }
    throw error;
  }

  const db = getDb();
  let image: { id: string; src: string; alt: string; sortOrder: number };

  try {
    const highest = await db.productImage.aggregate({
      where: { productId: input.productId },
      _max: { sortOrder: true },
    });
    const sortOrder = (highest._max.sortOrder ?? -1) + 1;

    image = await db.productImage.create({
      data: {
        productId: input.productId,
        src: stored.src,
        alt: validated.alt,
        sortOrder,
      },
      select: { id: true, src: true, alt: true, sortOrder: true },
    });
  } catch (error) {
    // Do not leave an orphaned object behind when the database write fails.
    await deleteStoredProductImage(stored.src);
    throw error;
  }

  try {
    await db.mediaAsset.create({
      data: {
        url: stored.src,
        fileName: stored.fileName,
        alt: validated.alt,
        sizeBytes: validated.sizeBytes,
        mimeType: validated.mimeType,
        uploadedBy: actor,
      },
    });
  } catch {
    // The media library is a convenience index. The product image itself has
    // already been stored, so a duplicate or failed index row is not fatal.
  }

  await recordAdminAudit({
    actor,
    action: "product.image.upload",
    entityType: "Product",
    entityId: input.productId,
    summary: "Uploaded a product image.",
    metadata: {
      src: stored.src,
      storage: stored.storage,
      sizeBytes: validated.sizeBytes,
      mimeType: validated.mimeType,
    },
  });

  return image;
}

export async function deleteProductImage(
  input: { productId: string; imageId: string },
  actor: string,
) {
  const db = getDb();
  const image = await db.productImage.findFirst({
    where: { id: input.imageId, productId: input.productId },
    select: { id: true, src: true, alt: true },
  });

  if (!image) {
    throw new ProductImageUploadError("imageId", "Product image not found.");
  }

  await db.productImage.delete({ where: { id: image.id } });
  await db.mediaAsset.deleteMany({ where: { url: image.src } });

  // Deletes only this exact local file or Blob object. It never lists or
  // removes other files, and a missing object is not treated as an error.
  await deleteStoredProductImage(image.src);

  await recordAdminAudit({
    actor,
    action: "product.image.delete",
    entityType: "Product",
    entityId: input.productId,
    summary: "Removed a product image.",
    metadata: { src: image.src },
  });
}
