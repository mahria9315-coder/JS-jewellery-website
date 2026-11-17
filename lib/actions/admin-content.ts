"use server";

import { revalidatePath } from "next/cache";

import {
  ContentError,
  createContentPage,
  deleteContentPage,
  deleteContentSection,
  deleteNavigationItem,
  parsePageInput,
  parseSectionInput,
  saveContentSection,
  saveNavigationItem,
  updateContentPage,
  updateHomeSection,
} from "@/lib/admin/content";
import {
  CustomerError,
  addCustomerNote,
  updateCustomer,
} from "@/lib/admin/customers";
import {
  InventoryError,
  adjustInventory,
  updateLowStockThreshold,
} from "@/lib/admin/inventory";
import {
  MediaError,
  createMediaAsset,
  deleteMediaAsset,
  updateMediaAsset,
} from "@/lib/admin/media";
import { OrderStatusError, saveOrderInternalNote, updateOrderStatus } from "@/lib/admin/orders";
import {
  ProductImageUploadError,
  deleteProductImage,
  saveProductImage,
} from "@/lib/admin/product-images";
import {
  ProductInputError,
  setProductPublicationStatus,
} from "@/lib/admin/products";
import { SeoError, deleteSeoMetadata, saveSeoMetadata } from "@/lib/admin/seo";
import {
  SettingsError,
  createCourier,
  updateBusinessSettings,
  updateCourierAccount,
  updateCourierDestination,
  updateCourierJewelleryAcceptance,
  updateCourierStatus,
  updatePakistanShippingZone,
  updatePaymentSetting,
  updateShippingSetting,
} from "@/lib/admin/settings";
import {
  SupplierInputError,
  addSupplierNote,
  archiveSupplier,
  restoreSupplier,
} from "@/lib/admin/suppliers";
import {
  TaxonomyError,
  createBrand,
  createCategory,
  deleteBrand,
  deleteCategory,
  parseTaxonomyInput,
  updateBrand,
  updateCategory,
} from "@/lib/admin/taxonomy";
import {
  AdminUserError,
  createAdminUser,
  resetAdminUserPassword,
  unlockAdminUser,
  updateAdminUser,
  updateRolePermissions,
} from "@/lib/admin/users";
import { resetMfaForUser } from "@/lib/admin/mfa";
import { recordAdminAudit } from "@/lib/admin/audit";
import {
  formCheckbox,
  formValue,
  redirectWithError,
  redirectWithNotice,
  requireAdminActor,
  requireSuperAdminActor,
} from "./admin-guard";

/* ----------------------------------------------------------------- products */

export async function productPublicationAction(formData: FormData) {
  const actor = await requireAdminActor("products.publish");
  const id = formValue(formData, "id");
  const publicationStatus = formValue(formData, "publicationStatus");
  const allowed = ["DRAFT", "PENDING_APPROVAL", "PUBLISHED", "UNPUBLISHED"];

  if (!allowed.includes(publicationStatus)) {
    redirectWithError(`/admin/products/${id}`, "Choose a valid publication status.");
  }

  try {
    await setProductPublicationStatus({
      id,
      publicationStatus: publicationStatus as
        | "DRAFT"
        | "PENDING_APPROVAL"
        | "PUBLISHED"
        | "UNPUBLISHED",
      isArchived: formCheckbox(formData, "isArchived"),
      actor: actor.email,
    });
  } catch (error) {
    if (error instanceof ProductInputError) {
      redirectWithError(`/admin/products/${id}`, error.message);
    }
    throw error;
  }

  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/admin/products");
  revalidatePath("/");
  redirectWithNotice(`/admin/products/${id}`, "Publication status updated.");
}

