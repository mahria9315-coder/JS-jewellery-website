import { collections } from "@/lib/collections";
import { getDb } from "@/lib/db";
import { isSupportedProductImageSource } from "@/lib/product-images";
import {
  getPublicationBlockers,
  type PublicationEvidence,
} from "@/lib/suppliers/publication";

const AVAILABILITY_VALUES = [
  "IN_STOCK",
  "OUT_OF_STOCK",
  "VERIFICATION_PENDING",
] as const;
const PUBLICATION_VALUES = [
  "DRAFT",
  "PENDING_APPROVAL",
  "PUBLISHED",
  "UNPUBLISHED",
] as const;
const IMAGE_RIGHTS_VALUES = [
  "UNKNOWN",
  "PENDING",
  "CONFIRMED",
  "DENIED",
] as const;

export type AvailabilityValue = (typeof AVAILABILITY_VALUES)[number];
export type PublicationValue = (typeof PUBLICATION_VALUES)[number];
export type ImageRightsValue = (typeof IMAGE_RIGHTS_VALUES)[number];

export type ProductImageInput = { src: string; alt: string };

export type ProductInput = {
  slug: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  collectionSlugs: string[];
  sellingPriceMinor: number;
  supplierCostMinor: number;
  supplierId: string;
  supplierSku: string | null;
  stockQuantity: number | null;
  availability: AvailabilityValue;
  availabilityVerified: boolean;
  skuConfirmed: boolean;
  priceApproved: boolean;
  contentApproved: boolean;
  imageRightsStatus: ImageRightsValue;
  imageRightsApproved: boolean;
  publicationStatus: PublicationValue;
  internalNotes: string | null;
  categoryId: string | null;
  brandId: string | null;
  featured: boolean;
  isArchived: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  images: ProductImageInput[];
};

export class ProductInputError extends Error {
  readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = "ProductInputError";
    this.field = field;
  }
}

export function parseMoneyToMinor(
  value: string | null | undefined,
  field: string,
): number {
  const cleaned = (value ?? "").trim().replace(/,/g, "");

  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    throw new ProductInputError(field, "Enter an amount such as 2500 or 2500.50.");
  }

  const amount = Number(cleaned);

  if (!Number.isFinite(amount) || amount <= 0 || amount > 100_000_000) {
    throw new ProductInputError(field, "Enter a valid amount.");
  }

  return Math.round(amount * 100);
}

export function parseNonNegativeMinor(
  value: string | null | undefined,
  field: string,
): number {
  const cleaned = (value ?? "").trim().replace(/,/g, "");

  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    throw new ProductInputError(field, "Enter an amount such as 0 or 1500.50.");
  }

  const amount = Number(cleaned);

  if (!Number.isFinite(amount) || amount < 0 || amount > 100_000_000) {
    throw new ProductInputError(field, "Enter a valid amount.");
  }

  return Math.round(amount * 100);
}

function optional(value: string | null | undefined, max: number, field: string) {
  const trimmed = value?.trim() ?? "";

  if (trimmed === "") {
    return null;
  }

  if (trimmed.length > max) {
    throw new ProductInputError(field, `Must be ${max} characters or fewer.`);
  }

  return trimmed;
}

export function parseProductImages(raw: string): ProductImageInput[] {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line, index) => {
    const [srcRaw, ...altParts] = line.split("|");
    const src = srcRaw?.trim() ?? "";
    const alt = altParts.join("|").trim();

    if (!isSupportedProductImageSource(src)) {
      throw new ProductInputError(
        "images",
        `Image ${index + 1}: use a local path under /images/products/ or an uploaded Vercel Blob product-image URL, with a supported image extension.`,
      );
    }

    if (!alt) {
      throw new ProductInputError(
        "images",
        `Image ${index + 1}: add alternative text after a | character.`,
      );
    }

    return { src, alt };
  });
}

