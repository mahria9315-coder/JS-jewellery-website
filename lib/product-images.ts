import type { ProductImage } from "./catalogue";

/**
 * Product image storage policy.
 *
 * Two safe sources are supported:
 *   - Local development: raster files under `public/images/products/`,
 *     referenced by a path such as `/images/products/rings/example.webp`.
 *   - Production: public Vercel Blob URLs created by the admin upload flow
 *     under the `products/uploads/` prefix.
 *
 * Only supported raster formats are accepted. External URLs from any other
 * host, traversal, query strings, and unsupported file types fall back to the
 * neutral "Image pending" placeholder rather than being rendered. No external
 * image host is configured by default.
 */
export const PRODUCT_IMAGE_URL_PREFIX = "/images/products/";

export const VERCEL_BLOB_PUBLIC_HOST_SUFFIX = ".public.blob.vercel-storage.com";
export const VERCEL_BLOB_PRODUCT_PATH_PREFIX = "/products/uploads/";

const SAFE_PRODUCT_IMAGE_PATH =
  /^\/images\/products\/[a-z0-9][a-z0-9/_-]*\.(avif|jpe?g|png|webp)$/i;

const SAFE_RASTER_EXTENSION = /\.(avif|jpe?g|png|webp)$/i;

/** True when a string is a supported local product-image path. */
export function isSupportedProductImagePath(src: string): boolean {
  return src.startsWith(PRODUCT_IMAGE_URL_PREFIX) && SAFE_PRODUCT_IMAGE_PATH.test(src);
}

/**
 * Explain why a URL is not an accepted Vercel Blob product image, or return
 * null when it is accepted. Used by the upload writer and by display code so
 * both enforce exactly the same rules.
 */
export function blobProductImageUrlError(src: string): string | null {
  let parsed: URL;

  try {
    parsed = new URL(src);
  } catch {
    return "The image URL is not a valid absolute URL.";
  }

  if (parsed.protocol !== "https:") {
    return "Vercel Blob image URLs must use https://.";
  }

  if (parsed.username || parsed.password) {
    return "Vercel Blob image URLs must not contain credentials.";
  }

  if (parsed.port) {
    return "Vercel Blob image URLs must not specify a port.";
  }

  if (!parsed.hostname.endsWith(VERCEL_BLOB_PUBLIC_HOST_SUFFIX)) {
    return "The image URL is not from the configured Vercel Blob host.";
  }

  const label = parsed.hostname.slice(
    0,
    -VERCEL_BLOB_PUBLIC_HOST_SUFFIX.length,
  );

  if (!/^[a-z0-9][a-z0-9-]*$/i.test(label)) {
    return "The Vercel Blob host name is not valid.";
  }

  if (!parsed.pathname.startsWith(VERCEL_BLOB_PRODUCT_PATH_PREFIX)) {
    return "The image URL is outside the product uploads folder.";
  }

  const fileName = parsed.pathname.slice(VERCEL_BLOB_PRODUCT_PATH_PREFIX.length);

  if (
    fileName === "" ||
    fileName.includes("/") ||
    fileName.includes("..") ||
    !SAFE_RASTER_EXTENSION.test(fileName)
  ) {
    return "The image URL must point directly at a supported raster image.";
  }

  if (parsed.search || parsed.hash) {
    return "The image URL must not contain a query string or fragment.";
  }

  return null;
}

export function isSupportedBlobProductImageUrl(src: string): boolean {
  return blobProductImageUrlError(src) === null;
}

/** True when a source is safe to render: local path or Vercel Blob URL. */
export function isSupportedProductImageSource(src: string): boolean {
  return (
    isSupportedProductImagePath(src) || isSupportedBlobProductImageUrl(src)
  );
}

/**
 * Return a safe image for display, or undefined when the image is missing,
 * has no meaningful alternative text, or is not a supported local/Blob file.
 */
export function getDisplayProductImage(
  image: ProductImage | undefined,
): ProductImage | undefined {
  if (!image) {
    return undefined;
  }

  const alt = image.alt.trim();

  if (!alt || !isSupportedProductImageSource(image.src)) {
    return undefined;
  }

  return { src: image.src, alt };
}

/** Filter a product image list to the images that are safe to display. */
export function getDisplayProductImages(
  images: readonly ProductImage[],
): ProductImage[] {
  const validImages: ProductImage[] = [];

  for (const image of images) {
    const validImage = getDisplayProductImage(image);

    if (validImage) {
      validImages.push(validImage);
    }
  }

  return validImages;
}
