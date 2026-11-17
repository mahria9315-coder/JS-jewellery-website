import type { Metadata } from "next";
import Link from "next/link";

import { AdminQueryNotice } from "@/components/admin/AdminQueryNotice";
import {
  AdminPageHeader,
  AdminTable,
  AdminTd,
  AdminTh,
  StatusPill,
  formatDate,
} from "@/components/admin/AdminUI";
import { SubmitButton } from "@/components/admin/SubmitButton";
import {
  checkboxClass,
  inputClass,
  labelClass,
  panelClass,
} from "@/components/ui/FormPrimitives";
import { createCategoryAction } from "@/lib/actions/admin-content";
import { requireAdminPage } from "@/lib/admin/session";
import { listCategoriesForAdmin } from "@/lib/admin/taxonomy";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Categories",
  description: "Private category management.",
  path: "/admin/categories",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CategoriesPage({ searchParams }: PageProps) {
  const context = await requireAdminPage("categories.view");
  const params = await searchParams;
  const canManage = context.user.role.permissions.includes("categories.manage");

  let categories: Awaited<ReturnType<typeof listCategoriesForAdmin>> = [];
  let unavailable = false;

  try {
    categories = await listCategoriesForAdmin();
  } catch {
    unavailable = true;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Categories"
        description="Categories group products in the storefront. Only published categories are read publicly; unpublished categories stay hidden."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Categories" },
        ]}
      />

      <AdminQueryNotice params={params} />

      {unavailable ? (
        <div className={panelClass}>
          <p className="text-sm text-amber-200">
            Categories could not be loaded because the database is unavailable.
          </p>
        </div>
      ) : categories.length === 0 ? (
        <div className={panelClass}>
          <p className="text-sm text-champagne/70">
            No categories yet. Create one below, then link products to it.
          </p>
        </div>
      ) : (
        <AdminTable caption="Product categories">
          <thead>
            <tr>
              <AdminTh>Category</AdminTh>
              <AdminTh>Slug</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh align="right">Products</AdminTh>
              <AdminTh>Updated</AdminTh>
              <AdminTh>Open</AdminTh>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <AdminTd>
                  <span className="font-semibold text-white">{category.name}</span>
                  {category.featured ? (
                    <span className="ml-2 text-xs text-accent">Featured</span>
                  ) : null}
                </AdminTd>
                <AdminTd>
                  <span className="font-mono text-xs">{category.slug}</span>
                </AdminTd>
                <AdminTd>
                  <StatusPill
                    status={category.isPublished ? "Published" : "Draft"}
                    tone={category.isPublished ? "success" : "warning"}
                  />
                </AdminTd>
                <AdminTd align="right">{category._count.products}</AdminTd>
                <AdminTd>{formatDate(category.updatedAt)}</AdminTd>
                <AdminTd>
                  <Link
                    href={`/admin/categories/${category.id}`}
                    className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus"
                  >
                    Edit
                  </Link>
                </AdminTd>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}

      {canManage ? (
        <section className={panelClass} aria-labelledby="new-category">
          <h3
            id="new-category"
            className="heading-editorial heading-champagne text-xl"
          >
            New category
          </h3>
          <form action={createCategoryAction} className="mt-4 grid gap-4 sm:grid-cols-2">
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
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
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
                rows={3}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="imageSrc" className={labelClass}>
                Image path (optional)
              </label>
              <input
                id="imageSrc"
                name="imageSrc"
                placeholder="/images/example.webp"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="imageAlt" className={labelClass}>
                Image alternative text
              </label>
              <input id="imageAlt" name="imageAlt" className={inputClass} />
            </div>
            <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
              <label className="flex items-start gap-2 text-sm text-champagne">
                <input
                  type="checkbox"
                  name="isPublished"
                  className={checkboxClass}
                />
                Publish immediately
              </label>
              <label className="flex items-start gap-2 text-sm text-champagne">
                <input type="checkbox" name="featured" className={checkboxClass} />
                Feature in navigation
              </label>
            </div>
            <div className="sm:col-span-2">
              <SubmitButton>Create category</SubmitButton>
            </div>
          </form>
        </section>
      ) : null}
    </div>
  );
}