export function parseProductInput(input: {
  slug: string;
  sku: string;
  name: string;
  description: string;
  category?: string | null;
  collectionSlugs: string[];
  sellingPrice: string;
  supplierCost: string;
  supplierId: string;
  supplierSku?: string | null;
  stockQuantity?: string | null;
  availability?: string | null;
  availabilityVerified?: boolean;
  skuConfirmed?: boolean;
  priceApproved?: boolean;
  contentApproved?: boolean;
  imageRightsStatus?: string | null;
  imageRightsApproved?: boolean;
  publicationStatus?: string | null;
  internalNotes?: string | null;
  categoryId?: string | null;
  brandId?: string | null;
  featured?: boolean;
  isArchived?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  images?: string;
}): ProductInput {
  const slug = input.slug.trim().toLowerCase();

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 80) {
    throw new ProductInputError(
      "slug",
      "Use a lowercase URL slug with hyphens, for example gold-ring-01.",
    );
  }

  const sku = input.sku.trim();

  if (sku.length < 1 || sku.length > 64) {
    throw new ProductInputError("sku", "Enter the confirmed SKU (1-64 characters).");
  }

  const name = input.name.trim();

  if (name.length < 2 || name.length > 200) {
    throw new ProductInputError("name", "Enter the product name (2-200 characters).");
  }

  const description = input.description.trim();

  if (description.length < 10 || description.length > 5000) {
    throw new ProductInputError(
      "description",
      "Enter a product description (10-5000 characters).",
    );
  }

  const validCollections = new Set<string>(
    collections.map((collection) => collection.slug),
  );
  const collectionSlugs = [...new Set(input.collectionSlugs.map((slugValue) => slugValue.trim()))];

  if (collectionSlugs.length === 0) {
    throw new ProductInputError("collectionSlugs", "Choose at least one collection.");
  }

  for (const collectionSlug of collectionSlugs) {
    if (!validCollections.has(collectionSlug)) {
      throw new ProductInputError("collectionSlugs", "Choose valid collections.");
    }
  }

  const category = (input.category?.trim() || collectionSlugs[0]).slice(0, 80);

  if (category.length < 2) {
    throw new ProductInputError("category", "Enter a category.");
  }

  const supplierId = input.supplierId.trim();

  if (!supplierId) {
    throw new ProductInputError("supplierId", "Choose the actual supplier.");
  }

  const availability = (input.availability?.trim() || "VERIFICATION_PENDING") as AvailabilityValue;

  if (!(AVAILABILITY_VALUES as readonly string[]).includes(availability)) {
    throw new ProductInputError("availability", "Choose a valid availability status.");
  }

  const imageRightsStatus = (
    input.imageRightsStatus?.trim() || "UNKNOWN"
  ) as ImageRightsValue;

  if (!(IMAGE_RIGHTS_VALUES as readonly string[]).includes(imageRightsStatus)) {
    throw new ProductInputError("imageRightsStatus", "Choose a valid image-rights status.");
  }

  const publicationStatus = (
    input.publicationStatus?.trim() || "DRAFT"
  ) as PublicationValue;

  if (!(PUBLICATION_VALUES as readonly string[]).includes(publicationStatus)) {
    throw new ProductInputError("publicationStatus", "Choose a valid publication status.");
  }

  const stockRaw = input.stockQuantity?.trim() ?? "";
  let stockQuantity: number | null = null;

  if (stockRaw !== "") {
    if (!/^\d{1,7}$/.test(stockRaw)) {
      throw new ProductInputError(
        "stockQuantity",
        "Enter a whole number of units, or leave it blank when the supplier has not provided stock.",
      );
    }

    stockQuantity = Number.parseInt(stockRaw, 10);
  }

  const images = parseProductImages(input.images ?? "");

  return {
    slug,
    sku,
    name,
    description,
    category,
    collectionSlugs,
    sellingPriceMinor: parseMoneyToMinor(input.sellingPrice, "sellingPrice"),
    supplierCostMinor: parseNonNegativeMinor(input.supplierCost, "supplierCost"),
    supplierId,
    supplierSku: optional(input.supplierSku, 80, "supplierSku"),
    stockQuantity,
    availability,
    availabilityVerified: Boolean(input.availabilityVerified),
    skuConfirmed: Boolean(input.skuConfirmed),
    priceApproved: Boolean(input.priceApproved),
    contentApproved: Boolean(input.contentApproved),
    imageRightsStatus,
    imageRightsApproved: Boolean(input.imageRightsApproved),
    publicationStatus,
    internalNotes: optional(input.internalNotes, 2000, "internalNotes"),
    categoryId: optional(input.categoryId, 40, "categoryId"),
    brandId: optional(input.brandId, 40, "brandId"),
    featured: Boolean(input.featured),
    isArchived: Boolean(input.isArchived),
    seoTitle: optional(input.seoTitle, 120, "seoTitle"),
    seoDescription: optional(input.seoDescription, 300, "seoDescription"),
    images,
  };
}

