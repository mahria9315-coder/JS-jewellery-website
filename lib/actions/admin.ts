"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { authenticateAdmin, changeOwnPassword } from "@/lib/admin/auth";
import { hashAdminIp } from "@/lib/admin/auth-crypto";
import { recordAdminAudit } from "@/lib/admin/audit";
import { authorizeAdminRequest } from "@/lib/admin/guard";
import {
  MfaError,
  beginMfaEnrollment,
  confirmMfaEnrollment,
  getMfaStatus,
  regenerateRecoveryCodes,
  verifyMfaLogin,
} from "@/lib/admin/mfa";
import {
  clearMfaChallenge,
  clearRecoveryCodesForDisplay,
  createMfaChallenge,
  readMfaChallenge,
  setRecoveryCodesForDisplay,
} from "@/lib/admin/mfa-challenge";
import { isMfaEnforced } from "@/lib/admin/mfa-policy";
import {
  defaultAdminPath,
  type AdminPermission,
} from "@/lib/admin/permissions";
import {
  createAdminSession,
  deleteExpiredAdminSessions,
  destroyCurrentAdminSession,
  revokeOtherAdminSessions,
} from "@/lib/admin/session";
import {
  AdminSetupError,
  claimFirstAdminSetup,
} from "@/lib/admin/setup";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import {
  ProductInputError,
  createProduct,
  parseProductInput,
  updateProduct,
} from "@/lib/admin/products";
import {
  SupplierInputError,
  createSupplier,
  parseAgreementInput,
  parseSupplierInput,
  saveSupplierAgreement,
  updateSupplier,
} from "@/lib/admin/suppliers";
import {
  CourierUpdateError,
  OrderStatusError,
  ProductionStatusError,
  updateOrderCourier,
  updateOrderStatus,
  updateProductionStatus,
} from "@/lib/admin/orders";
import {
  CustomizationConfigError,
  parseCustomizationConfirmationInput,
  saveProductCustomizationConfirmation,
  setProductCustomizationEnabled,
} from "@/lib/admin/customization";
import {
  PaymentActionError,
  rejectPayment,
  verifyPayment,
} from "@/lib/orders/payments";
import {
  ReturnActionError,
  processReturnRefund,
  reviewReturnRequest,
} from "@/lib/admin/returns";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { enforceAdminOperationLimit } from "@/lib/security/admin-rate-limit";
import { isSameOriginAction } from "@/lib/security/action-origin";
import { safeRelativePath } from "@/lib/security/request";

export type AdminLoginState = { message?: string };

function value(formData: FormData, key: string): string {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry : "";
}

function checkbox(formData: FormData, key: string): boolean {
  const entry = formData.get(key);
  return entry === "on" || entry === "true" || entry === "1";
}

function optional(formData: FormData, key: string): string | null {
  const raw = value(formData, key).trim();
  return raw === "" ? null : raw;
}

function redirectWithError(path: string, message: string): never {
  redirect(
    `${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`,
  );
}

async function requireAdminActor(permission: AdminPermission, operation?: string) {
  if (!isDatabaseConfigured()) {
    redirect("/admin/login?status=unconfigured");
  }

  const auth = await authorizeAdminRequest(permission);

  if (!auth.ok) {
    if (auth.status === 403) {
      if (auth.reason === "mfa-required") {
        redirect("/admin/mfa?status=enrollment-required");
      }

      if (auth.reason === "origin") {
        redirect("/admin/login?status=blocked");
      }

      redirect(`/admin/account?denied=${encodeURIComponent(permission)}`);
    }

    redirect("/admin/login?status=required");
  }

  const limit = await enforceAdminOperationLimit({
    userId: auth.context.user.id,
    permission,
    operation,
  });

  if (!limit.allowed) {
    redirect(
      `/admin/account?error=${encodeURIComponent(
        "Too many administrator operations. Please wait and try again.",
      )}`,
    );
  }

  return auth.context.user.email;
}

/**
 * Supplier identity verification is a separate grant. `suppliers.manage` alone
 * must never be able to mark a supplier VERIFIED, even if a crafted form posts
 * that value.
 */
