import { getDb, isDatabaseConfigured } from "@/lib/db";

import { recordAdminAudit } from "./audit";

/**
 * Website content management.
 *
 * Page bodies are stored as plain text and rendered as text, never as HTML, so
 * a CMS editor cannot inject scripts or arbitrary markup. Links are restricted
 * to site-relative paths or https URLs. Only PUBLISHED pages and visible
 * sections are read by the storefront; drafts never reach customers.
 */

export const CONTENT_STATUSES = [
  "DRAFT",
  "IN_REVIEW",
  "APPROVED",
  "PUBLISHED",
] as const;

export type ContentStatusValue = (typeof CONTENT_STATUSES)[number];

export const CONTENT_STATUS_LABELS: Record<ContentStatusValue, string> = {
  DRAFT: "Draft",
  IN_REVIEW: "In review",
  APPROVED: "Approved",
  PUBLISHED: "Published",
};

export const NAVIGATION_LOCATIONS = [
  "primary",
  "footer-shop",
  "footer-policy",
] as const;

export type NavigationLocation = (typeof NAVIGATION_LOCATIONS)[number];

export class ContentError extends Error {
  readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = "ContentError";
    this.field = field;
  }
}

function text(value: string, field: string, max: number, min = 0): string {
  const cleaned = value.trim();

  if (cleaned.length < min) {
    throw new ContentError(field, `Enter at least ${min} characters.`);
  }

  if (cleaned.length > max) {
    throw new ContentError(field, `Use ${max} characters or fewer.`);
  }

  return cleaned;
}

function optional(value: string, max: number): string | null {
  const cleaned = value.trim();
  return cleaned === "" ? null : cleaned.slice(0, max);
}

function cleanSlug(value: string): string {
  const slug = value.trim().toLowerCase();

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 80) {
    throw new ContentError(
      "slug",
      "Use a lowercase URL slug with hyphens, for example delivery-information.",
    );
  }

  return slug;
}

function cleanHref(value: string, field: string): string {
  const href = value.trim();

  if (href === "") {
    return "";
  }

  if (href.startsWith("/") && !href.startsWith("//")) {
    return href.slice(0, 500);
  }

  if (/^https:\/\/[A-Za-z0-9.-]+(?:\/|$)/.test(href)) {
    return href.slice(0, 500);
  }

  throw new ContentError(
    field,
    "Use a site path starting with / or a complete https:// address.",
  );
}

function cleanImageSrc(value: string): string | null {
  const src = value.trim();

  if (src === "") {
    return null;
  }

  if (
    !/^\/[A-Za-z0-9._\-/]+$/.test(src) ||
    src.startsWith("//") ||
    src.includes("..")
  ) {
    throw new ContentError(
      "imageSrc",
      "Use a local image path starting with /, for example /images/example.webp.",
    );
  }

  return src;
}

export function isContentStatus(value: string): value is ContentStatusValue {
  return (CONTENT_STATUSES as readonly string[]).includes(value);
}

export function isNavigationLocation(
  value: string,
): value is NavigationLocation {
  return (NAVIGATION_LOCATIONS as readonly string[]).includes(value);
}

export type PageInput = {
  slug: string;
  title: string;
  intro: string;
  status: ContentStatusValue;
  isIndexable: boolean;
};

export function parsePageInput(input: {
  slug: string;
  title: string;
  intro: string;
  status: string;
  isIndexable: boolean;
}): PageInput {
  const status = input.status.trim() as ContentStatusValue;

  if (!isContentStatus(status)) {
    throw new ContentError("status", "Choose a valid page status.");
  }

  return {
    slug: cleanSlug(input.slug),
    title: text(input.title, "title", 200, 2),
    intro: text(input.intro, "intro", 1000),
    status,
    isIndexable: Boolean(input.isIndexable),
  };
}

export type SectionInput = {
  sectionKey: string;
  heading: string;
  body: string;
  imageSrc: string | null;
  imageAlt: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  sortOrder: number;
  isVisible: boolean;
};