function evidenceFrom(
  input: ProductInput,
  supplier: { status: string; verificationStatus: string },
  agreement:
    | { status: string; supplyAuthorized: boolean; imageRightsGranted: boolean }
    | null
    | undefined,
): PublicationEvidence {
  return {
    slug: input.slug,
    name: input.name,
    supplierStatus: supplier.status,
    supplierVerificationStatus: supplier.verificationStatus,
    agreementStatus: agreement?.status ?? "NOT_RECEIVED",
    supplyAuthorized: agreement?.supplyAuthorized ?? false,
    agreementImageRightsGranted: agreement?.imageRightsGranted ?? false,
    sku: input.sku,
    skuConfirmed: input.skuConfirmed,
    sellingPriceMinor: input.sellingPriceMinor,
    priceApproved: input.priceApproved,
    contentApproved: input.contentApproved,
    imageRightsStatus: input.imageRightsStatus,
    imageRightsApproved: input.imageRightsApproved,
    imageCount: input.images.length,
    availabilityVerifiedAt: input.availabilityVerified ? new Date() : null,
  };
}

async function assertSupplierExists(supplierId: string) {
  const supplier = await getDb().supplier.findUnique({
    where: { id: supplierId },
    select: { status: true, verificationStatus: true },
  });

  if (!supplier) {
    throw new ProductInputError("supplierId", "Supplier not found.");
  }

  const agreement = await getDb().supplierAgreement.findFirst({
    where: { supplierId },
    orderBy: { createdAt: "desc" },
    select: { status: true, supplyAuthorized: true, imageRightsGranted: true },
  });

  return { supplier, agreement };
}

async function assertTaxonomyExists(input: ProductInput) {
  if (input.categoryId) {
    const category = await getDb().category.findUnique({
      where: { id: input.categoryId },
      select: { id: true },
    });

    if (!category) {
      throw new ProductInputError("categoryId", "Category not found.");
    }
  }

  if (input.brandId) {
    const brand = await getDb().brand.findUnique({
      where: { id: input.brandId },
      select: { id: true },
    });

    if (!brand) {
      throw new ProductInputError("brandId", "Brand not found.");
    }
  }
}

export async function getProductPublicationBlockers(input: ProductInput) {
  const { supplier, agreement } = await assertSupplierExists(input.supplierId);
  await assertTaxonomyExists(input);
  return getPublicationBlockers(evidenceFrom(input, supplier, agreement));
}

function imageData(images: ProductImageInput[]) {
  return images.map((image, index) => ({
    src: image.src,
    alt: image.alt,
    sortOrder: index,
  }));
}

export async function createProduct(input: ProductInput, actor: string) {
  const db = getDb();
  const { supplier, agreement } = await assertSupplierExists(input.supplierId);
  await assertTaxonomyExists(input);

  if (input.publicationStatus === "PUBLISHED") {
    const blockers = getPublicationBlockers(
      evidenceFrom(input, supplier, agreement),
    );

    if (blockers.length > 0) {
      throw new ProductInputError(
        "publicationStatus",
        `Cannot publish yet: ${blockers.join(" ")}`,
      );
    }
  }

  const product = await db.product.create({
    data: {
      slug: input.slug,
      sku: input.sku,
      name: input.name,
      description: input.description,
      category: input.category,
      collectionSlugs: input.collectionSlugs,
      sellingPriceMinor: input.sellingPriceMinor,
      supplierCostMinor: input.supplierCostMinor,
      supplierId: input.supplierId,
      supplierSku: input.supplierSku,
      stockQuantity: input.stockQuantity,
      availability: input.availability,
      availabilityVerifiedAt: input.availabilityVerified ? new Date() : null,
      availabilityVerifiedBy: input.availabilityVerified ? actor : null,
      publicationStatus: input.publicationStatus,
      skuConfirmed: input.skuConfirmed,
      priceApproved: input.priceApproved,
      contentApproved: input.contentApproved,
      imageRightsStatus: input.imageRightsStatus,
      imageRightsApproved: input.imageRightsApproved,
      internalNotes: input.internalNotes,
      categoryId: input.categoryId,
      brandId: input.brandId,
      featured: input.featured,
      isArchived: input.isArchived,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      publishedAt:
        input.publicationStatus === "PUBLISHED" ? new Date() : null,
      images: { create: imageData(input.images) },
    },
    select: { id: true, slug: true },
  });

  await db.adminAuditLog.create({
    data: {
      actor,
      action: "product.create",
      entityType: "Product",
      entityId: product.id,
      summary: "Created a supplier-linked product record.",
      metadata: {
        publicationStatus: input.publicationStatus,
        supplierId: input.supplierId,
      },
    },
  });

  return product;
}

