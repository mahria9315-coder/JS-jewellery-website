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
import { createBrandAction } from "@/lib/actions/admin-content";
import { requireAdminPage } from "@/lib/admin/session";
import { listBrandsForAdmin } from "@/lib/admin/taxonomy";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Brands",
  description: "Private brand management.",
  path: "/admin/brands",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BrandsPage({ searchParams }: PageProps) {
  const context = await requireAdminPage("categories.view");
  const params = await searchParams;
  const canManage = context.user.role.permissions.includes("categories.manage");

  let brands: Awaited<ReturnType<typeof listBrandsForAdmin>> = [];
  let unavailable = false;

  try {
    brands = await listBrandsForAdmin();
  } catch {
    unavailable = true;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Brands"
        description="Brands are optional labels for products. Only recorded brand information is shown; do not invent a brand relationship that the supplier has not confirmed."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Brands" },
        ]}
      />

      <AdminQueryNotice params={params} />

      {unavailable ? (
        <div className={panelClass}>
          <p className="text-sm text-amber-200">
            Brands could not be loaded because the database is unavailable.
          </p>
        </div>
      ) : brands.length === 0 ? (
        <div className={panelClass}>
          <p className="text-sm text-champagne/70">
            No brands recorded. Add one only when the supplier relationship is
            confirmed.
          </p>
        </div>
      ) : (
        <AdminTable caption="Product brands">
          <thead>
            <tr>
              <AdminTh>Brand</AdminTh>
              <AdminTh>Slug</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh align="right">Products</AdminTh>
              <AdminTh>Updated</AdminTh>
              <AdminTh>Open</AdminTh>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr key={brand.id}>
                <AdminTd>
                  <span className="font-semibold text-white">{brand.name}</span>
                </AdminTd>
                <AdminTd>
                  <span className="font-mono text-xs">{brand.slug}</span>
                </AdminTd>
                <AdminTd>
                  <StatusPill
                    status={brand.isPublished ? "Published" : "Draft"}
                    tone={brand.isPublished ? "success" : "warning"}
                  />
                </AdminTd>
                <AdminTd align="right">{brand._count.products}</AdminTd>
                <AdminTd>{formatDate(brand.updatedAt)}</AdminTd>
                <AdminTd>
                  <Link
                    href={`/admin/brands/${brand.id}`}
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
        <section className={panelClass} aria-labelledby="new-brand">
          <h3 id="new-brand" className="heading-editorial heading-champagne text-xl">
            New brand
          </h3>
          <form action={createBrandAction} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className={labelClass}>
                Name
              </label>
              <input id="name" name="name" required minLength={2} className={inputClass} />
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
              <textarea id="description" name="description" rows={3} className={inputClass} />
            </div>
            <div>
              <label htmlFor="imageSrc" className={labelClass}>
                Logo path (optional)
              </label>
              <input id="imageSrc" name="imageSrc" className={inputClass} />
            </div>
            <div>
              <label htmlFor="imageAlt" className={labelClass}>
                Logo alternative text
              </label>
              <input id="imageAlt" name="imageAlt" className={inputClass} />
            </div>
            <label className="flex items-start gap-2 text-sm text-champagne sm:col-span-2">
              <input type="checkbox" name="isPublished" className={checkboxClass} />
              Publish immediately
            </label>
            <div className="sm:col-span-2">
              <SubmitButton>Create brand</SubmitButton>
            </div>
          </form>
        </section>
      ) : null}
    </div>
  );
}