async function requireSupplierVerificationPermission() {
  if (!isDatabaseConfigured()) {
    redirect("/admin/login?status=unconfigured");
  }

  const auth = await authorizeAdminRequest("suppliers.verify");

  if (!auth.ok) {
    if (auth.status === 403) {
      if (auth.reason === "mfa-required") {
        redirect("/admin/mfa?status=enrollment-required");
      }

      if (auth.reason === "origin") {
        redirect("/admin/login?status=blocked");
      }

      redirect("/admin/account?denied=suppliers.verify");
    }

    redirect("/admin/login?status=required");
  }

  const limit = await enforceAdminOperationLimit({
    userId: auth.context.user.id,
    permission: "suppliers.verify",
    operation: "supplier-verification",
  });

  if (!limit.allowed) {
    redirect(
      `/admin/account?error=${encodeURIComponent(
        "Too many supplier verification operations. Please wait and try again.",
      )}`,
    );
  }
}

export async function adminLoginAction(
  _previousState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  if (!isDatabaseConfigured()) {
    return {
      message:
        "Administrator access is unavailable because the database is not configured on this deployment.",
    };
  }

  if (!(await isSameOriginAction())) {
    return {
      message: "Sign-in could not be completed. Reload the page and try again.",
    };
  }

  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip")?.trim() ||
    "unknown";
  const email = value(formData, "email").trim().toLowerCase();

  const ipLimit = await checkRateLimit(`admin-login:ip:${ip}`, 10, 15 * 60 * 1000);
  const accountLimit = await checkRateLimit(
    `admin-login:account:${email || "blank"}`,
    5,
    15 * 60 * 1000,
  );

  if (!ipLimit.allowed || !accountLimit.allowed) {
    return {
      message: "Too many sign-in attempts. Please wait and try again.",
    };
  }

  const result = await authenticateAdmin(email, value(formData, "password"));

  if (!result.ok) {
    return { message: result.message };
  }

  await deleteExpiredAdminSessions();

  const user = await getDb().adminUser.findUnique({
    where: { id: result.userId },
    select: {
      role: { select: { permissions: true } },
      mfaCredential: { select: { confirmedAt: true } },
    },
  });

  const fallback = defaultAdminPath(user?.role.permissions ?? []);
  const next = safeRelativePath(value(formData, "next"), fallback);

  // A password alone must not create a session when an authenticator is
  // enrolled. Issue a five-minute signed challenge instead.
  if (user?.mfaCredential?.confirmedAt) {
    await createMfaChallenge({ userId: result.userId, next });
    redirect("/admin/mfa/verify");
  }

  await createAdminSession(result.userId, {
    ipHash: hashAdminIp(ip),
    userAgent: headerStore.get("user-agent"),
  });

  if (isMfaEnforced()) {
    redirect("/admin/mfa?status=enrollment-required");
  }

  redirect(next);
}

export async function adminLogoutAction() {
  if (!(await isSameOriginAction())) {
    redirect("/admin/login?status=blocked");
  }

  await destroyCurrentAdminSession();
  redirect("/admin/login?status=signed-out");
}

export type AdminPasswordState = { message?: string; ok?: boolean };

export type AdminSetupState = { message?: string };

export async function adminFirstTimeSetupAction(
  _previousState: AdminSetupState,
  formData: FormData,
): Promise<AdminSetupState> {
  if (!isDatabaseConfigured()) {
    return {
      message:
        "Administrator setup is unavailable because the database is not configured on this deployment.",
    };
  }

  if (!(await isSameOriginAction())) {
    return {
      message: "Setup could not be completed. Reload the page and try again.",
    };
  }

  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip")?.trim() ||
    "unknown";
  const ipLimit = await checkRateLimit(
    `admin-setup:ip:${ip}`,
    8,
    15 * 60 * 1000,
  );

  if (!ipLimit.allowed) {
    return {
      message: "Too many setup attempts. Please wait and try again.",
    };
  }

  try {
    const result = await claimFirstAdminSetup({
      email: value(formData, "email"),
      name: value(formData, "name"),
      password: value(formData, "password"),
      confirmPassword: value(formData, "confirmPassword"),
      setupSecret: value(formData, "setupSecret"),
    });

    await deleteExpiredAdminSessions();
    await createAdminSession(result.userId, {
      ipHash: hashAdminIp(ip),
      userAgent: headerStore.get("user-agent"),
    });
  } catch (error) {
    if (error instanceof AdminSetupError) {
      return { message: error.message };
    }

    return {
      message:
        "Administrator setup could not be completed. Check the database and migrations, then try again.",
    };
  }

  redirect(isMfaEnforced() ? "/admin/mfa?setup=complete" : "/admin?setup=complete");
}