export async function setProductPublicationStatus(input: {
  id: string;
  publicationStatus: PublicationValue;
  isArchived: boolean;
  actor: string;
}) {
  const db = getDb();
  const product = await db.product.findUnique({
    where: { id: input.id },
    select: {
      id: true,
      slug: true,
      sku: true,
      sellingPriceMinor: true,
      supplierId: true,
      skuConfirmed: true,
      priceApproved: true,
      contentApproved: true,
      imageRightsStatus: true,
      imageRightsApproved: true,
      availabilityVerifiedAt: true,
      publishedAt: true,
      _count: { select: { images: true } },
    },
  });

  if (!product) {
    throw new ProductInputError("id", "Product not found.");
  }

  if (input.publicationStatus === "PUBLISHED") {
    const { supplier, agreement } = await assertSupplierExists(
      product.supplierId,
    );
    const blockers = getPublicationBlockers({
      supplierStatus: supplier.status,
      supplierVerificationStatus: supplier.verificationStatus,
      agreementStatus: agreement?.status ?? "NOT_RECEIVED",
      supplyAuthorized: agreement?.supplyAuthorized ?? false,
      agreementImageRightsGranted: agreement?.imageRightsGranted ?? false,
      sku: product.sku,
      skuConfirmed: product.skuConfirmed,
      sellingPriceMinor: product.sellingPriceMinor,
      priceApproved: product.priceApproved,
      contentApproved: product.contentApproved,
      imageRightsStatus: product.imageRightsStatus,
      imageRightsApproved: product.imageRightsApproved,
      imageCount: product._count.images,
      availabilityVerifiedAt: product.availabilityVerifiedAt,
    });

    if (blockers.length > 0) {
      throw new ProductInputError(
        "publicationStatus",
        `Cannot publish yet: ${blockers.join(" ")}`,
      );
    }
  }

  await db.product.update({
    where: { id: product.id },
    data: {
      publicationStatus: input.publicationStatus,
      isArchived: input.isArchived,
      publishedAt:
        input.publicationStatus === "PUBLISHED"
          ? (product.publishedAt ?? new Date())
          : null,
    },
  });

  await db.adminAuditLog.create({
    data: {
      actor: input.actor,
      action: "product.publication",
      entityType: "Product",
      entityId: product.id,
      summary: input.isArchived
        ? "Archived a product and removed it from the storefront."
        : `Set product publication to ${input.publicationStatus.toLowerCase()}.`,
      metadata: {
        slug: product.slug,
        publicationStatus: input.publicationStatus,
        isArchived: input.isArchived,
      },
    },
  });
}

export async function updateProduct(
  id: string,
  input: ProductInput,
  actor: string,
) {
  const db = getDb();
  const existing = await db.product.findUnique({
    where: { id },
    select: { id: true, supplierId: true },
  });

  if (!existing) {
    throw new ProductInputError("id", "Product not found.");
  }

  const supplierChanged = existing.supplierId !== input.supplierId;

  const { supplier, agreement } = await assertSupplierExists(input.supplierId);
  await assertTaxonomyExists(input);

  if (input.publicationStatus === "PUBLISHED") {
    const blockers = getPublicationBlockers(
      evidenceFrom(input, supplier, agreement),
    );

    if (blockers.length > 0) {
      throw new ProductInputError(
        "publicationStatus",
        `Cannot publish yet: ${blockers.join(" ")}`,
      );
    }
  }

  await db.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        slug: input.slug,
        sku: input.sku,
        name: input.name,
        description: input.description,
        category: input.category,
        collectionSlugs: input.collectionSlugs,
        sellingPriceMinor: input.sellingPriceMinor,
        supplierCostMinor: input.supplierCostMinor,
        supplierId: input.supplierId,
        supplierSku: input.supplierSku,
        stockQuantity: input.stockQuantity,
        availability: input.availability,
        availabilityVerifiedAt: input.availabilityVerified ? new Date() : null,
        availabilityVerifiedBy: input.availabilityVerified ? actor : null,
        publicationStatus: input.publicationStatus,
        skuConfirmed: input.skuConfirmed,
        priceApproved: input.priceApproved,
        contentApproved: input.contentApproved,
        imageRightsStatus: input.imageRightsStatus,
        imageRightsApproved: input.imageRightsApproved,
        internalNotes: input.internalNotes,
        categoryId: input.categoryId,
        brandId: input.brandId,
        featured: input.featured,
        isArchived: input.isArchived,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        publishedAt:
          input.publicationStatus === "PUBLISHED" ? new Date() : null,
        // A customization confirmation is bound to the assigned supplier. If the
        // supplier changes, the old confirmation no longer applies, so disable
        // customization and remove the stale confirmation.
        ...(supplierChanged ? { customizationEnabled: false } : {}),
      },
    });

    if (supplierChanged) {
      await tx.productCustomizationConfirmation.deleteMany({
        where: { productId: id },
      });
    }

    // Replacing the admin-managed image list is deliberate. Order items keep
    // their own snapshots and are unaffected.
    await tx.productImage.deleteMany({ where: { productId: id } });

    if (input.images.length > 0) {
      await tx.productImage.createMany({
        data: imageData(input.images).map((image) => ({
          productId: id,
          ...image,
        })),
      });
    }
  });

  await db.adminAuditLog.create({
    data: {
      actor,
      action: "product.update",
      entityType: "Product",
      entityId: id,
      summary: "Updated product record, pricing, stock, or publication evidence.",
      metadata: {
        publicationStatus: input.publicationStatus,
        supplierId: input.supplierId,
      },
    },
  });

  return { id };
}

