"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  addCartItem,
  removeCartItem,
  updateCartItemQuantity,
  MAX_QUANTITY_PER_ITEM,
} from "@/lib/cart/calculations";
import { readCartItems, writeCartItems } from "@/lib/cart/server";
import {
  hasCustomizationInput,
  validateCustomization,
  DISABLED_CUSTOMIZATION,
  type CustomizationSelection,
} from "@/lib/customization/config";
import { safeRelativePath } from "@/lib/security/request";
import { getOrderableProductRecords } from "@/lib/storefront/orderable";

function parseQuantity(value: FormDataEntryValue | null): number {
  const parsed =
    typeof value === "string" ? Number.parseInt(value, 10) : Number.NaN;

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return Math.min(parsed, MAX_QUANTITY_PER_ITEM);
}

export async function addToCartAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "").trim();
  const quantity = parseQuantity(formData.get("quantity"));
  const returnTo = safeRelativePath(
    String(formData.get("returnTo") ?? ""),
    "/cart",
  );
  const customizationInput = {
    text: String(formData.get("customizationText") ?? ""),
    font: String(formData.get("customizationFont") ?? ""),
    colour: String(formData.get("customizationColour") ?? ""),
    instructions: String(formData.get("customizationInstructions") ?? ""),
  };

  if (!productId) {
    redirect("/cart?error=invalid");
  }

  const records = await getOrderableProductRecords([productId]);
  const product = records.get(productId);

  if (!product || !product.orderable) {
    redirect(
      `${returnTo}${returnTo.includes("?") ? "&" : "?"}cartError=unavailable`,
    );
  }

  let customization: CustomizationSelection | undefined;

  if (hasCustomizationInput(customizationInput)) {
    const result = validateCustomization(
      customizationInput,
      product.customization ?? DISABLED_CUSTOMIZATION,
    );

    if (!result.ok) {
      redirect(
        `${returnTo}${returnTo.includes("?") ? "&" : "?"}cartError=invalid-customization`,
      );
    }

    customization = result.value;
  }

  const items = await readCartItems();
  const next = addCartItem(items, productId, quantity, customization);

  await writeCartItems(next);
  revalidatePath("/cart");
  revalidatePath(returnTo.split("?")[0]);

  redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}cart=added`);
}

export async function updateCartQuantityAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "").trim();
  const quantity = parseQuantity(formData.get("quantity"));

  if (!productId) {
    redirect("/cart?error=invalid");
  }

  const items = await readCartItems();
  await writeCartItems(updateCartItemQuantity(items, productId, quantity));
  revalidatePath("/cart");

  redirect("/cart?cart=updated");
}

export async function removeFromCartAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "").trim();

  if (!productId) {
    redirect("/cart?error=invalid");
  }

  const items = await readCartItems();
  await writeCartItems(removeCartItem(items, productId));
  revalidatePath("/cart");

  redirect("/cart?cart=removed");
}
