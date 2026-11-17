import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminQueryNotice } from "@/components/admin/AdminQueryNotice";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import { ConfirmSubmitButton, SubmitButton } from "@/components/admin/SubmitButton";
import {
  checkboxClass,
  inputClass,
  labelClass,
  panelClass,
} from "@/components/ui/FormPrimitives";
import { deleteBrandAction, updateBrandAction } from "@/lib/actions/admin-content";
import { requireAdminPage } from "@/lib/admin/session";
import { getBrandForAdmin } from "@/lib/admin/taxonomy";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Edit brand",
  description: "Private brand management.",
  path: "/admin/brands",
  noIndex: true,
});

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BrandDetailPage({ params, searchParams }: PageProps) {
  const context = await requireAdminPage("categories.view");
  const { id } = await params;
  const query = await searchParams;
  const canManage = context.user.role.permissions.includes("categories.manage");
  const brand = await getBrandForAdmin(id).catch(() => null);

  if (!brand) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Catalogue"
        title={brand.name}
        description="Brand details appear on linked product pages only when the brand is published."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Brands", href: "/admin/brands" },
          { label: brand.name },
        ]}
      />

      <AdminQueryNotice params={query} />

      <section className={panelClass} aria-labelledby="brand-details">
        <h3 id="brand-details" className="heading-editorial heading-champagne text-xl">
          Brand details
        </h3>
        <form action={updateBrandAction} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={brand.id} />
          <div>
            <label htmlFor="name" className={labelClass}>
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              minLength={2}
              maxLength={120}
              defaultValue={brand.name}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="slug" className={labelClass}>
              URL slug
            </label>
            <input
              id="slug"
              name="slug"
              required
              defaultValue={brand.slug}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={brand.description}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="imageSrc" className={labelClass}>
              Logo path
            </label>
            <input
              id="imageSrc"
              name="imageSrc"
              defaultValue={brand.logoSrc ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="imageAlt" className={labelClass}>
              Logo alternative text
            </label>
            <input
              id="imageAlt"
              name="imageAlt"
              defaultValue={brand.logoAlt ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="seoTitle" className={labelClass}>
              SEO title
            </label>
            <input
              id="seoTitle"
              name="seoTitle"
              maxLength={120}
              defaultValue={brand.seoTitle ?? ""}
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
              rows={2}
              maxLength={300}
              defaultValue={brand.seoDescription ?? ""}
              className={inputClass}
            />
          </div>
          <label className="flex items-start gap-2 text-sm text-champagne sm:col-span-2">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={brand.isPublished}
              className={checkboxClass}
            />
            Published
          </label>
          {canManage ? (
            <div className="sm:col-span-2">
              <SubmitButton>Save brand</SubmitButton>
            </div>
          ) : null}
        </form>
      </section>

      {canManage ? (
        <section className={panelClass} aria-labelledby="delete-brand">
          <h3 id="delete-brand" className="heading-editorial heading-champagne text-xl">
            Delete brand
          </h3>
          <p className="mt-2 text-sm text-champagne/70">
            Brands linked to products cannot be deleted. Unpublish instead.
          </p>
          <form action={deleteBrandAction} className="mt-4">
            <input type="hidden" name="id" value={brand.id} />
            <ConfirmSubmitButton confirmMessage={`Delete the brand “${brand.name}”? This cannot be undone.`}>
              Delete brand
            </ConfirmSubmitButton>
          </form>
        </section>
      ) : null}
    </div>
  );
}
