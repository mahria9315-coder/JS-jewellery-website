/**
 * Product customization rules (T015/T016).
 *
 * The owner approved exactly six font options and five colour options. Nothing
 * in this module invents additional options. A product is only customizable
 * when an administrator has both enabled customization on the product and a
 * supplier confirmation exists for that same product and supplier.
 *
 * Dependency-free so it can be unit-tested directly and imported by both server
 * and browser code without pulling in database dependencies.
 */

export const CUSTOMIZATION_FONTS = [
  "Classic",
  "Elegant",
  "Script",
  "Modern",
  "Bold",
  "Handwriting / Calligraphy",
] as const;

export const CUSTOMIZATION_COLOURS = [
  "Gold",
  "Silver",
  "Rose Gold",
  "Platinum",
  "Antique Gold",
] as const;

export type CustomizationFont = (typeof CUSTOMIZATION_FONTS)[number];
export type CustomizationColour = (typeof CUSTOMIZATION_COLOURS)[number];

export const MAX_CUSTOMIZATION_TEXT_LENGTH = 20;

/**
 * Existing customer-facing free-text convention: checkout order notes already
 * use 1000 characters (lib/checkout/validation.ts). We reuse that limit for the
 * optional additional instructions. The owner must confirm if they want a
 * different policy; this is not a silently invented alternative rule.
 */
export const MAX_CUSTOMIZATION_INSTRUCTIONS_LENGTH = 1000;

const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

export type CustomizationSelection = {
  text: string;
  font: CustomizationFont;
  colour: CustomizationColour;
  instructions: string | null;
};

export type CustomizationConfig = {
  enabled: boolean;
  fonts: CustomizationFont[];
  colours: CustomizationColour[];
};

export type CustomizationConfirmationLike =
  | {
      supplierId: string;
      approvedFonts: readonly string[];
      approvedColours: readonly string[];
    }
  | null
  | undefined;

export const DISABLED_CUSTOMIZATION: CustomizationConfig = {
  enabled: false,
  fonts: [],
  colours: [],
};

export function isCustomizationFont(value: string): value is CustomizationFont {
  return (CUSTOMIZATION_FONTS as readonly string[]).includes(value);
}

export function isCustomizationColour(
  value: string,
): value is CustomizationColour {
  return (CUSTOMIZATION_COLOURS as readonly string[]).includes(value);
}

export function approvedFontsOnly(values: readonly string[]): CustomizationFont[] {
  return [...new Set(values.filter(isCustomizationFont))];
}

export function approvedColoursOnly(
  values: readonly string[],
): CustomizationColour[] {
  return [...new Set(values.filter(isCustomizationColour))];
}

/**
 * Resolve the public/effective configuration for a product.
 *
 * A stale confirmation from a different supplier, an empty confirmation, or a
 * product toggle without a confirmation all resolve to disabled. This is what
 * prevents "toggle only" customization from ever being offered.
 */
export function resolveCustomizationConfig(input: {
  productCustomizationEnabled: boolean;
  productSupplierId: string;
  confirmation: CustomizationConfirmationLike;
}): CustomizationConfig {
  if (!input.productCustomizationEnabled) {
    return DISABLED_CUSTOMIZATION;
  }

  const confirmation = input.confirmation;

  if (!confirmation || confirmation.supplierId !== input.productSupplierId) {
    return DISABLED_CUSTOMIZATION;
  }

  const fonts = approvedFontsOnly(confirmation.approvedFonts);
  const colours = approvedColoursOnly(confirmation.approvedColours);

  if (fonts.length === 0 || colours.length === 0) {
    return DISABLED_CUSTOMIZATION;
  }

  return { enabled: true, fonts, colours };
}

export type CustomizationValidationResult =
  | { ok: true; value: CustomizationSelection }
  | { ok: false; field: string; error: string };

function characterCount(value: string): number {
  return Array.from(value).length;
}

/**
 * Validate untrusted customer input against the product's effective config.
 * The browser form is only a convenience; the cart and order paths call this
 * again with server-side configuration.
 */
export function validateCustomization(
  input: unknown,
  config: CustomizationConfig,
): CustomizationValidationResult {
  if (!config.enabled) {
    return {
      ok: false,
      field: "customization",
      error: "Customization is not available for this product.",
    };
  }

  if (typeof input !== "object" || input === null) {
    return {
      ok: false,
      field: "customization",
      error: "Enter the customization details.",
    };
  }

  const raw = input as Record<string, unknown>;
  const text = typeof raw.text === "string" ? raw.text.trim() : "";
  const font = typeof raw.font === "string" ? raw.font.trim() : "";
  const colour = typeof raw.colour === "string" ? raw.colour.trim() : "";
  const instructionsRaw =
    typeof raw.instructions === "string" ? raw.instructions.trim() : "";

  if (text === "") {
    return {
      ok: false,
      field: "text",
      error: "Enter the name or text to be customized.",
    };
  }

  if (
    characterCount(text) > MAX_CUSTOMIZATION_TEXT_LENGTH ||
    CONTROL_CHARACTERS.test(text)
  ) {
    return {
      ok: false,
      field: "text",
      error: `Customization text must be ${MAX_CUSTOMIZATION_TEXT_LENGTH} characters or fewer.`,
    };
  }

  if (!isCustomizationFont(font) || !config.fonts.includes(font)) {
    return {
      ok: false,
      field: "font",
      error: "Choose an approved font option.",
    };
  }

  if (!isCustomizationColour(colour) || !config.colours.includes(colour)) {
    return {
      ok: false,
      field: "colour",
      error: "Choose an approved colour option.",
    };
  }

  if (
    characterCount(instructionsRaw) > MAX_CUSTOMIZATION_INSTRUCTIONS_LENGTH ||
    CONTROL_CHARACTERS.test(instructionsRaw)
  ) {
    return {
      ok: false,
      field: "instructions",
      error: `Additional instructions must be ${MAX_CUSTOMIZATION_INSTRUCTIONS_LENGTH} characters or fewer.`,
    };
  }

  return {
    ok: true,
    value: {
      text,
      font,
      colour,
      instructions: instructionsRaw === "" ? null : instructionsRaw,
    },
  };
}

/** True when the customer supplied any customization field at all. */
export function hasCustomizationInput(input: {
  text?: string;
  font?: string;
  colour?: string;
  instructions?: string;
}): boolean {
  return Boolean(
    (input.text ?? "").trim() ||
      (input.font ?? "").trim() ||
      (input.colour ?? "").trim() ||
      (input.instructions ?? "").trim(),
  );
}

/**
 * Structurally normalise a customization value read from an untrusted cart
 * cookie. Option approval is checked later against live configuration.
 */
export function normaliseStoredCustomization(
  value: unknown,
): CustomizationSelection | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const raw = value as Record<string, unknown>;

  if (
    typeof raw.text !== "string" ||
    typeof raw.font !== "string" ||
    typeof raw.colour !== "string"
  ) {
    return undefined;
  }

  const text = raw.text.trim();
  const font = raw.font.trim();
  const colour = raw.colour.trim();
  const instructions =
    typeof raw.instructions === "string" ? raw.instructions.trim() : "";

  if (
    text === "" ||
    characterCount(text) > MAX_CUSTOMIZATION_TEXT_LENGTH ||
    characterCount(instructions) > MAX_CUSTOMIZATION_INSTRUCTIONS_LENGTH ||
    !isCustomizationFont(font) ||
    !isCustomizationColour(colour)
  ) {
    return undefined;
  }

  return {
    text,
    font,
    colour,
    instructions: instructions === "" ? null : instructions,
  };
}
