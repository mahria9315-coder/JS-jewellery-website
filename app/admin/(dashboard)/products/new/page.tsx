import type { Metadata } from "next";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminUI";
import { ProductForm } from "@/components/admin/ProductForm";
import { Notice } from "@/components/ui/FormPrimitives";
import { listSupplierOptions } from "@/lib/admin/products";
import { requireAdminPage } from "@/lib/admin/session";
import { listBrandsForAdmin, listCategoriesForAdmin } from "@/lib/admin/taxonomy";
import { createProductAction } from "@/lib/actions/admin";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Add product",
  description: "Private product onboarding.",
  path: "/admin/products/new",
  noIndex: true,
});

type NewProductPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function AdminNewProductPage({
  searchParams,
}: NewProductPageProps) {
  const context = await requireAdminPage("products.view");
  const query = await searchParams;
  const canManage = context.user.role.permissions.includes("products.manage");
  const [suppliers, categories, brands] = await Promise.all([
    listSupplierOptions().catch(() => []),
    listCategoriesForAdmin().catch(() => []),
    listBrandsForAdmin().catch(() => []),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Add a product"
        description="Enter only real, confirmed supplier data. Start as a draft until all publication evidence is recorded."
        actions={
          <Link
            href="/admin/products"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-emerald-700 underline-offset-4 hover:underline focus-visible:outline-focus"
          >
            Back to products
          </Link>
        }
      />

      {first(query.error) ? <Notice tone="error">{first(query.error)}</Notice> : null}

      {!canManage ? (
        <Notice tone="warning">
          Your role has view-only product access, so a new product cannot be
          created.
        </Notice>
      ) : null}

      {suppliers.length === 0 ? (
        <Notice tone="warning">
          A product cannot be created without a real supplier record.{" "}
          <Link
            href="/admin/suppliers"
            className="font-semibold underline decoration-gold/40 underline-offset-4"
          >
            Create a supplier first
          </Link>
          .
        </Notice>
      ) : null}

      <ProductForm
        action={createProductAction}
        suppliers={suppliers}
        categories={categories}
        brands={brands}
        submitLabel="Create product"
      />
    </div>
  );
}
