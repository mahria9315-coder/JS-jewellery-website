import { getDb } from "@/lib/db";

const SUPPLIER_STATUSES = [
  "DRAFT",
  "PENDING_VERIFICATION",
  "ACTIVE",
  "SUSPENDED",
  "INACTIVE",
  "ARCHIVED",
] as const;
const VERIFICATION_STATUSES = [
  "UNVERIFIED",
  "PENDING",
  "VERIFIED",
  "REJECTED",
] as const;
const AGREEMENT_STATUSES = [
  "NOT_RECEIVED",
  "RECEIVED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
] as const;

export type SupplierStatusValue = (typeof SUPPLIER_STATUSES)[number];
export type VerificationStatusValue = (typeof VERIFICATION_STATUSES)[number];
export type AgreementStatusValue = (typeof AGREEMENT_STATUSES)[number];

export type SupplierInput = {
  legalName: string;
  tradingName: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  status: SupplierStatusValue;
  verificationStatus: VerificationStatusValue;
  internalNotes: string | null;
};

export type AgreementInput = {
  status: AgreementStatusValue;
  supplyAuthorized: boolean;
  imageRightsGranted: boolean;
  documentReference: string | null;
  agreementReceivedAt: Date | null;
  validFrom: Date | null;
  validUntil: Date | null;
  notes: string | null;
};

export class SupplierInputError extends Error {
  readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = "SupplierInputError";
    this.field = field;
  }
}

function optional(value: string | null | undefined, max: number, field: string) {
  const trimmed = value?.trim() ?? "";

  if (trimmed === "") {
    return null;
  }

  if (trimmed.length > max) {
    throw new SupplierInputError(field, `Must be ${max} characters or fewer.`);
  }

  return trimmed;
}

