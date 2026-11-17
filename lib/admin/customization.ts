import {
  approvedColoursOnly,
  approvedFontsOnly,
  isCustomizationColour,
  isCustomizationFont,
  resolveCustomizationConfig,
  type CustomizationConfirmationLike,
} from "@/lib/customization/config";
import { getDb } from "@/lib/db";

/**
 * T015 admin workflow: record a real supplier's per-product customization
 * capability and enable customization only when that confirmation is valid.
 *
 * No confirmation is created automatically and no supplier or product is
 * invented here. Both operations are audited.
 */

const MAX_EVIDENCE_REFERENCE_LENGTH = 200;
const MAX_NOTES_LENGTH = 2000;

export type CustomizationConfirmationInput = {
  approvedFonts: string[];
  approvedColours: string[];
  evidenceReference: string | null;
  notes: string | null;
};

export class CustomizationConfigError extends Error {
  readonly code: "NOT_FOUND" | "INVALID_INPUT" | "NOT_CONFIRMED";
  readonly field: string;

  constructor(
    code: CustomizationConfigError["code"],
    field: string,
    message: string,
  ) {
    super(message);
    this.name = "CustomizationConfigError";
    this.code = code;
    this.field = field;
  }
}

function optional(value: string | null | undefined, max: number, field: string) {
  const trimmed = value?.trim() ?? "";

  if (trimmed === "") {
    return null;
  }

  if (trimmed.length > max) {
    throw new CustomizationConfigError(
      "INVALID_INPUT",
      field,
      `Must be ${max} characters or fewer.`,
    );
  }

  return trimmed;
}

export function parseCustomizationConfirmationInput(input: {
  approvedFonts: readonly string[];
  approvedColours: readonly string[];
  evidenceReference?: string | null;
  notes?: string | null;
}): CustomizationConfirmationInput {
  const rawFonts = input.approvedFonts.map((value) => value.trim()).filter(Boolean);
  const rawColours = input.approvedColours
    .map((value) => value.trim())
    .filter(Boolean);

  for (const font of rawFonts) {
    if (!isCustomizationFont(font)) {
      throw new CustomizationConfigError(
        "INVALID_INPUT",
        "approvedFonts",
        "Only the approved font options can be confirmed.",
      );
    }
  }

  for (const colour of rawColours) {
    if (!isCustomizationColour(colour)) {
      throw new CustomizationConfigError(
        "INVALID_INPUT",
        "approvedColours",
        "Only the approved colour options can be confirmed.",
      );
    }
  }

  const approvedFonts = approvedFontsOnly(rawFonts);
  const approvedColours = approvedColoursOnly(rawColours);

  if (approvedFonts.length === 0) {
    throw new CustomizationConfigError(
      "INVALID_INPUT",
      "approvedFonts",
      "Confirm at least one approved font the supplier can fulfil.",
    );
  }

  if (approvedColours.length === 0) {
    throw new CustomizationConfigError(
      "INVALID_INPUT",
      "approvedColours",
      "Confirm at least one approved colour the supplier can fulfil.",
    );
  }

  return {
    approvedFonts,
    approvedColours,
    evidenceReference: optional(
      input.evidenceReference,
      MAX_EVIDENCE_REFERENCE_LENGTH,
      "evidenceReference",
    ),
    notes: optional(input.notes, MAX_NOTES_LENGTH, "notes"),
  };
}

export async function saveProductCustomizationConfirmation(input: {
  productId: string;
  confirmation: CustomizationConfirmationInput;
  actor: string;
}) {
  const db = getDb();
  const product = await db.product.findUnique({
    where: { id: input.productId },
    select: { id: true, name: true, supplierId: true },
  });

  if (!product) {
    throw new CustomizationConfigError("NOT_FOUND", "productId", "Product not found.");
  }

  const data = {
    supplierId: product.supplierId,
    approvedFonts: input.confirmation.approvedFonts,
    approvedColours: input.confirmation.approvedColours,
    evidenceReference: input.confirmation.evidenceReference,
    notes: input.confirmation.notes,
    confirmedBy: input.actor,
    confirmedAt: new Date(),
  };

  const confirmation = await db.productCustomizationConfirmation.upsert({
    where: { productId: product.id },
    update: data,
    create: { productId: product.id, ...data },
    select: { id: true },
  });

  await db.adminAuditLog.create({
    data: {
      actor: input.actor,
      action: "product.customization.confirm",
      entityType: "Product",
      entityId: product.id,
      summary: "Recorded supplier customization capability for a product.",
      metadata: {
        supplierId: product.supplierId,
        approvedFonts: data.approvedFonts,
        approvedColours: data.approvedColours,
      },
    },
  });

  return confirmation;
}

export async function setProductCustomizationEnabled(input: {
  productId: string;
  enabled: boolean;
  actor: string;
}) {
  const db = getDb();
  const product = await db.product.findUnique({
    where: { id: input.productId },
    select: {
      id: true,
      name: true,
      supplierId: true,
      customizationEnabled: true,
      customizationConfirmation: {
        select: {
          supplierId: true,
          approvedFonts: true,
          approvedColours: true,
        },
      },
    },
  });

  if (!product) {
    throw new CustomizationConfigError("NOT_FOUND", "productId", "Product not found.");
  }

  if (input.enabled) {
    const config = resolveCustomizationConfig({
      productCustomizationEnabled: true,
      productSupplierId: product.supplierId,
      confirmation: product.customizationConfirmation as
        | CustomizationConfirmationLike
        | null,
    });

    if (!config.enabled) {
      throw new CustomizationConfigError(
        "NOT_CONFIRMED",
        "customizationEnabled",
        "Customization cannot be enabled until the assigned supplier has confirmed the supported fonts and colours for this product.",
      );
    }
  }

  await db.product.update({
    where: { id: product.id },
    data: { customizationEnabled: input.enabled },
  });

  await db.adminAuditLog.create({
    data: {
      actor: input.actor,
      action: "product.customization.toggle",
      entityType: "Product",
      entityId: product.id,
      summary: input.enabled
        ? "Enabled product customization after supplier confirmation."
        : "Disabled product customization.",
      metadata: { enabled: input.enabled, supplierId: product.supplierId },
    },
  });
}
