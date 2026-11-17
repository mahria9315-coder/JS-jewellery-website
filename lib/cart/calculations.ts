/**
 * Cart quantity and subtotal rules.
 *
 * Cart data arrives from a cookie that the browser can edit, so nothing here
 * trusts it. Quantities are clamped, duplicate lines merge, and unavailable or
 * under-stocked products are reported as errors rather than priced.
 *
 * Dependency-free so it can be unit-tested directly.
 */

import {
  normaliseStoredCustomization,
  validateCustomization,
  DISABLED_CUSTOMIZATION,
  type CustomizationConfig,
  type CustomizationSelection,
} from "../customization/config.ts";

export const MAX_CART_LINES = 20;
export const MAX_QUANTITY_PER_ITEM = 10;

export type CartInputItem = {
  productId: string;
  quantity: number;
  customization?: CustomizationSelection;
};

export type OrderableProduct = {
  productId: string;
  name: string;
  unitPriceMinor: number;
  currency: string;
  available: boolean;
  stockQuantity: number | null;
  unavailableReason?: string;
  /** Public presentation fields; never supplier-private data. */
  slug?: string;
  primaryImage?: { src: string; alt: string } | null;
  /** Public customization capability. Never includes supplier identity. */
  customization?: CustomizationConfig;
};

export type ValidatedCartLine = CartInputItem & {
  name: string;
  unitPriceMinor: number;
  currency: string;
  lineTotalMinor: number;
};

export type CartValidation = {
  lines: ValidatedCartLine[];
  errors: string[];
  subtotalMinor: number;
  hasIssues: boolean;
  itemCount: number;
  currency: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function safeQuantity(value: unknown): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN;

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 0;
  }

  return Math.min(parsed, MAX_QUANTITY_PER_ITEM);
}

/** Parse an untrusted cookie value into a bounded cart item list. */
export function normaliseCartItems(raw: unknown): CartInputItem[] {
  const candidate = Array.isArray(raw)
    ? raw
    : isRecord(raw) && Array.isArray(raw.items)
      ? raw.items
      : [];

  const items: CartInputItem[] = [];
  const seen = new Set<string>();

  for (const entry of candidate) {
    if (items.length >= MAX_CART_LINES) {
      break;
    }

    if (!isRecord(entry)) {
      continue;
    }

    const productId =
      typeof entry.productId === "string" ? entry.productId.trim() : "";
    const quantity = safeQuantity(entry.quantity);
    const customization = normaliseStoredCustomization(entry.customization);

    if (!productId || quantity < 1 || productId.length > 64 || seen.has(productId)) {
      continue;
    }

    seen.add(productId);
    items.push({
      productId,
      quantity,
      ...(customization ? { customization } : {}),
    });
  }

  return items;
}

/** Add a product to a cart, merging an existing line and clamping quantity. */
export function addCartItem(
  items: readonly CartInputItem[],
  productId: string,
  quantity: number,
  customization?: CustomizationSelection,
): CartInputItem[] {
  const safeId = productId.trim();
  const safeQty = safeQuantity(quantity);

  if (!safeId || safeQty < 1) {
    return [...items];
  }

  const existing = items.find((item) => item.productId === safeId);

  if (existing) {
    return items.map((item) => {
      if (item.productId !== safeId) {
        return item;
      }

      const nextCustomization = customization ?? item.customization;

      return {
        productId: safeId,
        quantity: Math.min(
          item.quantity + safeQty,
          MAX_QUANTITY_PER_ITEM,
        ),
        ...(nextCustomization ? { customization: nextCustomization } : {}),
      };
    });
  }

  if (items.length >= MAX_CART_LINES) {
    return [...items];
  }

  return [
    ...items,
    {
      productId: safeId,
      quantity: safeQty,
      ...(customization ? { customization } : {}),
    },
  ];
}

export function updateCartItemQuantity(
  items: readonly CartInputItem[],
  productId: string,
  quantity: number,
): CartInputItem[] {
  const safeQty = safeQuantity(quantity);

  if (safeQty < 1) {
    return items.filter((item) => item.productId !== productId);
  }

  return items.map((item) =>
    item.productId === productId ? { ...item, quantity: safeQty } : item,
  );
}

export function removeCartItem(
  items: readonly CartInputItem[],
  productId: string,
): CartInputItem[] {
  return items.filter((item) => item.productId !== productId);
}

/**
 * Price a cart against current server-side product records. Browser-supplied
 * prices are never accepted: only `unitPriceMinor` from the database is used.
 */
export function validateCart(
  items: readonly CartInputItem[],
  products: ReadonlyMap<string, OrderableProduct>,
): CartValidation {
  const lines: ValidatedCartLine[] = [];
  const errors: string[] = [];
  let subtotalMinor = 0;
  let itemCount = 0;

  for (const item of items) {
    const product = products.get(item.productId);

    if (!product) {
      errors.push(
        "One item in your cart is no longer available and was not included.",
      );
      continue;
    }

    if (!product.available) {
      errors.push(
        product.unavailableReason ??
          `${product.name} is not currently available for ordering.`,
      );
      continue;
    }

    if (!Number.isInteger(product.unitPriceMinor) || product.unitPriceMinor <= 0) {
      errors.push(`${product.name} does not have a valid price right now.`);
      continue;
    }

    const quantity = safeQuantity(item.quantity);

    if (quantity < 1) {
      errors.push(`${product.name} has an invalid quantity.`);
      continue;
    }

    if (
      product.stockQuantity !== null &&
      quantity > product.stockQuantity
    ) {
      errors.push(
        `Only ${product.stockQuantity} of ${product.name} ${
          product.stockQuantity === 1 ? "is" : "are"
        } currently available.`,
      );
      continue;
    }

    let customization = item.customization;

    if (customization) {
      const result = validateCustomization(
        customization,
        product.customization ?? DISABLED_CUSTOMIZATION,
      );

      if (!result.ok) {
        errors.push(`${product.name}: ${result.error}`);
        continue;
      }

      customization = result.value;
    }

    const lineTotalMinor = product.unitPriceMinor * quantity;
    subtotalMinor += lineTotalMinor;
    itemCount += quantity;

    lines.push({
      productId: item.productId,
      quantity,
      name: product.name,
      unitPriceMinor: product.unitPriceMinor,
      currency: product.currency,
      lineTotalMinor,
      ...(customization ? { customization } : {}),
    });
  }

  return {
    lines,
    errors,
    subtotalMinor,
    hasIssues: errors.length > 0,
    itemCount,
    currency: "PKR",
  };
}
