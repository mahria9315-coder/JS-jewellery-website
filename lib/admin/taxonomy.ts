import { getDb } from "@/lib/db";

import { recordAdminAudit } from "./audit";

/**
 * Category and brand management. Slugs are validated on the server and must be
 * unique. Publishing is explicit; the public catalogue only reads published
 * records, so drafts never leak to customers.
 */

export class TaxonomyError extends Error {
  readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = "TaxonomyError";
    this.field = field;
  }
}

function cleanSlug(value: string): string {
  const slug = value.trim().toLowerCase();

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 80) {
    throw new TaxonomyError(
      "slug",
      "Use a lowercase URL slug with hyphens, for example gold-rings.",
    );
  }

  return slug;
}

function cleanName(value: string): string {
  const name = value.trim();

  if (name.length < 2 || name.length > 120) {
    throw new TaxonomyError("name", "Enter a name of 2-120 characters.");
  }

  return name;
}

function cleanText(value: string, field: string, max: number): string {
  const text = value.trim();

  if (text.length > max) {
    throw new TaxonomyError(field, `Use ${max} characters or fewer.`);
  }

  return text;
}

function optionalText(value: string, max: number): string | null {
  const text = value.trim();
  return text === "" ? null : text.slice(0, max);
}

export type TaxonomyInput = {
  slug: string;
  name: string;
  description: string;
  imageSrc?: string | null;
  imageAlt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  isPublished: boolean;
  featured?: boolean;
};

export function parseTaxonomyInput(input: {
  slug: string;
  name: string;
  description?: string;
  imageSrc?: string | null;
  imageAlt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  isPublished?: boolean;
  featured?: boolean;
}): TaxonomyInput {
  const imageSrc = optionalText(input.imageSrc ?? "", 500);

  if (imageSrc && !/^\/[A-Za-z0-9._\-/]+$/.test(imageSrc)) {
    throw new TaxonomyError(
      "imageSrc",
      "Use a local image path starting with /, for example /images/homepage-shopping-background.png.",
    );
  }

  return {
    slug: cleanSlug(input.slug),
    name: cleanName(input.name),
    description: cleanText(input.description ?? "", "description", 3000),
    imageSrc,
    imageAlt: optionalText(input.imageAlt ?? "", 200),
    seoTitle: optionalText(input.seoTitle ?? "", 120),
    seoDescription: optionalText(input.seoDescription ?? "", 300),
    isPublished: Boolean(input.isPublished),
    featured: Boolean(input.featured),
  };
}

export async function listCategoriesForAdmin() {
  return getDb().category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      imageSrc: true,
      imageAlt: true,
      sortOrder: true,
      isPublished: true,
      featured: true,
      seoTitle: true,
      seoDescription: true,
      updatedAt: true,
      _count: { select: { products: true } },
    },
  });
}

export async function getCategoryForAdmin(id: string) {
  return getDb().category.findUnique({ where: { id } });
}

export async function createCategory(input: TaxonomyInput, actor: string) {
  const db = getDb();
  const existing = await db.category.findUnique({
    where: { slug: input.slug },
    select: { id: true },
  });

  if (existing) {
    throw new TaxonomyError("slug", "A category with this slug already exists.");
  }

  const max = await db.category.aggregate({ _max: { sortOrder: true } });
  const category = await db.category.create({
    data: {
      ...input,
      sortOrder: (max._max.sortOrder ?? 0) + 10,
    },
    select: { id: true, slug: true },
  });

  await recordAdminAudit({
    actor,
    action: "category.create",
    entityType: "Category",
    entityId: category.id,
    summary: "Created a category.",
    metadata: { slug: category.slug, published: input.isPublished },
  });

  return category;
}

