import Link from "next/link";

import {
  Notice,
  buttonPrimary,
  checkboxClass,
  inputClass,
  labelClass,
  panelClass,
} from "@/components/ui/FormPrimitives";
import { collections } from "@/lib/collections";

export type ProductFormDefaults = {
  id?: string;
  slug?: string;
  sku?: string;
  name?: string;
  description?: string;
  category?: string;
  categoryId?: string | null;
  brandId?: string | null;
  featured?: boolean;
  isArchived?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  collectionSlugs?: string[];
  sellingPriceMinor?: number;
  supplierCostMinor?: number;
  supplierId?: string;
  supplierSku?: string | null;
  stockQuantity?: number | null;
  availability?: string;
  availabilityVerifiedAt?: Date | null;
  publicationStatus?: string;
  skuConfirmed?: boolean;
  priceApproved?: boolean;
  contentApproved?: boolean;
  imageRightsStatus?: string;
  imageRightsApproved?: boolean;
  internalNotes?: string | null;
  images?: { src: string; alt: string }[];
  blockers?: string[];
};

const AVAILABILITY_VALUES = [
  "IN_STOCK",
  "OUT_OF_STOCK",
  "VERIFICATION_PENDING",
];
const PUBLICATION_VALUES = [
  "DRAFT",
  "PENDING_APPROVAL",
  "PUBLISHED",
  "UNPUBLISHED",
];
const IMAGE_RIGHTS_VALUES = ["UNKNOWN", "PENDING", "CONFIRMED", "DENIED"];

function moneyValue(minor: number | undefined): string {
  return minor === undefined ? "" : (minor / 100).toFixed(2);
}

function label(value: string): string {
  return value.replaceAll("_", " ").toLowerCase();
}