export function parseSectionInput(input: {
  sectionKey: string;
  heading: string;
  body: string;
  imageSrc?: string;
  imageAlt?: string;
  ctaLabel?: string;
  ctaHref?: string;
  sortOrder?: string;
  isVisible?: boolean;
}): SectionInput {
  const sectionKey = input.sectionKey.trim().toLowerCase();

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(sectionKey) || sectionKey.length > 60) {
    throw new ContentError(
      "sectionKey",
      "Use a lowercase key with hyphens, for example how-it-works.",
    );
  }

  const sortRaw = (input.sortOrder ?? "").trim();
  const sortOrder = sortRaw === "" ? 0 : Number(sortRaw);

  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 10000) {
    throw new ContentError("sortOrder", "Enter a whole number between 0 and 10000.");
  }

  const ctaLabel = optional(input.ctaLabel ?? "", 80);
  const ctaHref = cleanHref(input.ctaHref ?? "", "ctaHref");

  if (ctaLabel && !ctaHref) {
    throw new ContentError("ctaHref", "Add a destination for the button label.");
  }

  if (!ctaLabel && ctaHref) {
    throw new ContentError("ctaLabel", "Add a button label or clear the link.");
  }

  return {
    sectionKey,
    heading: text(input.heading, "heading", 200, 2),
    body: text(input.body ?? "", "body", 8000),
    imageSrc: cleanImageSrc(input.imageSrc ?? ""),
    imageAlt: optional(input.imageAlt ?? "", 250),
    ctaLabel,
    ctaHref: ctaHref || null,
    sortOrder,
    isVisible: Boolean(input.isVisible),
  };
}

export async function listContentPages() {
  return getDb().contentPage.findMany({
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      intro: true,
      status: true,
      isIndexable: true,
      publishedAt: true,
      updatedAt: true,
      _count: { select: { sections: true } },
    },
  });
}

export async function getContentPageForAdmin(id: string) {
  return getDb().contentPage.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      intro: true,
      status: true,
      isIndexable: true,
      publishedAt: true,
      updatedAt: true,
      updatedBy: true,
      sections: { orderBy: [{ sortOrder: "asc" }, { sectionKey: "asc" }] },
      versions: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          status: true,
          note: true,
          createdBy: true,
          createdAt: true,
        },
      },
    },
  });
}

async function snapshot(
  pageId: string,
  status: ContentStatusValue,
  note: string,
  actor: string,
) {
  const db = getDb();
  const page = await db.contentPage.findUnique({
    where: { id: pageId },
    select: {
      slug: true,
      title: true,
      intro: true,
      isIndexable: true,
      sections: {
        orderBy: { sortOrder: "asc" },
        select: {
          sectionKey: true,
          heading: true,
          body: true,
          imageSrc: true,
          imageAlt: true,
          ctaLabel: true,
          ctaHref: true,
          sortOrder: true,
          isVisible: true,
        },
      },
    },
  });

  if (!page) return;

  await db.pageVersion.create({
    data: {
      pageId,
      snapshot: page,
      status,
      note: note.slice(0, 300),
      createdBy: actor,
    },
  });
}

export async function createContentPage(input: PageInput, actor: string) {
  const db = getDb();
  const existing = await db.contentPage.findUnique({
    where: { slug: input.slug },
    select: { id: true },
  });

  if (existing) {
    throw new ContentError("slug", "A page with this URL slug already exists.");
  }

  const page = await db.contentPage.create({
    data: {
      slug: input.slug,
      title: input.title,
      intro: input.intro,
      status: input.status,
      isIndexable: input.isIndexable,
      publishedAt: input.status === "PUBLISHED" ? new Date() : null,
      updatedBy: actor,
    },
    select: { id: true, slug: true },
  });

  await snapshot(
    page.id,
    input.status,
    "Initial page record created in the CMS.",
    actor,
  );

  await recordAdminAudit({
    actor,
    action: "content.page.create",
    entityType: "ContentPage",
    entityId: page.id,
    summary: "Created a website content page.",
    metadata: { slug: page.slug, status: input.status },
  });

  return page;
}

export async function updateContentPage(
  id: string,
  input: PageInput,
  actor: string,
) {
  const db = getDb();
  const current = await db.contentPage.findUnique({
    where: { id },
    select: { id: true, slug: true, status: true, publishedAt: true },
  });

  if (!current) {
    throw new ContentError("id", "Page not found.");
  }

  const duplicate = await db.contentPage.findFirst({
    where: { slug: input.slug, id: { not: id } },
    select: { id: true },
  });

  if (duplicate) {
    throw new ContentError("slug", "A page with this URL slug already exists.");
  }

  if (input.status === "PUBLISHED") {
    const visibleSections = await db.contentSection.count({
      where: { pageId: id, isVisible: true },
    });

    if (!input.intro || visibleSections === 0) {
      throw new ContentError(
        "status",
        "Add an introduction and at least one visible section before publishing.",
      );
    }
  }

  await db.contentPage.update({
    where: { id },
    data: {
      slug: input.slug,
      title: input.title,
      intro: input.intro,
      status: input.status,
      isIndexable: input.isIndexable,
      publishedAt:
        input.status === "PUBLISHED"
          ? (current.publishedAt ?? new Date())
          : null,
      updatedBy: actor,
    },
  });

  await snapshot(id, input.status, "Page details saved.", actor);

  await recordAdminAudit({
    actor,
    action: "content.page.update",
    entityType: "ContentPage",
    entityId: id,
    summary:
      input.status === "PUBLISHED"
        ? "Published a website content page."
        : "Updated a website content page.",
    metadata: { slug: input.slug, status: input.status },
  });
}

