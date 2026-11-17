import type { Metadata } from "next";
import Link from "next/link";

import {
  Notice,
  buttonPrimary,
  inputClass,
  labelClass,
  panelClass,
} from "@/components/ui/FormPrimitives";
import { listSuppliers } from "@/lib/admin/suppliers";
import { requireAdminPage } from "@/lib/admin/session";
import { createSupplierAction } from "@/lib/actions/admin";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Suppliers",
  description: "Private supplier records.",
  path: "/admin/suppliers",
  noIndex: true,
});

type SuppliersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

const SUPPLIER_STATUSES = [
  "PENDING_VERIFICATION",
  "ACTIVE",
  "SUSPENDED",
  "INACTIVE",
];
const VERIFICATION_STATUSES = ["UNVERIFIED", "PENDING", "VERIFIED", "REJECTED"];

export default async function AdminSuppliersPage({
  searchParams,
}: SuppliersPageProps) {
  await requireAdminPage("suppliers.view");
  const query = await searchParams;
  const suppliers = await listSuppliers();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-editorial heading-champagne text-2xl">
          Suppliers
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-champagne/70">
          Supplier contact details, agreements, costs, and notes are private.
          Create a record only for a real supplier whose identity and agreement
          you are verifying. Do not invent supplier data.
        </p>
      </div>

      {first(query.error) ? (
        <Notice tone="error">{first(query.error)}</Notice>
      ) : null}

      <section className={panelClass} aria-labelledby="supplier-create">
        <h3
          id="supplier-create"
          className="heading-editorial heading-champagne text-xl"
        >
          Add a supplier record
        </h3>
        <form action={createSupplierAction} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="legalName" className={labelClass}>
              Legal or business name
            </label>
            <input
              id="legalName"
              name="legalName"
              required
              minLength={2}
              maxLength={200}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="tradingName" className={labelClass}>
              Trading name <span className="font-normal text-champagne/60">(optional)</span>
            </label>
            <input id="tradingName" name="tradingName" maxLength={200} className={inputClass} />
          </div>
          <div>
            <label htmlFor="contactName" className={labelClass}>
              Contact name <span className="font-normal text-champagne/60">(optional)</span>
            </label>
            <input id="contactName" name="contactName" maxLength={120} className={inputClass} />
          </div>
          <div>
            <label htmlFor="contactEmail" className={labelClass}>
              Contact email <span className="font-normal text-champagne/60">(optional)</span>
            </label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              maxLength={254}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="contactPhone" className={labelClass}>
              Contact phone <span className="font-normal text-champagne/60">(optional)</span>
            </label>
            <input id="contactPhone" name="contactPhone" maxLength={40} className={inputClass} />
          </div>
          <div>
            <label htmlFor="status" className={labelClass}>
              Supplier status
            </label>
            <select id="status" name="status" className={inputClass} defaultValue="PENDING_VERIFICATION">
              {SUPPLIER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ").toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="verificationStatus" className={labelClass}>
              Identity verification
            </label>
            <select
              id="verificationStatus"
              name="verificationStatus"
              className={inputClass}
              defaultValue="UNVERIFIED"
            >
              {VERIFICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="internalNotes" className={labelClass}>
              Internal notes <span className="font-normal text-champagne/60">(private, optional)</span>
            </label>
            <textarea id="internalNotes" name="internalNotes" rows={3} maxLength={2000} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className={buttonPrimary}>
              Create supplier record
            </button>
          </div>
        </form>
      </section>

      <section aria-labelledby="supplier-list">
        <h3
          id="supplier-list"
          className="heading-editorial heading-champagne text-xl"
        >
          Existing suppliers
        </h3>

        {suppliers.length === 0 ? (
          <p className="mt-3 text-sm text-champagne/70">
            No supplier records exist yet. Add one only after verifying the real
            supplier.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gold/25 text-champagne/70">
                  <th scope="col" className="py-2 pr-4 font-semibold">Name</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Status</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Verification</th>
                  <th scope="col" className="py-2 pr-4 font-semibold">Products</th>
                  <th scope="col" className="py-2 font-semibold">Open</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="border-b border-gold/10">
                    <td className="py-3 pr-4 text-white">
                      {supplier.legalName}
                      {supplier.tradingName ? (
                        <span className="block text-xs text-champagne/60">
                          {supplier.tradingName}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4 text-champagne">
                      {supplier.status.replaceAll("_", " ").toLowerCase()}
                    </td>
                    <td className="py-3 pr-4 text-champagne">
                      {supplier.verificationStatus.toLowerCase()}
                    </td>
                    <td className="py-3 pr-4 text-champagne">
                      {supplier._count.products}
                    </td>
                    <td className="py-3">
                      <Link
                        href={`/admin/suppliers/${supplier.id}`}
                        className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