export function ProductForm({
  action,
  suppliers,
  categories = [],
  brands = [],
  defaults = {},
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  suppliers: { id: string; legalName: string; status: string }[];
  categories?: { id: string; name: string; isPublished: boolean }[];
  brands?: { id: string; name: string; isPublished: boolean }[];
  defaults?: ProductFormDefaults;
  submitLabel: string;
}) {
  const selectedCollections = new Set(defaults.collectionSlugs ?? []);
  const imagesValue = (defaults.images ?? [])
    .map((image) => `${image.src} | ${image.alt}`)
    .join("\n");

  return (
    <form action={action} className="space-y-6">
      {defaults.id ? <input type="hidden" name="id" value={defaults.id} /> : null}

      {defaults.blockers && defaults.blockers.length > 0 ? (
        <Notice tone="warning">
          <p className="font-semibold">Publication is blocked:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {defaults.blockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        </Notice>
      ) : null}

      <section className={panelClass} aria-labelledby="product-basics">
        <h3 id="product-basics" className="heading-editorial heading-champagne text-xl">
          Product details
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className={labelClass}>Product name</label>
            <input
              id="name"
              name="name"
              required
              minLength={2}
              maxLength={200}
              defaultValue={defaults.name ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="slug" className={labelClass}>URL slug</label>
            <input
              id="slug"
              name="slug"
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              maxLength={80}
              defaultValue={defaults.slug ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="sku" className={labelClass}>SKU (internal, confirmed)</label>
            <input
              id="sku"
              name="sku"
              required
              maxLength={64}
              defaultValue={defaults.sku ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="category" className={labelClass}>Category label</label>
            <input
              id="category"
              name="category"
              maxLength={80}
              defaultValue={defaults.category ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="categoryId" className={labelClass}>
              Linked category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={defaults.categoryId ?? ""}
              className={inputClass}
            >
              <option value="">No linked category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {category.isPublished ? "" : " (unpublished)"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="brandId" className={labelClass}>
              Brand
            </label>
            <select
              id="brandId"
              name="brandId"
              defaultValue={defaults.brandId ?? ""}
              className={inputClass}
            >
              <option value="">No brand recorded</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                  {brand.isPublished ? "" : " (unpublished)"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="supplierSku" className={labelClass}>Supplier SKU</label>
            <input
              id="supplierSku"
              name="supplierSku"
              maxLength={80}
              defaultValue={defaults.supplierSku ?? ""}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className={labelClass}>Description</label>
            <textarea
              id="description"
              name="description"
              required
              minLength={10}
              maxLength={5000}
              rows={6}
              defaultValue={defaults.description ?? ""}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <fieldset>
              <legend className={labelClass}>Collections</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {collections.map((collection) => (
                  <label
                    key={collection.slug}
                    className="flex min-h-11 items-center gap-3 text-sm text-champagne"
                  >
                    <input
                      type="checkbox"
                      name="collectionSlugs"
                      value={collection.slug}
                      defaultChecked={selectedCollections.has(collection.slug)}
                      className={checkboxClass}
                    />
                    {collection.name}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="internalNotes" className={labelClass}>
              Internal notes <span className="font-normal text-champagne/60">(private)</span>
            </label>
            <textarea
              id="internalNotes"
              name="internalNotes"
              rows={3}
              maxLength={2000}
              defaultValue={defaults.internalNotes ?? ""}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <section className={panelClass} aria-labelledby="product-supplier">
        <h3 id="product-supplier" className="heading-editorial heading-champagne text-xl">
          Supplier, pricing, and stock
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="supplierId" className={labelClass}>Actual supplier</label>
            <select
              id="supplierId"
              name="supplierId"
              required
              defaultValue={defaults.supplierId ?? ""}
              className={inputClass}
            >
              <option value="">Choose the real supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.legalName} ({label(supplier.status)})
                </option>
              ))}
            </select>
            {suppliers.length === 0 ? (
              <p className="mt-1.5 text-sm text-amber-200">
                Add a supplier record first.{" "}
                <Link
                  href="/admin/suppliers"
                  className="font-semibold underline decoration-gold/40 underline-offset-4"
                >
                  Go to suppliers
                </Link>
                .
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="sellingPrice" className={labelClass}>Selling price (PKR)</label>
            <input
              id="sellingPrice"
              name="sellingPrice"
              inputMode="decimal"
              required
              defaultValue={moneyValue(defaults.sellingPriceMinor)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="supplierCost" className={labelClass}>Supplier cost (PKR, private)</label>
            <input
              id="supplierCost"
              name="supplierCost"
              inputMode="decimal"
              required
              defaultValue={moneyValue(defaults.supplierCostMinor)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="stockQuantity" className={labelClass}>
              Stock quantity <span className="font-normal text-champagne/60">(blank = not supplied)</span>
            </label>
            <input
              id="stockQuantity"
              name="stockQuantity"
              inputMode="numeric"
              defaultValue={defaults.stockQuantity ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="availability" className={labelClass}>Availability</label>
            <select
              id="availability"
              name="availability"
              defaultValue={defaults.availability ?? "VERIFICATION_PENDING"}
              className={inputClass}
            >
              {AVAILABILITY_VALUES.map((value) => (
                <option key={value} value={value}>{label(value)}</option>
              ))}
            </select>
          </div>
          <label className="flex min-h-11 items-center gap-3 text-sm text-champagne sm:col-span-2">
            <input
              type="checkbox"
              name="availabilityVerified"
              defaultChecked={Boolean(defaults.availabilityVerifiedAt)}
              className={checkboxClass}
            />
            I have verified supplier availability just now
          </label>
        </div>
      </section>

      <section className={panelClass} aria-labelledby="product-images">
        <h3 id="product-images" className="heading-editorial heading-champagne text-xl">
          Images and rights
        </h3>
        <p className="mt-2 text-sm text-champagne/70">
          Only local image paths under <span className="font-mono">/images/products/</span>{" "}
          are accepted. Do not use an image unless the supplier agreement grants
          the right to use it.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="imageRightsStatus" className={labelClass}>Image rights status</label>
            <select
              id="imageRightsStatus"
              name="imageRightsStatus"
              defaultValue={defaults.imageRightsStatus ?? "UNKNOWN"}
              className={inputClass}
            >
              {IMAGE_RIGHTS_VALUES.map((value) => (
                <option key={value} value={value}>{label(value)}</option>
              ))}
            </select>
          </div>
          <label className="flex min-h-11 items-center gap-3 text-sm text-champagne sm:mt-7">
            <input
              type="checkbox"
              name="imageRightsApproved"
              defaultChecked={defaults.imageRightsApproved ?? false}
              className={checkboxClass}
            />
            Image rights approved for use on this site
          </label>
          <div className="sm:col-span-2">
            <label htmlFor="images" className={labelClass}>
              Image list — one per line as <span className="font-mono">/path.jpg | alt text</span>
            </label>
            <textarea
              id="images"
              name="images"
              rows={4}
              defaultValue={imagesValue}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <section className={panelClass} aria-labelledby="product-publication">
        <h3 id="product-publication" className="heading-editorial heading-champagne text-xl">
          Evidence and publication
        </h3>
        <p className="mt-2 text-sm text-champagne/70">
          A product can only be published when every safeguard below is
          satisfied. Publication is checked again on the server.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex min-h-11 items-center gap-3 text-sm text-champagne">
            <input
              type="checkbox"
              name="skuConfirmed"
              defaultChecked={defaults.skuConfirmed ?? false}
              className={checkboxClass}
            />
            SKU confirmed with the supplier
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm text-champagne">
            <input
              type="checkbox"
              name="priceApproved"
              defaultChecked={defaults.priceApproved ?? false}
              className={checkboxClass}
            />
            Selling price approved
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm text-champagne">
            <input
              type="checkbox"
              name="contentApproved"
              defaultChecked={defaults.contentApproved ?? false}
              className={checkboxClass}
            />
            Product content approved
          </label>
          <div>
            <label htmlFor="publicationStatus" className={labelClass}>Publication status</label>
            <select
              id="publicationStatus"
              name="publicationStatus"
              defaultValue={defaults.publicationStatus ?? "DRAFT"}
              className={inputClass}
            >
              {PUBLICATION_VALUES.map((value) => (
                <option key={value} value={value}>{label(value)}</option>
              ))}
            </select>
          </div>
          <label className="flex min-h-11 items-center gap-3 text-sm text-champagne">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={defaults.featured ?? false}
              className={checkboxClass}
            />
            Feature on the storefront
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm text-champagne">
            <input
              type="checkbox"
              name="isArchived"
              defaultChecked={defaults.isArchived ?? false}
              className={checkboxClass}
            />
            Archived (hidden from the storefront)
          </label>
          <div>
            <label htmlFor="seoTitle" className={labelClass}>
              SEO title
            </label>
            <input
              id="seoTitle"
              name="seoTitle"
              maxLength={120}
              defaultValue={defaults.seoTitle ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="seoDescription" className={labelClass}>
              SEO description
            </label>
            <textarea
              id="seoDescription"
              name="seoDescription"
              rows={3}
              maxLength={300}
              defaultValue={defaults.seoDescription ?? ""}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <button type="submit" className={buttonPrimary} disabled={suppliers.length === 0}>
        {submitLabel}
      </button>
    </form>
  );
}