export async function adminChangePasswordAction(
  _previousState: AdminPasswordState,
  formData: FormData,
): Promise<AdminPasswordState> {
  const auth = await authorizeAdminRequest(undefined, {
    allowUnenrolled: true,
  });

  if (!auth.ok) {
    return { message: "Your session has expired. Sign in again." };
  }

  const limit = await checkRateLimit(
    `admin-password-change:${auth.context.user.id}`,
    5,
    15 * 60 * 1000,
  );

  if (!limit.allowed) {
    return {
      message: "Too many password changes. Please wait and try again.",
    };
  }

  const result = await changeOwnPassword({
    userId: auth.context.user.id,
    currentPassword: value(formData, "currentPassword"),
    newPassword: value(formData, "newPassword"),
  });

  if (!result.ok) {
    return { message: result.message };
  }

  await revokeOtherAdminSessions(auth.context.user.id);

  return { ok: true, message: "Your password has been updated." };
}

export type AdminMfaState = { message?: string; ok?: boolean };
export type AdminMfaVerifyState = { message?: string };

async function mfaActionAllowed(
  userId: string,
  action: string,
  limit = 10,
): Promise<boolean> {
  const result = await checkRateLimit(
    `admin-mfa:${action}:${userId}`,
    limit,
    15 * 60 * 1000,
  );
  return result.allowed;
}

export async function adminStartMfaEnrollmentAction(_formData: FormData) {
  void _formData;

  const auth = await authorizeAdminRequest(undefined, {
    allowUnenrolled: true,
  });

  if (!auth.ok) {
    redirect("/admin/login?status=required");
  }

  if (!(await mfaActionAllowed(auth.context.user.id, "enroll-start", 10))) {
    redirectWithError(
      "/admin/mfa",
      "Too many MFA setup attempts. Please wait and try again.",
    );
  }

  try {
    await beginMfaEnrollment({
      userId: auth.context.user.id,
      email: auth.context.user.email,
    });
  } catch (error) {
    if (error instanceof MfaError) {
      redirectWithError("/admin/mfa", error.message);
    }

    throw error;
  }

  await recordAdminAudit({
    actor: auth.context.user.email,
    action: "auth.mfa.enroll.start",
    entityType: "AdminUser",
    entityId: auth.context.user.id,
    summary: "Started authenticator enrolment.",
  });

  redirect("/admin/mfa?step=confirm");
}

export async function adminConfirmMfaEnrollmentAction(
  _previousState: AdminMfaState,
  formData: FormData,
): Promise<AdminMfaState> {
  const auth = await authorizeAdminRequest(undefined, {
    allowUnenrolled: true,
  });

  if (!auth.ok) {
    return { message: "Your session has expired. Sign in again." };
  }

  if (!(await mfaActionAllowed(auth.context.user.id, "enroll-confirm", 10))) {
    return {
      message: "Too many confirmation attempts. Please wait and try again.",
    };
  }

  let recoveryCodes: string[];

  try {
    const result = await confirmMfaEnrollment({
      userId: auth.context.user.id,
      code: value(formData, "code"),
    });
    recoveryCodes = result.recoveryCodes;
  } catch (error) {
    if (error instanceof MfaError) {
      return { message: error.message };
    }

    throw error;
  }

  await recordAdminAudit({
    actor: auth.context.user.email,
    action: "auth.mfa.enroll.confirm",
    entityType: "AdminUser",
    entityId: auth.context.user.id,
    summary: "Confirmed authenticator enrolment and generated recovery codes.",
  });

  await setRecoveryCodesForDisplay(recoveryCodes);
  redirect("/admin/mfa/codes");
}

export async function adminRegenerateRecoveryCodesAction(
  _previousState: AdminMfaState,
  formData: FormData,
): Promise<AdminMfaState> {
  const auth = await authorizeAdminRequest();

  if (!auth.ok) {
    return { message: "Your session has expired. Sign in again." };
  }

  if (!(await mfaActionAllowed(auth.context.user.id, "recovery-regenerate", 5))) {
    return {
      message: "Too many recovery-code requests. Please wait and try again.",
    };
  }

  const status = await getMfaStatus(auth.context.user.id);

  if (!status.enrolled) {
    return { message: "Enrol an authenticator before generating recovery codes." };
  }

  let recoveryCodes: string[];

  try {
    const result = await regenerateRecoveryCodes({
      userId: auth.context.user.id,
      code: value(formData, "code"),
    });
    recoveryCodes = result.recoveryCodes;
  } catch (error) {
    if (error instanceof MfaError) {
      return { message: error.message };
    }

    throw error;
  }

  await recordAdminAudit({
    actor: auth.context.user.email,
    action: "auth.mfa.recovery.regenerate",
    entityType: "AdminUser",
    entityId: auth.context.user.id,
    summary: "Replaced all MFA recovery codes.",
  });

  await setRecoveryCodesForDisplay(recoveryCodes);
  redirect("/admin/mfa/codes");
}