export async function listAdminProducts() {
  return getDb().product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      sku: true,
      slug: true,
      publicationStatus: true,
      availability: true,
      sellingPriceMinor: true,
      supplierCostMinor: true,
      stockQuantity: true,
      featured: true,
      isArchived: true,
      supplier: { select: { legalName: true } },
      createdAt: true,
    },
  });
}

export async function getAdminProductById(id: string) {
  const db = getDb();
  const product = await db.product.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      sku: true,
      name: true,
      description: true,
      category: true,
      collectionSlugs: true,
      sellingPriceMinor: true,
      supplierCostMinor: true,
      supplierId: true,
      supplierSku: true,
      stockQuantity: true,
      availability: true,
      availabilityVerifiedAt: true,
      publicationStatus: true,
      skuConfirmed: true,
      priceApproved: true,
      contentApproved: true,
      imageRightsStatus: true,
      imageRightsApproved: true,
      publishedAt: true,
      internalNotes: true,
      categoryId: true,
      brandId: true,
      featured: true,
      isArchived: true,
      lowStockThreshold: true,
      seoTitle: true,
      seoDescription: true,
      customizationEnabled: true,
      customizationConfirmation: {
        select: {
          supplierId: true,
          approvedFonts: true,
          approvedColours: true,
          evidenceReference: true,
          notes: true,
          confirmedBy: true,
          confirmedAt: true,
        },
      },
      createdAt: true,
      updatedAt: true,
      images: { orderBy: { sortOrder: "asc" } },
      supplier: {
        select: {
          legalName: true,
          status: true,
          verificationStatus: true,
        },
      },
    },
  });

  if (!product) {
    return null;
  }

  const agreement = await db.supplierAgreement.findFirst({
    where: { supplierId: product.supplierId },
    orderBy: { createdAt: "desc" },
    select: { status: true, supplyAuthorized: true, imageRightsGranted: true },
  });

  const blockers = getPublicationBlockers({
    supplierStatus: product.supplier.status,
    supplierVerificationStatus: product.supplier.verificationStatus,
    agreementStatus: agreement?.status ?? "NOT_RECEIVED",
    supplyAuthorized: agreement?.supplyAuthorized ?? false,
    agreementImageRightsGranted: agreement?.imageRightsGranted ?? false,
    sku: product.sku,
    skuConfirmed: product.skuConfirmed,
    sellingPriceMinor: product.sellingPriceMinor,
    priceApproved: product.priceApproved,
    contentApproved: product.contentApproved,
    imageRightsStatus: product.imageRightsStatus,
    imageRightsApproved: product.imageRightsApproved,
    imageCount: product.images.length,
    availabilityVerifiedAt: product.availabilityVerifiedAt,
  });

  return { ...product, blockers };
}

export async function listSupplierOptions() {
  return getDb().supplier.findMany({
    orderBy: { legalName: "asc" },
    select: { id: true, legalName: true, status: true },
  });
}
