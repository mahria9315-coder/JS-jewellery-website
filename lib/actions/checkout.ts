"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { readCartItems, writeCartItems } from "@/lib/cart/server";
import { getAllowedDeliveryCountryCodes } from "@/lib/couriers/public";
import {
  validateCheckout,
  type CheckoutValue,
} from "@/lib/checkout/validation";
import { CHECKOUT_DRAFT_COOKIE } from "@/lib/checkout/draft-cookie";
import { isPaymentMethodConfigured } from "@/lib/payments/methods";
import { OrderError, createOrder } from "@/lib/orders/create";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { signPayload, verifyPayload } from "@/lib/security/signed-payload";

export type CheckoutFormState = {
  errors: Record<string, string>;
  message?: string;
};

function formToObject(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      result[key] = value;
    }
  }

  return result;
}

async function rateLimitOrderCreation() {
  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip")?.trim() ||
    "unknown";

  return checkRateLimit(`checkout:${ip}`, 8, 10 * 60 * 1000);
}

export async function saveCheckoutDraftAction(
  _previousState: CheckoutFormState,
  formData: FormData,
): Promise<CheckoutFormState> {
  const values = formToObject(formData);

  // Country eligibility is re-read from the approved courier configuration,
  // so a destination whose courier was suspended is rejected here rather than
  // at order placement.
  const allowedCountryCodes = await getAllowedDeliveryCountryCodes();

  const result = validateCheckout(values, {
    requirePolicyAcceptance: false,
    allowedCountryCodes,
  });

  if (!result.ok) {
    return { errors: result.errors };
  }

  if (!isPaymentMethodConfigured(result.value.paymentMethod)) {
    return {
      errors: {
        paymentMethod:
          "That payment method is not available yet. Choose another method or contact us.",
      },
    };
  }

  const items = await readCartItems();

  if (items.length === 0) {
    redirect("/cart?error=empty");
  }

  const limit = await rateLimitOrderCreation();

  if (!limit.allowed) {
    return {
      errors: {},
      message: "Too many checkout attempts. Please wait a few minutes and try again.",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(CHECKOUT_DRAFT_COOKIE, signPayload({ checkout: result.value }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 60,
  });

  redirect("/checkout/review");
}

export async function placeOrderAction(
  _previousState: CheckoutFormState,
  formData: FormData,
): Promise<CheckoutFormState> {
  void _previousState;

  const cookieStore = await cookies();
  const draftToken = cookieStore.get(CHECKOUT_DRAFT_COOKIE)?.value;
  const draft = draftToken
    ? verifyPayload<{ checkout: CheckoutValue }>(draftToken)
    : null;

  if (!draft?.checkout) {
    return {
      errors: {},
      message:
        "Your checkout session has expired. Return to checkout and enter your details again.",
    };
  }

  const limit = await rateLimitOrderCreation();

  if (!limit.allowed) {
    return {
      errors: {},
      message: "Too many order attempts. Please wait a few minutes and try again.",
    };
  }

  const acceptedPolicy = formData.get("acceptedPolicy");

  // Re-read the approved delivery countries at placement time: the draft may
  // be up to 30 minutes old, and a courier suspended or reconfigured since
  // then must no longer be bookable.
  const allowedCountryCodes = await getAllowedDeliveryCountryCodes();

  const revalidated = validateCheckout(
    {
      fullName: draft.checkout.fullName,
      email: draft.checkout.email,
      phone: draft.checkout.phone,
      countryCode: draft.checkout.countryCode,
      city: draft.checkout.city,
      addressLine1: draft.checkout.addressLine1,
      addressLine2: draft.checkout.addressLine2 ?? undefined,
      postalCode: draft.checkout.postalCode ?? undefined,
      customerNotes: draft.checkout.customerNotes ?? undefined,
      paymentMethod: draft.checkout.paymentMethod,
      idempotencyKey: draft.checkout.idempotencyKey,
      acceptedPolicy: typeof acceptedPolicy === "string" ? acceptedPolicy : undefined,
    },
    {
      requirePolicyAcceptance: true,
      allowedCountryCodes,
    },
  );

  if (!revalidated.ok) {
    return {
      errors: revalidated.errors,
      message: "Please confirm the returns policy and check your details.",
    };
  }

  const items = await readCartItems();

  if (items.length === 0) {
    return {
      errors: {},
      message: "Your cart is empty. Return to the cart to add an item.",
    };
  }

  let order;

  try {
    const created = await createOrder({
      checkout: revalidated.value,
      cartItems: items,
      paymentMethod: revalidated.value.paymentMethod,
    });
    order = created.order;
  } catch (error) {
    if (error instanceof OrderError) {
      return {
        errors: {},
        message: error.message,
      };
    }

    return {
      errors: {},
      message:
        "We could not create your order. No payment has been requested. Please try again.",
    };
  }

  cookieStore.delete(CHECKOUT_DRAFT_COOKIE);
  await writeCartItems([]);

  redirect(
    `/orders/${encodeURIComponent(order.orderNumber)}?token=${encodeURIComponent(
      order.accessToken,
    )}`,
  );
}
