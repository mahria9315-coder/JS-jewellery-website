import { cookies } from "next/headers";

import {
  normaliseCartItems,
  validateCart,
  type CartInputItem,
  type CartValidation,
} from "./calculations";
import { getOrderableProductMap } from "@/lib/storefront/orderable";

export const CART_COOKIE = "js_cart";
const CART_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type CartLineView = {
  productId: string;
  slug: string;
  name: string;
  quantity: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
  currency: string;
  image: { src: string; alt: string } | null;
  customization?: CartInputItem["customization"];
};

export type CartView = {
  items: CartInputItem[];
  lines: CartLineView[];
  errors: string[];
  subtotalMinor: number;
  itemCount: number;
  isEmpty: boolean;
};

function serialise(items: readonly CartInputItem[]): string {
  return encodeURIComponent(JSON.stringify({ v: 1, items }));
}

export async function readCartItems(): Promise<CartInputItem[]> {
  try {
    const store = await cookies();
    const raw = store.get(CART_COOKIE)?.value;

    if (!raw) {
      return [];
    }

    return normaliseCartItems(JSON.parse(decodeURIComponent(raw)));
  } catch {
    return [];
  }
}

export async function writeCartItems(items: readonly CartInputItem[]) {
  const store = await cookies();

  if (items.length === 0) {
    store.delete(CART_COOKIE);
    return;
  }

  const value = serialise(items);

  // Browsers commonly reject cookies larger than ~4KB. If the cart cannot be
  // stored safely, keep the previous cookie rather than writing a truncated one.
  if (value.length > 3800) {
    return;
  }

  store.set(CART_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CART_MAX_AGE_SECONDS,
  });
}

export async function clearCart() {
  const store = await cookies();
  store.delete(CART_COOKIE);
}

/** Combine the cookie with live server-side product data. */
export async function getCartView(): Promise<CartView> {
  const items = await readCartItems();

  if (items.length === 0) {
    return {
      items,
      lines: [],
      errors: [],
      subtotalMinor: 0,
      itemCount: 0,
      isEmpty: true,
    };
  }

  let validation: CartValidation;
  let products: Awaited<ReturnType<typeof getOrderableProductMap>>;

  try {
    products = await getOrderableProductMap(
      items.map((item) => item.productId),
    );
    validation = validateCart(items, products);
  } catch {
    return {
      items,
      lines: [],
      errors: [
        "We could not verify current prices and availability. Please try again in a moment.",
      ],
      subtotalMinor: 0,
      itemCount: 0,
      isEmpty: false,
    };
  }

  const lines: CartLineView[] = [];

  for (const line of validation.lines) {
    // The validated line already carries the server price. Presentation fields
    // are re-read from the public orderable map, not from the browser.
    const product = products.get(line.productId);

    lines.push({
      productId: line.productId,
      slug: product?.slug ?? "",
      name: line.name,
      quantity: line.quantity,
      unitPriceMinor: line.unitPriceMinor,
      lineTotalMinor: line.lineTotalMinor,
      currency: line.currency,
      image: product?.primaryImage ?? null,
      ...(line.customization ? { customization: line.customization } : {}),
    });
  }

  return {
    items,
    lines,
    errors: validation.errors,
    subtotalMinor: validation.subtotalMinor,
    itemCount: validation.itemCount,
    isEmpty: validation.lines.length === 0,
  };
}