export async function adminDismissRecoveryCodesAction() {
  if (!(await isSameOriginAction())) {
    redirect("/admin/login?status=blocked");
  }

  await clearRecoveryCodesForDisplay();
  redirect("/admin");
}

export async function adminMfaVerifyAction(
  _previousState: AdminMfaVerifyState,
  formData: FormData,
): Promise<AdminMfaVerifyState> {
  if (!isDatabaseConfigured()) {
    return {
      message:
        "Administrator access is unavailable because the database is not configured on this deployment.",
    };
  }

  if (!(await isSameOriginAction())) {
    return {
      message: "Verification could not be completed. Reload the page and try again.",
    };
  }

  const challenge = await readMfaChallenge();

  if (!challenge) {
    return {
      message: "Your verification session has expired. Sign in again.",
    };
  }

  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip")?.trim() ||
    "unknown";

  const ipLimit = await checkRateLimit(
    `admin-mfa-verify:ip:${ip}`,
    15,
    15 * 60 * 1000,
  );
  const userLimit = await checkRateLimit(
    `admin-mfa-verify:user:${challenge.userId}`,
    10,
    15 * 60 * 1000,
  );

  if (!ipLimit.allowed || !userLimit.allowed) {
    return {
      message: "Too many verification attempts. Please wait and try again.",
    };
  }

  const user = await getDb().adminUser.findUnique({
    where: { id: challenge.userId },
    select: {
      id: true,
      email: true,
      status: true,
      role: { select: { permissions: true } },
    },
  });

  if (!user || user.status !== "ACTIVE") {
    await clearMfaChallenge();
    return { message: "That administrator account is not available." };
  }

  const result = await verifyMfaLogin({
    userId: user.id,
    code: value(formData, "code"),
  });

  if (!result.ok) {
    return { message: result.message };
  }

  await clearMfaChallenge();
  await deleteExpiredAdminSessions();
  await createAdminSession(user.id, {
    ipHash: hashAdminIp(ip),
    userAgent: headerStore.get("user-agent"),
  });

  await recordAdminAudit({
    actor: user.email,
    action: "auth.mfa.login",
    entityType: "AdminUser",
    entityId: user.id,
    summary:
      result.method === "recovery-code"
        ? "Completed sign-in with a recovery code."
        : "Completed sign-in with an authenticator code.",
  });

  redirect(
    safeRelativePath(challenge.next, defaultAdminPath(user.role.permissions)),
  );
}

export async function createSupplierAction(formData: FormData) {
  const actor = await requireAdminActor("suppliers.manage");

  try {
    const input = parseSupplierInput({
      legalName: value(formData, "legalName"),
      tradingName: optional(formData, "tradingName"),
      contactName: optional(formData, "contactName"),
      contactEmail: optional(formData, "contactEmail"),
      contactPhone: optional(formData, "contactPhone"),
      status: value(formData, "status"),
      verificationStatus: value(formData, "verificationStatus"),
      internalNotes: optional(formData, "internalNotes"),
    });

    if (input.verificationStatus === "VERIFIED") {
      await requireSupplierVerificationPermission();
    }

    const supplier = await createSupplier(input, actor);
    revalidatePath("/admin/suppliers");
    redirect(`/admin/suppliers/${supplier.id}`);
  } catch (error) {
    if (error instanceof SupplierInputError) {
      redirectWithError("/admin/suppliers", error.message);
    }

    throw error;
  }
}

export async function updateSupplierAction(formData: FormData) {
  const actor = await requireAdminActor("suppliers.manage");
  const id = value(formData, "id").trim();

  try {
    const input = parseSupplierInput({
      legalName: value(formData, "legalName"),
      tradingName: optional(formData, "tradingName"),
      contactName: optional(formData, "contactName"),
      contactEmail: optional(formData, "contactEmail"),
      contactPhone: optional(formData, "contactPhone"),
      status: value(formData, "status"),
      verificationStatus: value(formData, "verificationStatus"),
      internalNotes: optional(formData, "internalNotes"),
    });

    if (input.verificationStatus === "VERIFIED") {
      await requireSupplierVerificationPermission();
    }

    await updateSupplier(id, input, actor);
    revalidatePath(`/admin/suppliers/${id}`);
    redirect(`/admin/suppliers/${id}?saved=1`);
  } catch (error) {
    if (error instanceof SupplierInputError) {
      redirectWithError(`/admin/suppliers/${id}`, error.message);
    }

    throw error;
  }
}