export async function deleteContentPage(id: string, actor: string) {
  const db = getDb();
  const page = await db.contentPage.findUnique({
    where: { id },
    select: { id: true, slug: true, status: true },
  });

  if (!page) {
    throw new ContentError("id", "Page not found.");
  }

  if (page.status === "PUBLISHED") {
    throw new ContentError(
      "id",
      "Unpublish this page before deleting it. Published pages are never removed silently.",
    );
  }

  await db.contentPage.delete({ where: { id } });

  await recordAdminAudit({
    actor,
    action: "content.page.delete",
    entityType: "ContentPage",
    entityId: id,
    summary: `Deleted unpublished page ${page.slug}.`,
  });
}

export async function saveContentSection(
  pageId: string,
  sectionId: string | null,
  input: SectionInput,
  actor: string,
) {
  const db = getDb();
  const page = await db.contentPage.findUnique({
    where: { id: pageId },
    select: { id: true, status: true },
  });

  if (!page) {
    throw new ContentError("pageId", "Page not found.");
  }

  if (sectionId) {
    const existing = await db.contentSection.findFirst({
      where: { id: sectionId, pageId },
      select: { id: true },
    });

    if (!existing) {
      throw new ContentError("id", "Section not found on this page.");
    }

    await db.contentSection.update({
      where: { id: sectionId },
      data: input,
    });
  } else {
    const duplicate = await db.contentSection.findUnique({
      where: {
        pageId_sectionKey: { pageId, sectionKey: input.sectionKey },
      },
      select: { id: true },
    });

    if (duplicate) {
      throw new ContentError(
        "sectionKey",
        "This page already has a section with that key.",
      );
    }

    await db.contentSection.create({ data: { pageId, ...input } });
  }

  await recordAdminAudit({
    actor,
    action: sectionId ? "content.section.update" : "content.section.create",
    entityType: "ContentSection",
    entityId: sectionId ?? pageId,
    summary: "Changed a content page section.",
    metadata: { pageId, sectionKey: input.sectionKey },
  });
}

export async function deleteContentSection(
  pageId: string,
  sectionId: string,
  actor: string,
) {
  const deleted = await getDb().contentSection.deleteMany({
    where: { id: sectionId, pageId },
  });

  if (deleted.count === 0) {
    throw new ContentError("id", "Section not found on this page.");
  }

  await recordAdminAudit({
    actor,
    action: "content.section.delete",
    entityType: "ContentSection",
    entityId: sectionId,
    summary: "Removed a content page section.",
    metadata: { pageId },
  });
}

/* ---------------------------------------------------------------- homepage */

export async function listHomeSections() {
  return getDb().homeSection.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export async function updateHomeSection(
  id: string,
  input: {
    eyebrow: string;
    heading: string;
    description: string;
    placeholderTitle: string;
    placeholderNote: string;
    imageSrc: string;
    imageAlt: string;
    ctaLabel: string;
    ctaHref: string;
    sortOrder: string;
    isVisible: boolean;
  },
  actor: string,
) {
  const sortRaw = input.sortOrder.trim();
  const sortOrder = sortRaw === "" ? 0 : Number(sortRaw);

  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 10000) {
    throw new ContentError("sortOrder", "Enter a whole number between 0 and 10000.");
  }

  const ctaLabel = optional(input.ctaLabel, 80);
  const ctaHref = cleanHref(input.ctaHref, "ctaHref");

  if (Boolean(ctaLabel) !== Boolean(ctaHref)) {
    throw new ContentError(
      "ctaHref",
      "A call-to-action needs both a label and a destination, or neither.",
    );
  }

  const updated = await getDb().homeSection.updateMany({
    where: { id },
    data: {
      eyebrow: text(input.eyebrow, "eyebrow", 120),
      heading: text(input.heading, "heading", 200, 2),
      description: text(input.description, "description", 1000),
      placeholderTitle: text(input.placeholderTitle, "placeholderTitle", 200),
      placeholderNote: text(input.placeholderNote, "placeholderNote", 500),
      imageSrc: cleanImageSrc(input.imageSrc),
      imageAlt: optional(input.imageAlt, 250),
      ctaLabel,
      ctaHref: ctaHref || null,
      sortOrder,
      isVisible: Boolean(input.isVisible),
      updatedBy: actor,
    },
  });

  if (updated.count === 0) {
    throw new ContentError("id", "Homepage section not found.");
  }

  await recordAdminAudit({
    actor,
    action: "content.home.update",
    entityType: "HomeSection",
    entityId: id,
    summary: "Updated a homepage section.",
  });
}