export async function updateCategory(
  id: string,
  input: TaxonomyInput,
  actor: string,
) {
  const db = getDb();
  const current = await db.category.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });

  if (!current) {
    throw new TaxonomyError("id", "Category not found.");
  }

  const duplicate = await db.category.findFirst({
    where: { slug: input.slug, id: { not: id } },
    select: { id: true },
  });

  if (duplicate) {
    throw new TaxonomyError("slug", "A category with this slug already exists.");
  }

  await db.category.update({ where: { id }, data: input });

  await recordAdminAudit({
    actor,
    action: "category.update",
    entityType: "Category",
    entityId: id,
    summary: "Updated a category.",
    metadata: { slug: input.slug, published: input.isPublished },
  });
}

export async function deleteCategory(id: string, actor: string) {
  const db = getDb();
  const category = await db.category.findUnique({
    where: { id },
    select: { id: true, name: true, _count: { select: { products: true } } },
  });

  if (!category) {
    throw new TaxonomyError("id", "Category not found.");
  }

  if (category._count.products > 0) {
    throw new TaxonomyError(
      "id",
      "This category is linked to products. Unpublish it instead of deleting it.",
    );
  }

  await db.category.delete({ where: { id } });

  await recordAdminAudit({
    actor,
    action: "category.delete",
    entityType: "Category",
    entityId: id,
    summary: `Deleted unused category ${category.name}.`,
  });
}

export async function listBrandsForAdmin() {
  return getDb().brand.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      logoSrc: true,
      logoAlt: true,
      isPublished: true,
      seoTitle: true,
      seoDescription: true,
      updatedAt: true,
      _count: { select: { products: true } },
    },
  });
}

export async function getBrandForAdmin(id: string) {
  return getDb().brand.findUnique({ where: { id } });
}

export async function createBrand(input: TaxonomyInput, actor: string) {
  const db = getDb();
  const existing = await db.brand.findUnique({
    where: { slug: input.slug },
    select: { id: true },
  });

  if (existing) {
    throw new TaxonomyError("slug", "A brand with this slug already exists.");
  }

  const brand = await db.brand.create({
    data: {
      slug: input.slug,
      name: input.name,
      description: input.description,
      logoSrc: input.imageSrc,
      logoAlt: input.imageAlt,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      isPublished: input.isPublished,
    },
    select: { id: true, slug: true },
  });

  await recordAdminAudit({
    actor,
    action: "brand.create",
    entityType: "Brand",
    entityId: brand.id,
    summary: "Created a brand.",
    metadata: { slug: brand.slug, published: input.isPublished },
  });

  return brand;
}

export async function updateBrand(
  id: string,
  input: TaxonomyInput,
  actor: string,
) {
  const db = getDb();
  const current = await db.brand.findUnique({ where: { id }, select: { id: true } });

  if (!current) {
    throw new TaxonomyError("id", "Brand not found.");
  }

  const duplicate = await db.brand.findFirst({
    where: { slug: input.slug, id: { not: id } },
    select: { id: true },
  });

  if (duplicate) {
    throw new TaxonomyError("slug", "A brand with this slug already exists.");
  }

  await db.brand.update({
    where: { id },
    data: {
      slug: input.slug,
      name: input.name,
      description: input.description,
      logoSrc: input.imageSrc,
      logoAlt: input.imageAlt,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      isPublished: input.isPublished,
    },
  });

  await recordAdminAudit({
    actor,
    action: "brand.update",
    entityType: "Brand",
    entityId: id,
    summary: "Updated a brand.",
    metadata: { slug: input.slug, published: input.isPublished },
  });
}

export async function deleteBrand(id: string, actor: string) {
  const db = getDb();
  const brand = await db.brand.findUnique({
    where: { id },
    select: { id: true, name: true, _count: { select: { products: true } } },
  });

  if (!brand) {
    throw new TaxonomyError("id", "Brand not found.");
  }

  if (brand._count.products > 0) {
    throw new TaxonomyError(
      "id",
      "This brand is linked to products. Unpublish it instead of deleting it.",
    );
  }

  await db.brand.delete({ where: { id } });

  await recordAdminAudit({
    actor,
    action: "brand.delete",
    entityType: "Brand",
    entityId: id,
    summary: `Deleted unused brand ${brand.name}.`,
  });
}
