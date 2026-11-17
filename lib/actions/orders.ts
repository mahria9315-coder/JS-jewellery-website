"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { checkRateLimit } from "@/lib/security/rate-limit";
import { getOrderAccessTokenByLookup } from "@/lib/orders/queries";
import {
  PaymentActionError,
  submitCustomerPayment,
} from "@/lib/orders/payments";
import {
  ReturnActionError,
  createReturnRequest,
} from "@/lib/admin/returns";

export type OrderFormState = {
  message?: string;
  success?: string;
};

async function clientIp() {
  const headerStore = await headers();
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export async function lookupOrderAction(
  _previousState: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  const orderNumber = String(formData.get("orderNumber") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!orderNumber || !email) {
    return { message: "Enter your order number and the email used at checkout." };
  }

  const limit = await checkRateLimit(`order-lookup:${await clientIp()}`, 8, 10 * 60 * 1000);

  if (!limit.allowed) {
    return {
      message: "Too many lookup attempts. Please wait a few minutes and try again.",
    };
  }

  let token: string | null = null;

  try {
    token = await getOrderAccessTokenByLookup(orderNumber, email);
  } catch {
    return {
      message: "We could not check that order right now. Please try again later.",
    };
  }

  if (!token) {
    return {
      message:
        "No order matched those details. Check the order number and email, or contact us.",
    };
  }

  redirect(
    `/orders/${encodeURIComponent(orderNumber)}?token=${encodeURIComponent(token)}`,
  );
}

export async function submitPaymentAction(
  _previousState: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  const orderNumber = String(formData.get("orderNumber") ?? "").trim();
  const accessToken = String(formData.get("accessToken") ?? "").trim();
  const reference = String(formData.get("reference") ?? "");
  const note = String(formData.get("note") ?? "");

  const limit = await checkRateLimit(
    `payment-submit:${await clientIp()}:${orderNumber}`,
    6,
    10 * 60 * 1000,
  );

  if (!limit.allowed) {
    return {
      message: "Too many payment submissions. Please wait a few minutes and try again.",
    };
  }

  try {
    await submitCustomerPayment({
      orderNumber,
      accessToken,
      reference,
      note,
    });
  } catch (error) {
    if (error instanceof PaymentActionError) {
      return { message: error.message };
    }

    return {
      message: "We could not record that payment information. Please try again.",
    };
  }

  revalidatePath(`/orders/${orderNumber}`);
  redirect(
    `/orders/${encodeURIComponent(orderNumber)}?payment=submitted&token=${encodeURIComponent(
      accessToken,
    )}`,
  );
}

export async function requestReturnAction(
  _previousState: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  const orderNumber = String(formData.get("orderNumber") ?? "").trim();
  const accessToken = String(formData.get("accessToken") ?? "").trim();
  const reason = String(formData.get("reason") ?? "");
  const explanation = String(formData.get("explanation") ?? "");

  const limit = await checkRateLimit(
    `return-request:${await clientIp()}:${orderNumber}`,
    6,
    10 * 60 * 1000,
  );

  if (!limit.allowed) {
    return {
      message: "Too many return requests. Please wait a few minutes and try again.",
    };
  }

  try {
    await createReturnRequest({
      orderNumber,
      accessToken,
      reason,
      explanation,
    });
  } catch (error) {
    if (error instanceof ReturnActionError) {
      return { message: error.message };
    }

    return {
      message: "We could not submit the return request. Please try again.",
    };
  }

  revalidatePath(`/orders/${orderNumber}`);
  redirect(
    `/orders/${encodeURIComponent(orderNumber)}?return=submitted&token=${encodeURIComponent(
      accessToken,
    )}`,
  );
}