/* -------------------------------------------------------------- navigation */

export async function listNavigationItems() {
  return getDb().navigationItem.findMany({
    orderBy: [{ location: "asc" }, { sortOrder: "asc" }, { label: "asc" }],
  });
}

export async function saveNavigationItem(
  id: string | null,
  input: {
    location: string;
    label: string;
    href: string;
    sortOrder: string;
    isVisible: boolean;
  },
  actor: string,
) {
  const location = input.location.trim();

  if (!isNavigationLocation(location)) {
    throw new ContentError("location", "Choose a valid navigation location.");
  }

  const href = cleanHref(input.href, "href");

  if (!href) {
    throw new ContentError("href", "Enter a destination for this link.");
  }

  const sortRaw = input.sortOrder.trim();
  const sortOrder = sortRaw === "" ? 0 : Number(sortRaw);

  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 10000) {
    throw new ContentError("sortOrder", "Enter a whole number between 0 and 10000.");
  }

  const data = {
    location,
    label: text(input.label, "label", 80, 1),
    href,
    sortOrder,
    isVisible: Boolean(input.isVisible),
  };

  if (id) {
    const updated = await getDb().navigationItem.updateMany({
      where: { id },
      data,
    });

    if (updated.count === 0) {
      throw new ContentError("id", "Navigation link not found.");
    }
  } else {
    await getDb().navigationItem.create({ data });
  }

  await recordAdminAudit({
    actor,
    action: id ? "content.navigation.update" : "content.navigation.create",
    entityType: "NavigationItem",
    entityId: id ?? `${location}:${data.href}`,
    summary: "Changed a storefront navigation link.",
    metadata: { location, href },
  });
}

export async function deleteNavigationItem(id: string, actor: string) {
  const item = await getDb().navigationItem.findUnique({
    where: { id },
    select: { id: true, label: true, href: true },
  });

  if (!item) {
    throw new ContentError("id", "Navigation link not found.");
  }

  await getDb().navigationItem.delete({ where: { id } });

  await recordAdminAudit({
    actor,
    action: "content.navigation.delete",
    entityType: "NavigationItem",
    entityId: id,
    summary: `Removed navigation link ${item.label}.`,
    metadata: { href: item.href },
  });
}

/* ----------------------------------------------------------- public reads */

export async function getPublicNavigation(location: NavigationLocation) {
  if (!isDatabaseConfigured()) return [];

  try {
    return await getDb().navigationItem.findMany({
      where: { location, isVisible: true },
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
      select: { label: true, href: true },
    });
  } catch {
    return [];
  }
}

export async function getPublicHomeSections() {
  if (!isDatabaseConfigured()) return [];

  try {
    return await getDb().homeSection.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: "asc" },
      select: {
        key: true,
        eyebrow: true,
        heading: true,
        description: true,
        placeholderTitle: true,
        placeholderNote: true,
        tone: true,
        imageSrc: true,
        imageAlt: true,
        ctaLabel: true,
        ctaHref: true,
      },
    });
  } catch {
    return [];
  }
}

export async function getPublishedContentPage(slug: string) {
  if (!isDatabaseConfigured()) return null;

  try {
    return await getDb().contentPage.findFirst({
      where: { slug, status: "PUBLISHED" },
      select: {
        slug: true,
        title: true,
        intro: true,
        isIndexable: true,
        updatedAt: true,
        publishedAt: true,
        sections: {
          where: { isVisible: true },
          orderBy: [{ sortOrder: "asc" }, { sectionKey: "asc" }],
          select: {
            sectionKey: true,
            heading: true,
            body: true,
            imageSrc: true,
            imageAlt: true,
            ctaLabel: true,
            ctaHref: true,
          },
        },
      },
    });
  } catch {
    return null;
  }
}
