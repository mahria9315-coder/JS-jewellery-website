import { getDb } from "@/lib/db";
import { isSupportedBlobProductImageUrl } from "@/lib/product-images";

import { recordAdminAudit } from "./audit";

/**
 * Media library.
 *
 * This screen records and describes an existing image so that it has reviewed
 * alternative text and can be reused safely. It never edits or deletes the
 * file itself. Accepted sources are local raster paths under `public/` and
 * public Vercel Blob product-upload URLs; other remote URLs, SVG, and scripts
 * are rejected.
 */

const MEDIA_PATH = /^\/[A-Za-z0-9][A-Za-z0-9._\-/]*\.(avif|jpe?g|png|webp)$/i;

export class MediaError extends Error {
  readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = "MediaError";
    this.field = field;
  }
}

export function isSupportedMediaPath(value: string): boolean {
  if (isSupportedBlobProductImageUrl(value)) {
    return true;
  }

  return MEDIA_PATH.test(value) && !value.includes("..") && !value.startsWith("//");
}

export async function listMediaAssets() {
  return getDb().mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
  });
}

function inferMimeType(url: string): string {
  const extension = url.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "avif":
      return "image/avif";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    default:
      return "image/png";
  }
}

export async function createMediaAsset(
  input: {
    url: string;
    fileName: string;
    alt: string;
    sizeBytes: string;
  },
  actor: string,
) {
  const url = input.url.trim();

  if (!isSupportedMediaPath(url)) {
    throw new MediaError(
      "url",
      "Use a local image path under public/ (for example /images/products/rings/example.webp) or an uploaded Vercel Blob product-image URL.",
    );
  }

  const alt = input.alt.trim();

  if (alt.length < 3 || alt.length > 250) {
    throw new MediaError(
      "alt",
      "Describe the image for screen readers using 3-250 characters.",
    );
  }

  const fileName =
    input.fileName.trim() || url.split("/").filter(Boolean).pop() || "image";

  if (fileName.length > 200) {
    throw new MediaError("fileName", "Use a file name of 200 characters or fewer.");
  }

  const sizeRaw = input.sizeBytes.trim();
  const sizeBytes = sizeRaw === "" ? 0 : Number(sizeRaw);

  if (!Number.isInteger(sizeBytes) || sizeBytes < 0 || sizeBytes > 50_000_000) {
    throw new MediaError("sizeBytes", "Enter a file size in bytes, or leave it blank.");
  }

  const existing = await getDb().mediaAsset.findUnique({
    where: { url },
    select: { id: true },
  });

  if (existing) {
    throw new MediaError("url", "This image is already in the media library.");
  }

  const asset = await getDb().mediaAsset.create({
    data: {
      url,
      fileName,
      alt,
      sizeBytes,
      mimeType: inferMimeType(url),
      uploadedBy: actor,
    },
    select: { id: true, url: true },
  });

  await recordAdminAudit({
    actor,
    action: "media.create",
    entityType: "MediaAsset",
    entityId: asset.id,
    summary: "Registered an image in the media library.",
    metadata: { url: asset.url },
  });

  return asset;
}

export async function updateMediaAsset(
  id: string,
  input: { alt: string; fileName: string },
  actor: string,
) {
  const alt = input.alt.trim();

  if (alt.length < 3 || alt.length > 250) {
    throw new MediaError(
      "alt",
      "Describe the image for screen readers using 3-250 characters.",
    );
  }

  const updated = await getDb().mediaAsset.updateMany({
    where: { id },
    data: {
      alt,
      fileName: input.fileName.trim().slice(0, 200) || "image",
    },
  });

  if (updated.count === 0) {
    throw new MediaError("id", "Media record not found.");
  }

  await recordAdminAudit({
    actor,
    action: "media.update",
    entityType: "MediaAsset",
    entityId: id,
    summary: "Updated media alternative text.",
  });
}

export async function deleteMediaAsset(id: string, actor: string) {
  const asset = await getDb().mediaAsset.findUnique({
    where: { id },
    select: { id: true, url: true },
  });

  if (!asset) {
    throw new MediaError("id", "Media record not found.");
  }

  await getDb().mediaAsset.delete({ where: { id } });

  await recordAdminAudit({
    actor,
    action: "media.delete",
    entityType: "MediaAsset",
    entityId: id,
    summary: "Removed an image from the media library. The source file was not deleted.",
    metadata: { url: asset.url },
  });
}
