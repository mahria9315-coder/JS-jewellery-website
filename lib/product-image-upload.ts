/**
 * Pure validation for admin product-image uploads.
 *
 * Kept free of database and filesystem imports so the rules can be tested
 * directly. Only raster formats are accepted and the caller must also confirm
 * the leading file bytes before writing anything to disk.
 */

export const MAX_PRODUCT_IMAGE_BYTES = 8_000_000;

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/avif": "avif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export class ProductImageUploadError extends Error {
  readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = "ProductImageUploadError";
    this.field = field;
  }
}

export type ValidatedProductImageUpload = {
  baseName: string;
  extension: string;
  mimeType: string;
  alt: string;
  sizeBytes: number;
};

function baseNameOf(fileName: string): string {
  return fileName.trim().split(/[\\/]/).pop() ?? "";
}

function slugifyBaseName(fileName: string): string {
  const withoutExtension = baseNameOf(fileName).replace(/\.[^.]+$/, "");
  const slug = withoutExtension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return slug || "product-image";
}

export function validateProductImageUpload(input: {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  alt: string;
}): ValidatedProductImageUpload {
  const fileName = baseNameOf(input.fileName);

  if (fileName === "") {
    throw new ProductImageUploadError("image", "Choose an image file to upload.");
  }

  if (fileName.length > 200) {
    throw new ProductImageUploadError(
      "image",
      "Use a file name of 200 characters or fewer.",
    );
  }

  const mimeType = input.mimeType.trim().toLowerCase();
  const extension = EXTENSION_BY_MIME[mimeType];

  if (!extension) {
    throw new ProductImageUploadError(
      "image",
      "Upload a JPEG, PNG, WebP, or AVIF image.",
    );
  }

  if (!Number.isInteger(input.sizeBytes) || input.sizeBytes <= 0) {
    throw new ProductImageUploadError("image", "The selected image is empty.");
  }

  if (input.sizeBytes > MAX_PRODUCT_IMAGE_BYTES) {
    throw new ProductImageUploadError(
      "image",
      `Images must be ${Math.round(MAX_PRODUCT_IMAGE_BYTES / 1_000_000)} MB or smaller.`,
    );
  }

  const alt = input.alt.trim();

  if (alt.length < 3 || alt.length > 250) {
    throw new ProductImageUploadError(
      "alt",
      "Describe the image for screen readers using 3-250 characters.",
    );
  }

  return {
    baseName: slugifyBaseName(fileName),
    extension,
    mimeType,
    alt,
    sizeBytes: input.sizeBytes,
  };
}

function startsWith(bytes: Uint8Array, signature: readonly number[]): boolean {
  return signature.every((value, index) => bytes[index] === value);
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

/** Check the leading bytes so a renamed non-image file cannot be stored. */
export function hasValidImageSignature(
  bytes: Uint8Array,
  mimeType: string,
): boolean {
  if (bytes.length < 12) {
    return false;
  }

  switch (mimeType.trim().toLowerCase()) {
    case "image/jpeg":
      return startsWith(bytes, [0xff, 0xd8, 0xff]);
    case "image/png":
      return startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "image/webp":
      return ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP";
    case "image/avif": {
      if (ascii(bytes, 4, 4) !== "ftyp") {
        return false;
      }

      const brand = ascii(bytes, 8, 4);
      return brand === "avif" || brand === "avis";
    }
    default:
      return false;
  }
}