export async function saveSupplierAgreementAction(formData: FormData) {
  const actor = await requireAdminActor("suppliers.verify");
  const supplierId = value(formData, "supplierId").trim();

  try {
    const input = parseAgreementInput({
      status: value(formData, "status"),
      supplyAuthorized: checkbox(formData, "supplyAuthorized"),
      imageRightsGranted: checkbox(formData, "imageRightsGranted"),
      documentReference: optional(formData, "documentReference"),
      agreementReceivedAt: optional(formData, "agreementReceivedAt"),
      validFrom: optional(formData, "validFrom"),
      validUntil: optional(formData, "validUntil"),
      notes: optional(formData, "notes"),
    });

    await saveSupplierAgreement(supplierId, input, actor);
    revalidatePath(`/admin/suppliers/${supplierId}`);
    redirect(`/admin/suppliers/${supplierId}?agreement=1`);
  } catch (error) {
    if (error instanceof SupplierInputError) {
      redirectWithError(`/admin/suppliers/${supplierId}`, error.message);
    }

    throw error;
  }
}

function productInputFrom(formData: FormData) {
  return parseProductInput({
    slug: value(formData, "slug"),
    sku: value(formData, "sku"),
    name: value(formData, "name"),
    description: value(formData, "description"),
    category: value(formData, "category"),
    collectionSlugs: formData.getAll("collectionSlugs").map(String),
    sellingPrice: value(formData, "sellingPrice"),
    supplierCost: value(formData, "supplierCost"),
    supplierId: value(formData, "supplierId"),
    supplierSku: optional(formData, "supplierSku"),
    stockQuantity: optional(formData, "stockQuantity"),
    availability: value(formData, "availability"),
    availabilityVerified: checkbox(formData, "availabilityVerified"),
    skuConfirmed: checkbox(formData, "skuConfirmed"),
    priceApproved: checkbox(formData, "priceApproved"),
    contentApproved: checkbox(formData, "contentApproved"),
    imageRightsStatus: value(formData, "imageRightsStatus"),
    imageRightsApproved: checkbox(formData, "imageRightsApproved"),
    publicationStatus: value(formData, "publicationStatus"),
    internalNotes: optional(formData, "internalNotes"),
    categoryId: optional(formData, "categoryId"),
    brandId: optional(formData, "brandId"),
    featured: checkbox(formData, "featured"),
    isArchived: checkbox(formData, "isArchived"),
    seoTitle: optional(formData, "seoTitle"),
    seoDescription: optional(formData, "seoDescription"),
    images: value(formData, "images"),
  });
}

export async function createProductAction(formData: FormData) {
  const actor = await requireAdminActor("products.manage");

  try {
    const product = await createProduct(productInputFrom(formData), actor);
    revalidatePath("/admin/products");
    redirect(`/admin/products/${product.id}`);
  } catch (error) {
    if (error instanceof ProductInputError) {
      redirectWithError("/admin/products/new", error.message);
    }

    throw error;
  }
}

export async function updateProductAction(formData: FormData) {
  const actor = await requireAdminActor("products.manage");
  const id = value(formData, "id").trim();

  try {
    await updateProduct(id, productInputFrom(formData), actor);
    revalidatePath(`/admin/products/${id}`);
    redirect(`/admin/products/${id}?saved=1`);
  } catch (error) {
    if (error instanceof ProductInputError) {
      redirectWithError(`/admin/products/${id}`, error.message);
    }

    throw error;
  }
}

export async function updateProductCustomizationAction(formData: FormData) {
  const actor = await requireAdminActor("products.manage");
  const id = value(formData, "id").trim();
  const enabled = checkbox(formData, "customizationEnabled");

  try {
    await setProductCustomizationEnabled({ productId: id, enabled, actor });
  } catch (error) {
    if (error instanceof CustomizationConfigError) {
      redirectWithError(`/admin/products/${id}`, error.message);
    }

    throw error;
  }

  revalidatePath(`/admin/products/${id}`);
  redirect(`/admin/products/${id}?customization=${enabled ? "enabled" : "disabled"}`);
}

