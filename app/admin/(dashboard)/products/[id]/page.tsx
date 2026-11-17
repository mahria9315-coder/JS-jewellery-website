import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/ProductForm";
import { ConfirmSubmitButton, SubmitButton } from "@/components/admin/SubmitButton";
import { Notice, checkboxClass, labelClass, inputClass, panelClass } from "@/components/ui/FormPrimitives";
import {
  getAdminProductById,
  listSupplierOptions,
} from "@/lib/admin/products";
import { requireAdminPage } from "@/lib/admin/session";
import { listBrandsForAdmin, listCategoriesForAdmin } from "@/lib/admin/taxonomy";
import {
  deleteProductImageAction,
  productPublicationAction,
  uploadProductImageAction,
} from "@/lib/actions/admin-content";
import { isSupportedProductImageSource } from "@/lib/product-images";
import { DEMO_PRODUCT_BADGE, isDemoProduct } from "@/lib/demo-products";
import {
  saveCustomizationConfirmationAction,
  updateProductAction,
  updateProductCustomizationAction,
} from "@/lib/actions/admin";
import {
  CUSTOMIZATION_COLOURS,
  CUSTOMIZATION_FONTS,
} from "@/lib/customization/config";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Edit product",
  description: "Private product onboarding.",
  path: "/admin/products",
  noIndex: true,
});

type EditProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function AdminEditProductPage({
  params,
  searchParams,
}: EditProductPageProps) {
  const context = await requireAdminPage("products.view");
  const { id } = await params;
  const query = await searchParams;
  const canManage = context.user.role.permissions.includes("products.manage");
  const canPublish = context.user.role.permissions.includes("products.publish");
  const canVerify = context.user.role.permissions.includes("suppliers.verify");
  const [product, suppliers, categories, brands] = await Promise.all([
    getAdminProductById(id),
    listSupplierOptions().catch(() => []),
    listCategoriesForAdmin().catch(() => []),
    listBrandsForAdmin().catch(() => []),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="heading-editorial heading-champagne text-2xl">
            {product.name}
          </h2>
          <p className="mt-1 text-sm text-champagne/70">
            Supplier: {product.supplier.legalName} ·{" "}
            {product.publicationStatus.toLowerCase()}
            {product.isArchived ? " · archived" : ""}
          </p>
          {isDemoProduct(product) ? (
            <p className="mt-2 inline-flex rounded-brand border border-gold/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              {DEMO_PRODUCT_BADGE}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-4">
          <Link
            href={`/admin/products/${product.id}/preview`}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus"
          >
            Preview
          </Link>
          {product.publicationStatus === "PUBLISHED" && !product.isArchived ? (
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus"
            >
              View public page
            </Link>
          ) : null}
          <Link
            href="/admin/products"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus"
          >
            Back to products
          </Link>
        </div>
      </div>

      {first(query.error) ? <Notice tone="error">{first(query.error)}</Notice> : null}
      {first(query.notice) ? (
        <Notice tone="success">{first(query.notice)}</Notice>
      ) : null}
      {query.saved === "1" ? (
        <Notice tone="success">Product record updated.</Notice>
      ) : null}
      {first(query.customization) === "confirmed" ? (
        <Notice tone="success">Supplier customization confirmation saved.</Notice>
      ) : null}
      {first(query.customization) === "enabled" ? (
        <Notice tone="success">Product customization enabled.</Notice>
      ) : null}
      {first(query.customization) === "disabled" ? (
        <Notice tone="success">Product customization disabled.</Notice>
      ) : null}

      {canPublish ? (
        <section className={panelClass} aria-labelledby="publication-actions">
          <h3
            id="publication-actions"
            className="heading-editorial heading-champagne text-xl"
          >
            Publication
          </h3>
          <p className="mt-2 text-sm text-champagne/70">
            Publishing is refused unless every supplier, SKU, price, content,
            availability, and image-rights safeguard is recorded. Archiving
            always removes the product from the storefront.
          </p>
          <form
            action={productPublicationAction}
            className="mt-4 flex flex-wrap items-end gap-4"
          >
            <input type="hidden" name="id" value={product.id} />
            <div>
              <label htmlFor="publicationStatus" className={labelClass}>
                Set status
              </label>
              <select
                id="publicationStatus"
                name="publicationStatus"
                defaultValue={product.publicationStatus}
                className={inputClass}
              >
                <option value="DRAFT">Draft</option>
                <option value="PENDING_APPROVAL">Pending approval</option>
                <option value="PUBLISHED">Published</option>
                <option value="UNPUBLISHED">Unpublished</option>
              </select>
            </div>
            <label className="flex min-h-11 items-center gap-3 text-sm text-champagne">
              <input
                type="checkbox"
                name="isArchived"
                defaultChecked={product.isArchived}
                className={checkboxClass}
              />
              Archived
            </label>
            <SubmitButton variant="secondary">Apply status</SubmitButton>
          </form>
        </section>
      ) : null}

      <section className={panelClass} aria-labelledby="customization-actions">
        <h3
          id="customization-actions"
          className="heading-editorial heading-champagne text-xl"
        >
          Customization
        </h3>
        <p className="mt-2 text-sm text-champagne/70">
          Customization can only be offered after the assigned supplier has
          confirmed which approved fonts and colours they can fulfil for this
          product. Enabling the toggle without a confirmation is refused by the
          server.
        </p>

        {product.customizationConfirmation ? (
          <div className="mt-4 rounded-brand border border-gold/15 px-4 py-3 text-sm text-champagne/80">
            <p className="font-semibold text-white">
              Supplier confirmation on file
            </p>
            <p className="mt-1">
              Fonts:{" "}
              {product.customizationConfirmation.approvedFonts.join(", ")}
            </p>
            <p>
              Colours:{" "}
              {product.customizationConfirmation.approvedColours.join(", ")}
            </p>
            {product.customizationConfirmation.evidenceReference ? (
              <p>
                Evidence:{" "}
                {product.customizationConfirmation.evidenceReference}
              </p>
            ) : null}
            <p className="text-xs text-champagne/60">
              Recorded by {product.customizationConfirmation.confirmedBy}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-champagne/60">
            No supplier customization confirmation has been recorded for this
            product.
          </p>
        )}

        {canVerify ? (
          <form
            action={saveCustomizationConfirmationAction}
            className="mt-6 space-y-4 border-t border-gold/15 pt-4"
          >
            <input type="hidden" name="id" value={product.id} />
            <fieldset>
              <legend className={labelClass}>Approved fonts</legend>
              <div className="mt-2 flex flex-wrap gap-4">
                {CUSTOMIZATION_FONTS.map((font) => (
                  <label
                    key={font}
                    className="flex min-h-11 items-center gap-2 text-sm text-champagne"
                  >
                    <input
                      type="checkbox"
                      name="approvedFonts"
                      value={font}
                      defaultChecked={product.customizationConfirmation?.approvedFonts.includes(
                        font,
                      )}
                      className={checkboxClass}
                    />
                    {font}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className={labelClass}>Approved colours</legend>
              <div className="mt-2 flex flex-wrap gap-4">
                {CUSTOMIZATION_COLOURS.map((colour) => (
                  <label
                    key={colour}
                    className="flex min-h-11 items-center gap-2 text-sm text-champagne"
                  >
                    <input
                      type="checkbox"
                      name="approvedColours"
                      value={colour}
                      defaultChecked={product.customizationConfirmation?.approvedColours.includes(
                        colour,
                      )}
                      className={checkboxClass}
                    />
                    {colour}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="customizationEvidence" className={labelClass}>
                Evidence reference (optional)
              </label>
              <input
                id="customizationEvidence"
                name="evidenceReference"
                defaultValue={
                  product.customizationConfirmation?.evidenceReference ?? ""
                }
                maxLength={200}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="customizationNotes" className={labelClass}>
                Internal notes (optional)
              </label>
              <textarea
                id="customizationNotes"
                name="notes"
                rows={2}
                maxLength={2000}
                defaultValue={product.customizationConfirmation?.notes ?? ""}
                className={inputClass}
              />
            </div>

            <SubmitButton variant="secondary">
              Save supplier confirmation
            </SubmitButton>
          </form>
        ) : null}

        {canManage ? (
          <form
            action={updateProductCustomizationAction}
            className="mt-6 flex flex-wrap items-center gap-4 border-t border-gold/15 pt-4"
          >
            <input type="hidden" name="id" value={product.id} />
            <label className="flex min-h-11 items-center gap-3 text-sm text-champagne">
              <input
                type="checkbox"
                name="customizationEnabled"
                defaultChecked={product.customizationEnabled}
                className={checkboxClass}
              />
              Offer customization on this product
            </label>
            <SubmitButton variant="secondary">
              Update customization availability
            </SubmitButton>
          </form>
        ) : null}
      </section>

      {canManage ? (
        <section className={panelClass} aria-labelledby="product-image-upload">
          <h3
            id="product-image-upload"
            className="heading-editorial heading-champagne text-xl"
          >
            Product images
          </h3>
          <p className="mt-2 text-sm text-champagne/70">
            Uploads are stored under{" "}
            <span className="font-mono">/images/products/uploads/</span> for
            local development only. Production image storage is not configured
            yet, so do not treat uploaded files as permanently hosted. Only
            upload an image when the supplier agreement grants the right to use
            it.
          </p>

          {product.images.length === 0 ? (
            <p className="mt-4 rounded-brand border border-gold/15 px-4 py-3 text-sm text-champagne/70">
              No product images are recorded. Upload one below or add an
              existing path in the image list field.
            </p>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {product.images.map((image) => (
                <li
                  key={image.id}
                  className="flex items-center gap-3 rounded-brand border border-gold/15 px-3 py-3"
                >
                  {isSupportedProductImageSource(image.src) ? (
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-brand object-cover"
                    />
                  ) : (
                    <span className="flex h-16 w-16 items-center justify-center rounded-brand border border-gold/15 text-xs text-champagne/60">
                      Unsupported
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-champagne">{image.alt}</p>
                    <p className="truncate font-mono text-xs text-champagne/60">
                      {image.src}
                    </p>
                  </div>
                  <form action={deleteProductImageAction}>
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="imageId" value={image.id} />
                    <ConfirmSubmitButton
                      confirmMessage="Remove this image from the product? The uploaded file is deleted."
                      pendingLabel="Removing…"
                    >
                      Remove
                    </ConfirmSubmitButton>
                  </form>
                </li>
              ))}
            </ul>
          )}

          <form
            action={uploadProductImageAction}
            encType="multipart/form-data"
            className="mt-6 grid gap-4 border-t border-gold/15 pt-4 sm:grid-cols-2"
          >
            <input type="hidden" name="productId" value={product.id} />
            <div>
              <label htmlFor="productImage" className={labelClass}>
                Image file
              </label>
              <input
                id="productImage"
                name="image"
                type="file"
                required
                accept="image/jpeg,image/png,image/webp,image/avif"
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-champagne/60">
                JPEG, PNG, WebP, or AVIF up to 8 MB.
              </p>
            </div>
            <div>
              <label htmlFor="productImageAlt" className={labelClass}>
                Alternative text
              </label>
              <input
                id="productImageAlt"
                name="alt"
                required
                minLength={3}
                maxLength={250}
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-champagne/60">
                Describe the image for screen readers.
              </p>
            </div>
            <div className="sm:col-span-2">
              <SubmitButton variant="secondary" pendingLabel="Uploading…">
                Upload image
              </SubmitButton>
            </div>
          </form>
        </section>
      ) : null}

      {!canManage ? (
        <Notice tone="warning">
          Your role has view-only product access. Ask a Super Admin for
          products.manage to edit this record.
        </Notice>
      ) : null}

      <ProductForm
        action={updateProductAction}
        suppliers={suppliers}
        categories={categories}
        brands={brands}
        submitLabel="Save product"
        defaults={{
          id: product.id,
          slug: product.slug,
          sku: product.sku,
          name: product.name,
          description: product.description,
          category: product.category,
          categoryId: product.categoryId,
          brandId: product.brandId,
          featured: product.featured,
          isArchived: product.isArchived,
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
          collectionSlugs: product.collectionSlugs,
          sellingPriceMinor: product.sellingPriceMinor,
          supplierCostMinor: product.supplierCostMinor,
          supplierId: product.supplierId,
          supplierSku: product.supplierSku,
          stockQuantity: product.stockQuantity,
          availability: product.availability,
          availabilityVerifiedAt: product.availabilityVerifiedAt,
          publicationStatus: product.publicationStatus,
          skuConfirmed: product.skuConfirmed,
          priceApproved: product.priceApproved,
          contentApproved: product.contentApproved,
          imageRightsStatus: product.imageRightsStatus,
          imageRightsApproved: product.imageRightsApproved,
          internalNotes: product.internalNotes,
          images: product.images.map((image) => ({
            src: image.src,
            alt: image.alt,
          })),
          blockers: product.blockers,
        }}
      />
    </div>
  );
}
