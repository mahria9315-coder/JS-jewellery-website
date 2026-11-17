import { getDb } from "@/lib/db";

import { recordAdminAudit } from "./audit";

/**
 * Per-path SEO overrides.
 *
 * A row only overrides the fields it fills in; empty values fall back to the
 * approved page metadata already defined in code. Canonical paths are always
 * site-relative. Titles and descriptions are plain text.
 */

export class SeoError extends Error {
  readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = "SeoError";
    this.field = field;
  }
}

function cleanPath(value: string): string {
  const path = value.trim();

  if (path === "/") {
    return path;
  }

  if (!/^\/[a-z0-9][a-z0-9/_-]*$/.test(path) || path.length > 300) {
    throw new SeoError(
      "path",
      "Use a site path starting with /, for example /collections/rings.",
    );
  }

  return path.replace(/\/+$/, "");
}

export async function listSeoMetadata() {
  return getDb().seoMetadata.findMany({
    orderBy: { path: "asc" },
  });
}

export async function getSeoMetadata(path: string) {
  return getDb().seoMetadata.findUnique({ where: { path } });
}

export async function saveSeoMetadata(
  input: {
    path: string;
    title: string;
    description: string;
    ogImageSrc: string;
    canonicalPath: string;
    noIndex: boolean;
    sitemapInclude: boolean;
  },
  actor: string,
) {
  const path = cleanPath(input.path);
  const title = input.title.trim();
  const description = input.description.trim();
  const canonicalRaw = input.canonicalPath.trim();
  const canonicalPath = canonicalRaw === "" ? null : cleanPath(canonicalRaw);
  const ogImageRaw = input.ogImageSrc.trim();

  if (title.length > 120) {
    throw new SeoError("title", "Use 120 characters or fewer.");
  }

  if (description.length > 300) {
    throw new SeoError("description", "Use 300 characters or fewer.");
  }

  if (
    ogImageRaw !== "" &&
    (!/^\/[A-Za-z0-9._\-/]+$/.test(ogImageRaw) || ogImageRaw.includes(".."))
  ) {
    throw new SeoError(
      "ogImageSrc",
      "Use a local image path starting with /, for example /images/social-default.webp.",
    );
  }

  await getDb().seoMetadata.upsert({
    where: { path },
    update: {
      title: title || null,
      description: description || null,
      ogImageSrc: ogImageRaw || null,
      canonicalPath,
      noIndex: Boolean(input.noIndex),
      sitemapInclude: Boolean(input.sitemapInclude),
      updatedBy: actor,
    },
    create: {
      path,
      title: title || null,
      description: description || null,
      ogImageSrc: ogImageRaw || null,
      canonicalPath,
      noIndex: Boolean(input.noIndex),
      sitemapInclude: Boolean(input.sitemapInclude),
      updatedBy: actor,
    },
  });

  await recordAdminAudit({
    actor,
    action: "seo.update",
    entityType: "SeoMetadata",
    entityId: path,
    summary: "Updated search-engine metadata for a page.",
  });
}

export async function deleteSeoMetadata(path: string, actor: string) {
  const deleted = await getDb().seoMetadata.deleteMany({ where: { path } });

  if (deleted.count === 0) {
    throw new SeoError("path", "No SEO override exists for this path.");
  }

  await recordAdminAudit({
    actor,
    action: "seo.delete",
    entityType: "SeoMetadata",
    entityId: path,
    summary: "Removed a search-engine metadata override.",
  });
}
