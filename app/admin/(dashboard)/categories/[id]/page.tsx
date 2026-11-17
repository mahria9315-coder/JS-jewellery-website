import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminQueryNotice } from "@/components/admin/AdminQueryNotice";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import { ConfirmSubmitButton, SubmitButton } from "@/components/admin/SubmitButton";
import {
  checkboxClass,
  inputClass,
  labelClass,
  linkClass,
  panelClass,
} from "@/components/ui/FormPrimitives";
import {
  deleteCategoryAction,
  updateCategoryAction,
} from "@/lib/actions/admin-content";
import { requireAdminPage } from "@/lib/admin/session";
import { getCategoryForAdmin } from "@/lib/admin/taxonomy";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Edit category",
  description: "Private category management.",
  path: "/admin/categories",
  noIndex: true,
});

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CategoryDetailPage({
  params,
  searchParams,
}: PageProps) {
  const context = await requireAdminPage("categories.view");
  const { id } = await params;
  const query = await searchParams;
  const canManage = context.user.role.permissions.includes("categories.manage");
  const category = await getCategoryForAdmin(id).catch(() => null);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Catalogue"
        title={category.name}
        description="Published categories appear on the storefront. Unpublishing hides the category without deleting its product links."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Categories", href: "/admin/categories" },
          { label: category.name },
        ]}
        actions={
          category.isPublished ? (
            <Link
              href={`/collections/${category.slug}`}
              className={linkClass}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on store
            </Link>
          ) : null
        }
      />

      <AdminQueryNotice params={query} />

      <section className={panelClass} aria-labelledby="category-details">
        <h3
          id="category-details"
          className="heading-editorial heading-champagne text-xl"
        >
          Category details
        </h3>
        <form action={updateCategoryAction} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={category.id} />
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
              defaultValue={category.name}
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
              defaultValue={category.slug}
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
              defaultValue={category.description}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="imageSrc" className={labelClass}>
              Image path
            </label>
            <input
              id="imageSrc"
              name="imageSrc"
              defaultValue={category.imageSrc ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="imageAlt" className={labelClass}>
              Image alternative text
            </label>
            <input
              id="imageAlt"
              name="imageAlt"
              defaultValue={category.imageAlt ?? ""}
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
              defaultValue={category.seoTitle ?? ""}
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
              defaultValue={category.seoDescription ?? ""}
              className={inputClass}
            />
          </div>
          <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
            <label className="flex items-start gap-2 text-sm text-champagne">
              <input
                type="checkbox"
                name="isPublished"
                defaultChecked={category.isPublished}
                className={checkboxClass}
              />
              Published
            </label>
            <label className="flex items-start gap-2 text-sm text-champagne">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={category.featured}
                className={checkboxClass}
              />
              Featured
            </label>
          </div>
          {canManage ? (
            <div className="sm:col-span-2">
              <SubmitButton>Save category</SubmitButton>
            </div>
          ) : (
            <p className="text-sm text-champagne/60 sm:col-span-2">
              You have view-only access. Ask a Super Admin for categories.manage
              to make changes.
            </p>
          )}
        </form>
      </section>

      {canManage ? (
        <section className={panelClass} aria-labelledby="delete-category">
          <h3
            id="delete-category"
            className="heading-editorial heading-champagne text-xl"
          >
            Delete category
          </h3>
          <p className="mt-2 text-sm text-champagne/70">
            Only categories with no linked products can be deleted. Otherwise
            unpublish the category.
          </p>
          <form action={deleteCategoryAction} className="mt-4">
            <input type="hidden" name="id" value={category.id} />
            <ConfirmSubmitButton confirmMessage={`Delete the category “${category.name}”? This cannot be undone.`}>
              Delete category
            </ConfirmSubmitButton>
          </form>
        </section>
      ) : null}
    </div>
  );
}