function parseDate(value: string | null | undefined, field: string) {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new SupplierInputError(field, "Use a valid date (YYYY-MM-DD).");
  }

  const date = new Date(`${trimmed}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new SupplierInputError(field, "Use a valid date (YYYY-MM-DD).");
  }

  return date;
}

export function parseSupplierInput(input: {
  legalName: string;
  tradingName?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  status?: string | null;
  verificationStatus?: string | null;
  internalNotes?: string | null;
}): SupplierInput {
  const legalName = input.legalName.trim();

  if (legalName.length < 2 || legalName.length > 200) {
    throw new SupplierInputError(
      "legalName",
      "Enter the supplier's legal or business name (2-200 characters).",
    );
  }

  const contactEmail = optional(input.contactEmail, 254, "contactEmail");

  if (
    contactEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contactEmail)
  ) {
    throw new SupplierInputError("contactEmail", "Enter a valid email address.");
  }

  const status = (input.status?.trim() || "PENDING_VERIFICATION") as SupplierStatusValue;

  if (!(SUPPLIER_STATUSES as readonly string[]).includes(status)) {
    throw new SupplierInputError("status", "Choose a valid supplier status.");
  }

  const verificationStatus = (
    input.verificationStatus?.trim() || "UNVERIFIED"
  ) as VerificationStatusValue;

  if (!(VERIFICATION_STATUSES as readonly string[]).includes(verificationStatus)) {
    throw new SupplierInputError(
      "verificationStatus",
      "Choose a valid verification status.",
    );
  }

  return {
    legalName,
    tradingName: optional(input.tradingName, 200, "tradingName"),
    contactName: optional(input.contactName, 120, "contactName"),
    contactEmail,
    contactPhone: optional(input.contactPhone, 40, "contactPhone"),
    status,
    verificationStatus,
    internalNotes: optional(input.internalNotes, 2000, "internalNotes"),
  };
}

export function parseAgreementInput(input: {
  status?: string | null;
  supplyAuthorized?: boolean;
  imageRightsGranted?: boolean;
  documentReference?: string | null;
  agreementReceivedAt?: string | null;
  validFrom?: string | null;
  validUntil?: string | null;
  notes?: string | null;
}): AgreementInput {
  const status = (input.status?.trim() || "NOT_RECEIVED") as AgreementStatusValue;

  if (!(AGREEMENT_STATUSES as readonly string[]).includes(status)) {
    throw new SupplierInputError("agreementStatus", "Choose a valid agreement status.");
  }

  return {
    status,
    supplyAuthorized: Boolean(input.supplyAuthorized),
    imageRightsGranted: Boolean(input.imageRightsGranted),
    documentReference: optional(input.documentReference, 200, "documentReference"),
    agreementReceivedAt: parseDate(input.agreementReceivedAt, "agreementReceivedAt"),
    validFrom: parseDate(input.validFrom, "validFrom"),
    validUntil: parseDate(input.validUntil, "validUntil"),
    notes: optional(input.notes, 2000, "agreementNotes"),
  };
}

export async function listSuppliers() {
  return getDb().supplier.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      legalName: true,
      tradingName: true,
      status: true,
      verificationStatus: true,
      createdAt: true,
      _count: { select: { products: true, agreements: true } },
    },
  });
}

export async function getSupplierById(id: string) {
  return getDb().supplier.findUnique({
    where: { id },
    select: {
      id: true,
      legalName: true,
      tradingName: true,
      contactName: true,
      contactEmail: true,
      contactPhone: true,
      status: true,
      verificationStatus: true,
      verifiedAt: true,
      verifiedBy: true,
      internalNotes: true,
      createdAt: true,
      updatedAt: true,
      agreements: { orderBy: { createdAt: "desc" } },
      notes: { orderBy: { createdAt: "desc" }, take: 50 },
      products: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          sku: true,
          publicationStatus: true,
          sellingPriceMinor: true,
          supplierCostMinor: true,
          availability: true,
        },
      },
    },
  });
}

/**
 * A supplier can only be archived when it has no published products. Products
 * must be unpublished deliberately first so archiving cannot silently remove a
 * live storefront listing.
 */
export function supplierArchiveBlocker(
  publishedProductCount: number,
): string | null {
  if (publishedProductCount > 0) {
    return `Unpublish ${publishedProductCount} published product${
      publishedProductCount === 1 ? "" : "s"
    } linked to this supplier before archiving it.`;
  }

  return null;
}

export async function archiveSupplier(id: string, actor: string) {
  const db = getDb();
  const supplier = await db.supplier.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      _count: {
        select: { products: { where: { publicationStatus: "PUBLISHED" } } },
      },
    },
  });

  if (!supplier) {
    throw new SupplierInputError("id", "Supplier not found.");
  }

  const blocker = supplierArchiveBlocker(supplier._count.products);

  if (blocker) {
    throw new SupplierInputError("status", blocker);
  }

  if (supplier.status === "ARCHIVED") {
    return;
  }

  await db.supplier.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  await db.adminAuditLog.create({
    data: {
      actor,
      action: "supplier.archive",
      entityType: "Supplier",
      entityId: id,
      summary: "Archived a supplier record. Linked products were not deleted.",
      metadata: { previousStatus: supplier.status },
    },
  });
}

export async function restoreSupplier(id: string, actor: string) {
  const db = getDb();
  const supplier = await db.supplier.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!supplier) {
    throw new SupplierInputError("id", "Supplier not found.");
  }

  if (supplier.status !== "ARCHIVED") {
    return;
  }

  await db.supplier.update({
    where: { id },
    data: { status: "INACTIVE" },
  });

  await db.adminAuditLog.create({
    data: {
      actor,
      action: "supplier.restore",
      entityType: "Supplier",
      entityId: id,
      summary:
        "Restored an archived supplier to inactive. Reactivate it only after re-verification.",
    },
  });
}

export async function addSupplierNote(input: {
  supplierId: string;
  body: string;
  actor: string;
}) {
  const body = input.body.trim();

  if (body.length < 3 || body.length > 2000) {
    throw new SupplierInputError(
      "body",
      "Enter an internal note of 3-2000 characters.",
    );
  }

  const supplier = await getDb().supplier.findUnique({
    where: { id: input.supplierId },
    select: { id: true },
  });

  if (!supplier) {
    throw new SupplierInputError("supplierId", "Supplier not found.");
  }

  await getDb().supplierNote.create({
    data: { supplierId: supplier.id, body, author: input.actor },
  });

  await getDb().adminAuditLog.create({
    data: {
      actor: input.actor,
      action: "supplier.note.create",
      entityType: "Supplier",
      entityId: supplier.id,
      summary: "Added a private supplier note.",
    },
  });
}

export async function createSupplier(input: SupplierInput, actor: string) {
  const supplier = await getDb().supplier.create({
    data: {
      legalName: input.legalName,
      tradingName: input.tradingName,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      status: input.status,
      verificationStatus: input.verificationStatus,
      internalNotes: input.internalNotes,
    },
    select: { id: true, legalName: true },
  });

  await getDb().adminAuditLog.create({
    data: {
      actor,
      action: "supplier.create",
      entityType: "Supplier",
      entityId: supplier.id,
      summary: `Created supplier record for an internal supplier.`,
    },
  });

  return supplier;
}

export async function updateSupplier(
  id: string,
  input: SupplierInput,
  actor: string,
) {
  const existing = await getDb().supplier.findUnique({
    where: { id },
    select: { verificationStatus: true },
  });

  if (!existing) {
    throw new SupplierInputError("id", "Supplier not found.");
  }

  const verificationChanged =
    existing.verificationStatus !== input.verificationStatus;

  const supplier = await getDb().supplier.update({
    where: { id },
    data: {
      legalName: input.legalName,
      tradingName: input.tradingName,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      status: input.status,
      verificationStatus: input.verificationStatus,
      internalNotes: input.internalNotes,
      ...(verificationChanged
        ? input.verificationStatus === "VERIFIED"
          ? { verifiedAt: new Date(), verifiedBy: actor }
          : { verifiedAt: null, verifiedBy: null }
        : {}),
    },
    select: { id: true },
  });

  await getDb().adminAuditLog.create({
    data: {
      actor,
      action: "supplier.update",
      entityType: "Supplier",
      entityId: id,
      summary: "Updated supplier record.",
      metadata: {
        status: input.status,
        verificationStatus: input.verificationStatus,
      },
    },
  });

  return supplier;
}

export async function saveSupplierAgreement(
  supplierId: string,
  input: AgreementInput,
  actor: string,
) {
  const db = getDb();
  const supplier = await db.supplier.findUnique({
    where: { id: supplierId },
    select: { id: true },
  });

  if (!supplier) {
    throw new SupplierInputError("supplierId", "Supplier not found.");
  }

  const latest = await db.supplierAgreement.findFirst({
    where: { supplierId },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  const data = {
    status: input.status,
    supplyAuthorized: input.supplyAuthorized,
    imageRightsGranted: input.imageRightsGranted,
    documentReference: input.documentReference,
    agreementReceivedAt: input.agreementReceivedAt,
    validFrom: input.validFrom,
    validUntil: input.validUntil,
    notes: input.notes,
    reviewedAt:
      input.status === "APPROVED" || input.status === "REJECTED"
        ? new Date()
        : null,
    reviewedBy:
      input.status === "APPROVED" || input.status === "REJECTED" ? actor : null,
  };

  const agreement = latest
    ? await db.supplierAgreement.update({
        where: { id: latest.id },
        data,
        select: { id: true },
      })
    : await db.supplierAgreement.create({
        data: { supplierId, ...data },
        select: { id: true },
      });

  await db.adminAuditLog.create({
    data: {
      actor,
      action: "supplier.agreement.update",
      entityType: "SupplierAgreement",
      entityId: agreement.id,
      summary: "Updated supplier agreement and image-rights record.",
      metadata: {
        supplierId,
        status: input.status,
        supplyAuthorized: input.supplyAuthorized,
        imageRightsGranted: input.imageRightsGranted,
      },
    },
  });

  return agreement;
}