export async function saveCustomizationConfirmationAction(formData: FormData) {
  const actor = await requireAdminActor("suppliers.verify");
  const id = value(formData, "id").trim();

  try {
    const confirmation = parseCustomizationConfirmationInput({
      approvedFonts: formData.getAll("approvedFonts").map(String),
      approvedColours: formData.getAll("approvedColours").map(String),
      evidenceReference: optional(formData, "evidenceReference"),
      notes: optional(formData, "notes"),
    });

    await saveProductCustomizationConfirmation({
      productId: id,
      confirmation,
      actor,
    });
  } catch (error) {
    if (error instanceof CustomizationConfigError) {
      redirectWithError(`/admin/products/${id}`, error.message);
    }

    throw error;
  }

  revalidatePath(`/admin/products/${id}`);
  redirect(`/admin/products/${id}?customization=confirmed`);
}

export async function updateOrderStatusAction(formData: FormData) {
  const actor = await requireAdminActor("orders.manage");
  const orderId = value(formData, "orderId").trim();

  try {
    await updateOrderStatus({
      orderId,
      to: value(formData, "to"),
      note: value(formData, "note"),
      actor,
    });
  } catch (error) {
    if (error instanceof OrderStatusError) {
      redirectWithError(`/admin/orders/${orderId}`, error.message);
    }

    throw error;
  }

  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?order=updated`);
}

export async function updateProductionStatusAction(formData: FormData) {
  const actor = await requireAdminActor("orders.manage");
  const orderId = value(formData, "orderId").trim();

  try {
    await updateProductionStatus({
      orderId,
      to: value(formData, "to"),
      note: value(formData, "note"),
      actor,
    });
  } catch (error) {
    if (error instanceof ProductionStatusError) {
      redirectWithError(`/admin/orders/${orderId}`, error.message);
    }

    throw error;
  }

  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?production=updated`);
}

export async function updateOrderCourierAction(formData: FormData) {
  const actor = await requireAdminActor("orders.manage");
  const orderId = value(formData, "orderId").trim();

  try {
    await updateOrderCourier({
      orderId,
      courierTrackingNumber: value(formData, "courierTrackingNumber"),
      courierFulfilmentStatus: value(formData, "courierFulfilmentStatus"),
      note: value(formData, "note"),
      actor,
    });
  } catch (error) {
    if (error instanceof CourierUpdateError) {
      redirectWithError(`/admin/orders/${orderId}`, error.message);
    }

    throw error;
  }

  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?courier=updated`);
}

export async function verifyPaymentAction(formData: FormData) {
  const actor = await requireAdminActor("payments.verify");
  const orderId = value(formData, "orderId").trim();

  try {
    await verifyPayment({ orderId, actor, note: value(formData, "note") });
  } catch (error) {
    if (error instanceof PaymentActionError) {
      redirectWithError(`/admin/orders/${orderId}`, error.message);
    }

    throw error;
  }

  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?payment=verified`);
}

export async function rejectPaymentAction(formData: FormData) {
  const actor = await requireAdminActor("payments.verify");
  const orderId = value(formData, "orderId").trim();

  try {
    await rejectPayment({ orderId, actor, note: value(formData, "note") });
  } catch (error) {
    if (error instanceof PaymentActionError) {
      redirectWithError(`/admin/orders/${orderId}`, error.message);
    }

    throw error;
  }

  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?payment=rejected`);
}

export async function reviewReturnAction(formData: FormData) {
  const actor = await requireAdminActor("returns.manage");
  const returnId = value(formData, "returnId").trim();
  const decision = value(formData, "decision") === "REJECT" ? "REJECT" : "APPROVE";

  try {
    await reviewReturnRequest({
      returnId,
      actor,
      decision,
      adminNotes: value(formData, "adminNotes"),
    });
  } catch (error) {
    if (error instanceof ReturnActionError) {
      redirectWithError("/admin/returns", error.message);
    }

    throw error;
  }

  revalidatePath("/admin/returns");
  redirect(`/admin/returns?return=${decision.toLowerCase()}`);
}

export async function processRefundAction(formData: FormData) {
  const actor = await requireAdminActor("refunds.process");
  const returnId = value(formData, "returnId").trim();

  try {
    await processReturnRefund({
      returnId,
      actor,
      adminNotes: value(formData, "adminNotes"),
      refundReference: value(formData, "refundReference"),
    });
  } catch (error) {
    if (error instanceof ReturnActionError) {
      redirectWithError("/admin/returns", error.message);
    }

    throw error;
  }

  revalidatePath("/admin/returns");
  redirect("/admin/returns?return=refunded");
}