export async function uploadProductImageAction(formData: FormData) {
  const actor = await requireAdminActor("products.manage");
  const productId = formValue(formData, "productId");
  const file = formData.get("image");

  if (!(file instanceof File) || file.size === 0) {
    redirectWithError(`/admin/products/${productId}`, "Choose an image file to upload.");
  }

  try {
    await saveProductImage(
      {
        productId,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        bytes: new Uint8Array(await file.arrayBuffer()),
        alt: formValue(formData, "alt"),
      },
      actor.email,
    );
  } catch (error) {
    if (error instanceof ProductImageUploadError) {
      redirectWithError(`/admin/products/${productId}`, error.message);
    }
    throw error;
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/products");
  revalidatePath("/admin/media");
  revalidatePath("/");
  redirectWithNotice(
    `/admin/products/${productId}`,
    "Image uploaded and added to the product.",
  );
}

export async function deleteProductImageAction(formData: FormData) {
  const actor = await requireAdminActor("products.manage");
  const productId = formValue(formData, "productId");

  try {
    await deleteProductImage(
      { productId, imageId: formValue(formData, "imageId") },
      actor.email,
    );
  } catch (error) {
    if (error instanceof ProductImageUploadError) {
      redirectWithError(`/admin/products/${productId}`, error.message);
    }
    throw error;
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/products");
  revalidatePath("/admin/media");
  revalidatePath("/");
  redirectWithNotice(`/admin/products/${productId}`, "Product image removed.");
}

/* -------------------------------------------------------------- categories */

function taxonomyInputFrom(formData: FormData) {
  return parseTaxonomyInput({
    slug: formValue(formData, "slug"),
    name: formValue(formData, "name"),
    description: formValue(formData, "description"),
    imageSrc: formValue(formData, "imageSrc"),
    imageAlt: formValue(formData, "imageAlt"),
    seoTitle: formValue(formData, "seoTitle"),
    seoDescription: formValue(formData, "seoDescription"),
    isPublished: formCheckbox(formData, "isPublished"),
    featured: formCheckbox(formData, "featured"),
  });
}

export async function createCategoryAction(formData: FormData) {
  const actor = await requireAdminActor("categories.manage");

  try {
    await createCategory(taxonomyInputFrom(formData), actor.email);
  } catch (error) {
    if (error instanceof TaxonomyError) {
      redirectWithError("/admin/categories", error.message);
    }
    throw error;
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
  redirectWithNotice("/admin/categories", "Category created.");
}

export async function updateCategoryAction(formData: FormData) {
  const actor = await requireAdminActor("categories.manage");
  const id = formValue(formData, "id");

  try {
    await updateCategory(id, taxonomyInputFrom(formData), actor.email);
  } catch (error) {
    if (error instanceof TaxonomyError) {
      redirectWithError(`/admin/categories/${id}`, error.message);
    }
    throw error;
  }

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${id}`);
  revalidatePath("/");
  redirectWithNotice(`/admin/categories/${id}`, "Category saved.");
}

export async function deleteCategoryAction(formData: FormData) {
  const actor = await requireAdminActor("categories.manage");
  const id = formValue(formData, "id");

  try {
    await deleteCategory(id, actor.email);
  } catch (error) {
    if (error instanceof TaxonomyError) {
      redirectWithError("/admin/categories", error.message);
    }
    throw error;
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
  redirectWithNotice("/admin/categories", "Unused category deleted.");
}

/* ------------------------------------------------------------------ brands */

export async function createBrandAction(formData: FormData) {
  const actor = await requireAdminActor("categories.manage");

  try {
    await createBrand(taxonomyInputFrom(formData), actor.email);
  } catch (error) {
    if (error instanceof TaxonomyError) {
      redirectWithError("/admin/brands", error.message);
    }
    throw error;
  }

  revalidatePath("/admin/brands");
  redirectWithNotice("/admin/brands", "Brand created.");
}

export async function updateBrandAction(formData: FormData) {
  const actor = await requireAdminActor("categories.manage");
  const id = formValue(formData, "id");

  try {
    await updateBrand(id, taxonomyInputFrom(formData), actor.email);
  } catch (error) {
    if (error instanceof TaxonomyError) {
      redirectWithError(`/admin/brands/${id}`, error.message);
    }
    throw error;
  }

  revalidatePath("/admin/brands");
  revalidatePath(`/admin/brands/${id}`);
  redirectWithNotice(`/admin/brands/${id}`, "Brand saved.");
}

export async function deleteBrandAction(formData: FormData) {
  const actor = await requireAdminActor("categories.manage");
  const id = formValue(formData, "id");

  try {
    await deleteBrand(id, actor.email);
  } catch (error) {
    if (error instanceof TaxonomyError) {
      redirectWithError("/admin/brands", error.message);
    }
    throw error;
  }

  revalidatePath("/admin/brands");
  redirectWithNotice("/admin/brands", "Unused brand deleted.");
}

/* --------------------------------------------------------------- inventory */

export async function adjustInventoryAction(formData: FormData) {
  const actor = await requireAdminActor("inventory.manage");
  const productId = formValue(formData, "productId");

  try {
    await adjustInventory({
      productId,
      delta: Number(formValue(formData, "delta")),
      reason: formValue(formData, "reason"),
      note: formValue(formData, "note"),
      actor: actor.email,
    });
  } catch (error) {
    if (error instanceof InventoryError) {
      redirectWithError(`/admin/inventory/${productId}`, error.message);
    }
    throw error;
  }

  revalidatePath(`/admin/inventory/${productId}`);
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  redirectWithNotice(`/admin/inventory/${productId}`, "Stock adjusted.");
}

export async function updateLowStockThresholdAction(formData: FormData) {
  const actor = await requireAdminActor("inventory.manage");
  const productId = formValue(formData, "productId");

  try {
    await updateLowStockThreshold({
      productId,
      threshold: Number(formValue(formData, "threshold")),
      actor: actor.email,
    });
  } catch (error) {
    if (error instanceof InventoryError) {
      redirectWithError(`/admin/inventory/${productId}`, error.message);
    }
    throw error;
  }

  revalidatePath(`/admin/inventory/${productId}`);
  redirectWithNotice(`/admin/inventory/${productId}`, "Low-stock threshold updated.");
}

/* --------------------------------------------------------------- customers */

export async function updateCustomerAction(formData: FormData) {
  const actor = await requireAdminActor("customers.manage");
  const id = formValue(formData, "id");
  const status = formValue(formData, "status") === "DISABLED" ? "DISABLED" : "ACTIVE";

  try {
    await updateCustomer(
      {
        id,
        name: formValue(formData, "name"),
        phone: formValue(formData, "phone"),
        status,
      },
      actor.email,
    );
  } catch (error) {
    if (error instanceof CustomerError) {
      redirectWithError(`/admin/customers/${id}`, error.message);
    }
    throw error;
  }

  revalidatePath(`/admin/customers/${id}`);
  revalidatePath("/admin/customers");
  redirectWithNotice(`/admin/customers/${id}`, "Customer record saved.");
}

export async function addCustomerNoteAction(formData: FormData) {
  const actor = await requireAdminActor("customers.manage");
  const id = formValue(formData, "id");

  try {
    await addCustomerNote({
      customerId: id,
      body: formValue(formData, "body"),
      actor: actor.email,
    });
  } catch (error) {
    if (error instanceof CustomerError) {
      redirectWithError(`/admin/customers/${id}`, error.message);
    }
    throw error;
  }

  revalidatePath(`/admin/customers/${id}`);
  redirectWithNotice(`/admin/customers/${id}`, "Internal note added.");
}

/* ---------------------------------------------------------------- suppliers */

export async function addSupplierNoteAction(formData: FormData) {
  const actor = await requireAdminActor("suppliers.manage");
  const id = formValue(formData, "supplierId");

  try {
    await addSupplierNote({
      supplierId: id,
      body: formValue(formData, "body"),
      actor: actor.email,
    });
  } catch (error) {
    if (error instanceof SupplierInputError) {
      redirectWithError(`/admin/suppliers/${id}`, error.message);
    }
    throw error;
  }

  revalidatePath(`/admin/suppliers/${id}`);
  redirectWithNotice(`/admin/suppliers/${id}`, "Supplier note added.");
}

export async function archiveSupplierAction(formData: FormData) {
  const actor = await requireAdminActor("suppliers.manage");
  const id = formValue(formData, "supplierId");

  try {
    await archiveSupplier(id, actor.email);
  } catch (error) {
    if (error instanceof SupplierInputError) {
      redirectWithError(`/admin/suppliers/${id}`, error.message);
    }
    throw error;
  }

  revalidatePath(`/admin/suppliers/${id}`);
  revalidatePath("/admin/suppliers");
  redirectWithNotice(`/admin/suppliers/${id}`, "Supplier archived.");
}

export async function restoreSupplierAction(formData: FormData) {
  const actor = await requireAdminActor("suppliers.manage");
  const id = formValue(formData, "supplierId");

  try {
    await restoreSupplier(id, actor.email);
  } catch (error) {
    if (error instanceof SupplierInputError) {
      redirectWithError(`/admin/suppliers/${id}`, error.message);
    }
    throw error;
  }

  revalidatePath(`/admin/suppliers/${id}`);
  revalidatePath("/admin/suppliers");
  redirectWithNotice(
    `/admin/suppliers/${id}`,
    "Supplier restored to inactive. Re-verify it before activating it.",
  );
}

/* ------------------------------------------------------------------- orders */

export async function saveOrderNoteAction(formData: FormData) {
  const actor = await requireAdminActor("orders.manage");
  const id = formValue(formData, "orderId");

  try {
    await saveOrderInternalNote({
      orderId: id,
      note: formValue(formData, "note"),
      actor: actor.email,
    });
  } catch (error) {
    if (error instanceof OrderStatusError) {
      redirectWithError(`/admin/orders/${id}`, error.message);
    }
    throw error;
  }

  revalidatePath(`/admin/orders/${id}`);
  redirectWithNotice(`/admin/orders/${id}`, "Internal order note saved.");
}

export async function cancelOrderAction(formData: FormData) {
  const actor = await requireAdminActor("orders.cancel");
  const id = formValue(formData, "orderId");

  try {
    await updateOrderStatus({
      orderId: id,
      to: "CANCELLED",
      note: formValue(formData, "note"),
      actor: actor.email,
    });
  } catch (error) {
    if (error instanceof OrderStatusError) {
      redirectWithError(`/admin/orders/${id}`, error.message);
    }
    throw error;
  }

  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  redirectWithNotice(`/admin/orders/${id}`, "Order cancelled and stock released.");
}

/* ----------------------------------------------------------------- settings */

export async function updateBusinessSettingsAction(formData: FormData) {
  const actor = await requireAdminActor("settings.manage");
  const entries = [...formData.entries()]
    .filter(([key]) => typeof key === "string" && key.startsWith("setting:"))
    .map(([key, entry]) => ({
      key: key.slice("setting:".length),
      value: typeof entry === "string" ? entry : "",
    }));

  try {
    await updateBusinessSettings(entries, actor.email);
  } catch (error) {
    if (error instanceof SettingsError) {
      redirectWithError("/admin/settings/business", error.message);
    }
    throw error;
  }

  revalidatePath("/admin/settings/business");
  revalidatePath("/");
  redirectWithNotice("/admin/settings/business", "Business settings saved.");
}

const HOME_HERO_FIELDS = [
  "homepage.heroEyebrow",
  "homepage.heroHeading",
  "homepage.heroDescription",
  "homepage.heroImageSrc",
  "homepage.heroImageAlt",
  "homepage.heroPrimaryLabel",
  "homepage.heroPrimaryHref",
  "homepage.heroSecondaryLabel",
  "homepage.heroSecondaryHref",
] as const;

export async function updateHomeHeroAction(formData: FormData) {
  const actor = await requireAdminActor("content.manage");
  const entries = HOME_HERO_FIELDS.map((key) => ({
    key,
    value: formValue(formData, key),
  }));

  try {
    await updateBusinessSettings(entries, actor.email);
  } catch (error) {
    if (error instanceof SettingsError) {
      redirectWithError("/admin/content/homepage", error.message);
    }
    throw error;
  }

  revalidatePath("/admin/content/homepage");
  revalidatePath("/");
  redirectWithNotice("/admin/content/homepage", "Homepage hero saved.");
}

const NOTIFICATION_FLAGS = [
  "newOrder",
  "paymentSubmitted",
  "returnRequested",
  "lowStock",
] as const;

export async function updateNotificationSettingsAction(formData: FormData) {
  const actor = await requireAdminActor("settings.manage");
  const entries = [
    {
      key: "notifications.recipientEmail",
      value: formValue(formData, "recipientEmail"),
    },
    ...NOTIFICATION_FLAGS.map((flag) => ({
      key: `notifications.${flag}`,
      value: formCheckbox(formData, flag) ? "true" : "false",
    })),
  ];

  try {
    await updateBusinessSettings(entries, actor.email);
  } catch (error) {
    if (error instanceof SettingsError) {
      redirectWithError("/admin/settings/notifications", error.message);
    }
    throw error;
  }

  revalidatePath("/admin/settings/notifications");
  redirectWithNotice(
    "/admin/settings/notifications",
    "Notification preferences saved. No messages are sent until an email provider is configured.",
  );
}

export async function updatePaymentSettingAction(formData: FormData) {
  const actor = await requireAdminActor("payments.configure");

  try {
    await updatePaymentSetting(
      {
        method: formValue(formData, "method"),
        enabled: formCheckbox(formData, "enabled"),
        displayLabel: formValue(formData, "displayLabel"),
        publicInstructions: formValue(formData, "publicInstructions"),
      },
      actor.email,
    );
  } catch (error) {
    if (error instanceof SettingsError) {
      redirectWithError("/admin/settings/payments", error.message);
    }
    throw error;
  }

  revalidatePath("/admin/settings/payments");
  revalidatePath("/checkout");
  redirectWithNotice("/admin/settings/payments", "Payment method settings saved.");
}

export async function updateShippingSettingAction(formData: FormData) {
  const actor = await requireAdminActor("shipping.manage");

  try {
    await updateShippingSetting(
      {
        estimateMinDays: formValue(formData, "estimateMinDays"),
        estimateMaxDays: formValue(formData, "estimateMaxDays"),
        deliveryNote: formValue(formData, "deliveryNote"),
      },
      actor.email,
    );
  } catch (error) {
    if (error instanceof SettingsError) {
      redirectWithError("/admin/settings/shipping", error.message);
    }
    throw error;
  }

  revalidatePath("/admin/settings/shipping");
  revalidatePath("/");
  redirectWithNotice("/admin/settings/shipping", "Delivery estimate saved.");
}

export async function updateShippingZoneAction(formData: FormData) {
  const actor = await requireAdminActor("shipping.manage");

  try {
    await updatePakistanShippingZone(
      {
        countryCode: formValue(formData, "countryCode"),
        charge: formValue(formData, "charge"),
        estimateMinDays: formValue(formData, "estimateMinDays"),
        estimateMaxDays: formValue(formData, "estimateMaxDays"),
        notes: formValue(formData, "notes"),
        isActive: formCheckbox(formData, "isActive"),
      },
      actor.email,
    );
  } catch (error) {
    if (error instanceof SettingsError) {
      redirectWithError("/admin/settings/shipping", error.message);
    }
    throw error;
  }

  revalidatePath("/admin/settings/shipping");
  revalidatePath("/");
  redirectWithNotice("/admin/settings/shipping", "Pakistan delivery zone saved.");
}

/* ---------------------------------------------------------------- couriers */

export async function createCourierAction(formData: FormData) {
  const actor = await requireAdminActor("shipping.manage");
  let courier;

  try {
    courier = await createCourier(
      {
        displayName: formValue(formData, "displayName"),
        scope: formValue(formData, "scope"),
        contactDetails: formValue(formData, "contactDetails"),
      },
      actor.email,
    );
  } catch (error) {
    if (error instanceof SettingsError) {
      redirectWithError("/admin/settings/shipping", error.message);
    }
    throw error;
  }

  revalidatePath("/admin/settings/shipping");
  revalidatePath("/");
  redirectWithNotice(
    `/admin/settings/shipping?courier=${encodeURIComponent(courier.code)}`,
    "Courier company added. It is not approved or active yet.",
  );
}

export async function updateCourierStatusAction(formData: FormData) {
  const actor = await requireAdminActor("shipping.manage");

  try {
    await updateCourierStatus(
      {
        code: formValue(formData, "code"),
        status: formValue(formData, "status"),
        trackingUrlTemplate: formValue(formData, "trackingUrlTemplate"),
        termsUrl: formValue(formData, "termsUrl"),
        notes: formValue(formData, "notes"),
        contactDetails: formValue(formData, "contactDetails"),
      },
      actor.email,
    );
  } catch (error) {
    if (error instanceof SettingsError) {
      redirectWithError(`/admin/settings/shipping?courier=${encodeURIComponent(formValue(formData, "code"))}`, error.message);
    }
    throw error;
  }

  revalidatePath("/admin/settings/shipping");
  revalidatePath("/");
  redirectWithNotice("/admin/settings/shipping", "Courier status saved.");
}

export async function updateCourierAccountAction(formData: FormData) {
  const actor = await requireAdminActor("shipping.manage");

  try {
    await updateCourierAccount(
      {
        code: formValue(formData, "code"),
        accountVerification: formValue(formData, "accountVerification"),
        evidence: formValue(formData, "evidence"),
      },
      actor.email,
    );
  } catch (error) {
    if (error instanceof SettingsError) {
      redirectWithError(`/admin/settings/shipping?courier=${encodeURIComponent(formValue(formData, "code"))}`, error.message);
    }
    throw error;
  }

  revalidatePath("/admin/settings/shipping");
  revalidatePath("/");
  redirectWithNotice("/admin/settings/shipping", "Courier account verification recorded.");
}

export async function updateCourierJewelleryAction(formData: FormData) {
  const actor = await requireAdminActor("shipping.manage");

  try {
    await updateCourierJewelleryAcceptance(
      {
        code: formValue(formData, "code"),
        jewelleryAcceptance: formValue(formData, "jewelleryAcceptance"),
        approvedCategories: formValue(formData, "approvedCategories"),
        evidence: formValue(formData, "evidence"),
      },
      actor.email,
    );
  } catch (error) {
    if (error instanceof SettingsError) {
      redirectWithError(`/admin/settings/shipping?courier=${encodeURIComponent(formValue(formData, "code"))}`, error.message);
    }
    throw error;
  }

  revalidatePath("/admin/settings/shipping");
  revalidatePath("/");
  redirectWithNotice("/admin/settings/shipping", "Courier jewellery acceptance recorded.");
}

export async function updateCourierDestinationAction(formData: FormData) {
  const actor = await requireAdminActor("shipping.manage");

  try {
    await updateCourierDestination(
      {
        code: formValue(formData, "code"),
        countryCode: formValue(formData, "countryCode"),
        isActive: formCheckbox(formData, "isActive"),
        verified: formCheckbox(formData, "verified"),
        charge: formValue(formData, "charge"),
        estimateMinDays: formValue(formData, "estimateMinDays"),
        estimateMaxDays: formValue(formData, "estimateMaxDays"),
        evidence: formValue(formData, "evidence"),
        notes: formValue(formData, "notes"),
      },
      actor.email,
    );
  } catch (error) {
    if (error instanceof SettingsError) {
      redirectWithError(`/admin/settings/shipping?courier=${encodeURIComponent(formValue(formData, "code"))}`, error.message);
    }
    throw error;
  }

  revalidatePath("/admin/settings/shipping");
  revalidatePath("/");
  redirectWithNotice("/admin/settings/shipping", "Courier destination saved.");
}

/* ------------------------------------------------------------ content pages */

export async function createContentPageAction(formData: FormData) {
  const actor = await requireAdminActor("content.manage");

  try {
    const page = await createContentPage(
      parsePageInput({
        slug: formValue(formData, "slug"),
        title: formValue(formData, "title"),
        intro: formValue(formData, "intro"),
        status: formValue(formData, "status"),
        isIndexable: formCheckbox(formData, "isIndexable"),
      }),
      actor.email,
    );

    revalidatePath("/admin/content");
    redirectWithNotice(`/admin/content/${page.id}`, "Page created as a draft-ready record.");
  } catch (error) {
    if (error instanceof ContentError) {
      redirectWithError("/admin/content", error.message);
    }
    throw error;
  }
}

export async function updateContentPageAction(formData: FormData) {
  const actor = await requireAdminActor("content.manage");
  const id = formValue(formData, "id");

  try {
    await updateContentPage(
      id,
      parsePageInput({
        slug: formValue(formData, "slug"),
        title: formValue(formData, "title"),
        intro: formValue(formData, "intro"),
        status: formValue(formData, "status"),
        isIndexable: formCheckbox(formData, "isIndexable"),
      }),
      actor.email,
    );
  } catch (error) {
    if (error instanceof ContentError) {
      redirectWithError(`/admin/content/${id}`, error.message);
    }
    throw error;
  }

  revalidatePath(`/admin/content/${id}`);
  revalidatePath("/admin/content");
  revalidatePath("/");
  redirectWithNotice(`/admin/content/${id}`, "Page saved.");
}

export async function deleteContentPageAction(formData: FormData) {
  const actor = await requireAdminActor("content.manage");
  const id = formValue(formData, "id");

  try {
    await deleteContentPage(id, actor.email);
  } catch (error) {
    if (error instanceof ContentError) {
      redirectWithError(`/admin/content/${id}`, error.message);
    }
    throw error;
  }

  revalidatePath("/admin/content");
  redirectWithNotice("/admin/content", "Unpublished page deleted.");
}

export async function saveContentSectionAction(formData: FormData) {
  const actor = await requireAdminActor("content.manage");
  const pageId = formValue(formData, "pageId");
  const sectionId = formValue(formData, "sectionId") || null;

  try {
    await saveContentSection(
      pageId,
      sectionId,
      parseSectionInput({
        sectionKey: formValue(formData, "sectionKey"),
        heading: formValue(formData, "heading"),
        body: formValue(formData, "body"),
        imageSrc: formValue(formData, "imageSrc"),
        imageAlt: formValue(formData, "imageAlt"),
        ctaLabel: formValue(formData, "ctaLabel"),
        ctaHref: formValue(formData, "ctaHref"),
        sortOrder: formValue(formData, "sortOrder"),
        isVisible: formCheckbox(formData, "isVisible"),
      }),
      actor.email,
    );
  } catch (error) {
    if (error instanceof ContentError) {
      redirectWithError(`/admin/content/${pageId}`, error.message);
    }
    throw error;
  }

  revalidatePath(`/admin/content/${pageId}`);
  redirectWithNotice(`/admin/content/${pageId}`, "Section saved.");
}

export async function deleteContentSectionAction(formData: FormData) {
  const actor = await requireAdminActor("content.manage");
  const pageId = formValue(formData, "pageId");

  try {
    await deleteContentSection(
      pageId,
      formValue(formData, "sectionId"),
      actor.email,
    );
  } catch (error) {
    if (error instanceof ContentError) {
      redirectWithError(`/admin/content/${pageId}`, error.message);
    }
    throw error;
  }

  revalidatePath(`/admin/content/${pageId}`);
  redirectWithNotice(`/admin/content/${pageId}`, "Section removed.");
}

export async function updateHomeSectionAction(formData: FormData) {
  const actor = await requireAdminActor("content.manage");
  const id = formValue(formData, "id");

  try {
    await updateHomeSection(
      id,
      {
        eyebrow: formValue(formData, "eyebrow"),
        heading: formValue(formData, "heading"),
        description: formValue(formData, "description"),
        placeholderTitle: formValue(formData, "placeholderTitle"),
        placeholderNote: formValue(formData, "placeholderNote"),
        imageSrc: formValue(formData, "imageSrc"),
        imageAlt: formValue(formData, "imageAlt"),
        ctaLabel: formValue(formData, "ctaLabel"),
        ctaHref: formValue(formData, "ctaHref"),
        sortOrder: formValue(formData, "sortOrder"),
        isVisible: formCheckbox(formData, "isVisible"),
      },
      actor.email,
    );
  } catch (error) {
    if (error instanceof ContentError) {
      redirectWithError("/admin/content/homepage", error.message);
    }
    throw error;
  }

  revalidatePath("/admin/content/homepage");
  revalidatePath("/");
  redirectWithNotice("/admin/content/homepage", "Homepage section saved.");
}

/* -------------------------------------------------------------- navigation */

export async function saveNavigationItemAction(formData: FormData) {
  const actor = await requireAdminActor("navigation.manage");
  const id = formValue(formData, "id") || null;

  try {
    await saveNavigationItem(
      id,
      {
        location: formValue(formData, "location"),
        label: formValue(formData, "label"),
        href: formValue(formData, "href"),
        sortOrder: formValue(formData, "sortOrder"),
        isVisible: formCheckbox(formData, "isVisible"),
      },
      actor.email,
    );
  } catch (error) {
    if (error instanceof ContentError) {
      redirectWithError("/admin/navigation", error.message);
    }
    throw error;
  }

  revalidatePath("/admin/navigation");
  revalidatePath("/");
  redirectWithNotice("/admin/navigation", "Navigation link saved.");
}

export async function deleteNavigationItemAction(formData: FormData) {
  const actor = await requireAdminActor("navigation.manage");

  try {
    await deleteNavigationItem(formValue(formData, "id"), actor.email);
  } catch (error) {
    if (error instanceof ContentError) {
      redirectWithError("/admin/navigation", error.message);
    }
    throw error;
  }

  revalidatePath("/admin/navigation");
  revalidatePath("/");
  redirectWithNotice("/admin/navigation", "Navigation link removed.");
}

/* ------------------------------------------------------------------- media */

export async function createMediaAssetAction(formData: FormData) {
  const actor = await requireAdminActor("media.manage");

  try {
    await createMediaAsset(
      {
        url: formValue(formData, "url"),
        fileName: formValue(formData, "fileName"),
        alt: formValue(formData, "alt"),
        sizeBytes: formValue(formData, "sizeBytes"),
      },
      actor.email,
    );
  } catch (error) {
    if (error instanceof MediaError) {
      redirectWithError("/admin/media", error.message);
    }
    throw error;
  }

  revalidatePath("/admin/media");
  redirectWithNotice("/admin/media", "Image registered in the media library.");
}

export async function updateMediaAssetAction(formData: FormData) {
  const actor = await requireAdminActor("media.manage");

  try {
    await updateMediaAsset(
      formValue(formData, "id"),
      {
        alt: formValue(formData, "alt"),
        fileName: formValue(formData, "fileName"),
      },
      actor.email,
    );
  } catch (error) {
    if (error instanceof MediaError) {
      redirectWithError("/admin/media", error.message);
    }
    throw error;
  }

  revalidatePath("/admin/media");
  redirectWithNotice("/admin/media", "Media details updated.");
}

export async function deleteMediaAssetAction(formData: FormData) {
  const actor = await requireAdminActor("media.manage");

  try {
    await deleteMediaAsset(formValue(formData, "id"), actor.email);
  } catch (error) {
    if (error instanceof MediaError) {
      redirectWithError("/admin/media", error.message);
    }
    throw error;
  }

  revalidatePath("/admin/media");
  redirectWithNotice("/admin/media", "Media record removed. The source file was kept.");
}

/* --------------------------------------------------------------------- SEO */

export async function saveSeoMetadataAction(formData: FormData) {
  const actor = await requireAdminActor("seo.manage");

  try {
    await saveSeoMetadata(
      {
        path: formValue(formData, "path"),
        title: formValue(formData, "title"),
        description: formValue(formData, "description"),
        ogImageSrc: formValue(formData, "ogImageSrc"),
        canonicalPath: formValue(formData, "canonicalPath"),
        noIndex: formCheckbox(formData, "noIndex"),
        sitemapInclude: formCheckbox(formData, "sitemapInclude"),
      },
      actor.email,
    );
  } catch (error) {
    if (error instanceof SeoError) {
      redirectWithError("/admin/seo", error.message);
    }
    throw error;
  }

  revalidatePath("/admin/seo");
  redirectWithNotice("/admin/seo", "SEO metadata saved.");
}

export async function deleteSeoMetadataAction(formData: FormData) {
  const actor = await requireAdminActor("seo.manage");

  try {
    await deleteSeoMetadata(formValue(formData, "path"), actor.email);
  } catch (error) {
    if (error instanceof SeoError) {
      redirectWithError("/admin/seo", error.message);
    }
    throw error;
  }

  revalidatePath("/admin/seo");
  redirectWithNotice("/admin/seo", "SEO override removed.");
}

/* -------------------------------------------------------------------- users */

export async function createAdminUserAction(formData: FormData) {
  const actor = await requireSuperAdminActor();

  try {
    await createAdminUser(
      {
        email: formValue(formData, "email"),
        name: formValue(formData, "name"),
        roleId: formValue(formData, "roleId"),
        password: formValue(formData, "password"),
      },
      actor.email,
    );
  } catch (error) {
    if (error instanceof AdminUserError) {
      redirectWithError("/admin/users", error.message);
    }
    throw error;
  }

  revalidatePath("/admin/users");
  redirectWithNotice("/admin/users", "Administrator account created.");
}

export async function updateAdminUserAction(formData: FormData) {
  const actor = await requireSuperAdminActor();
  const id = formValue(formData, "id");
  const status = formValue(formData, "status") === "DISABLED" ? "DISABLED" : "ACTIVE";

  try {
    await updateAdminUser(
      {
        id,
        name: formValue(formData, "name"),
        roleId: formValue(formData, "roleId"),
        status,
      },
      { id: actor.id, email: actor.email },
    );
  } catch (error) {
    if (error instanceof AdminUserError) {
      redirectWithError("/admin/users", error.message);
    }
    throw error;
  }

  revalidatePath("/admin/users");
  redirectWithNotice("/admin/users", "Administrator account updated.");
}

export async function resetAdminUserPasswordAction(formData: FormData) {
  const actor = await requireSuperAdminActor();

  try {
    await resetAdminUserPassword(
      { id: formValue(formData, "id"), password: formValue(formData, "password") },
      { id: actor.id, email: actor.email },
    );
  } catch (error) {
    if (error instanceof AdminUserError) {
      redirectWithError("/admin/users", error.message);
    }
    throw error;
  }

  revalidatePath("/admin/users");
  redirectWithNotice("/admin/users", "Password reset and sessions revoked.");
}

/**
 * Remove a staff member's authenticator and recovery codes after an approved
 * identity check. Reserved to the Super Admin role and recorded in the audit
 * trail. The affected administrator must re-enrol at next sign-in.
 */
export async function resetAdminUserMfaAction(formData: FormData) {
  const actor = await requireSuperAdminActor("users.reset-mfa");
  const id = formValue(formData, "id");
  const removed = await resetMfaForUser(id);

  await recordAdminAudit({
    actor: actor.email,
    action: "auth.mfa.reset",
    entityType: "AdminUser",
    entityId: id,
    summary: removed
      ? "Removed an administrator's authenticator and recovery codes."
      : "Requested MFA reset for an account with no authenticator enrolled.",
  });

  revalidatePath(`/admin/users/${id}`);
  revalidatePath("/admin/users");
  redirectWithNotice(
    `/admin/users/${id}`,
    removed
      ? "Authenticator and recovery codes removed. The administrator must enrol again."
      : "No authenticator was enrolled for this account.",
  );
}

export async function unlockAdminUserAction(formData: FormData) {
  const actor = await requireSuperAdminActor();

  try {
    await unlockAdminUser(formValue(formData, "id"), { email: actor.email });
  } catch (error) {
    if (error instanceof AdminUserError) {
      redirectWithError("/admin/users", error.message);
    }
    throw error;
  }

  revalidatePath("/admin/users");
  redirectWithNotice("/admin/users", "Administrator lockout cleared.");
}

export async function updateRolePermissionsAction(formData: FormData) {
  const actor = await requireSuperAdminActor();

  try {
    await updateRolePermissions(
      {
        roleId: formValue(formData, "roleId"),
        permissions: formData.getAll("permissions").map(String),
      },
      { email: actor.email },
    );
  } catch (error) {
    if (error instanceof AdminUserError) {
      redirectWithError("/admin/roles", error.message);
    }
    throw error;
  }

  revalidatePath("/admin/roles");
  redirectWithNotice("/admin/roles", "Role permissions updated. Affected sessions were revoked.");
}
