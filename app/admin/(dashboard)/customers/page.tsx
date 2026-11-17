import type { Metadata } from "next";
import Link from "next/link";

import { AdminQueryNotice, firstParam } from "@/components/admin/AdminQueryNotice";
import {
  AdminPageHeader,
  AdminTable,
  AdminTd,
  AdminTh,
  StatusPill,
  formatDay,
} from "@/components/admin/AdminUI";
import { buttonSecondary, inputClass, labelClass, panelClass } from "@/components/ui/FormPrimitives";
import { listCustomers } from "@/lib/admin/customers";
import { requireAdminPage } from "@/lib/admin/session";
import { formatPkr } from "@/lib/catalogue";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Customers",
  description: "Private customer records.",
  path: "/admin/customers",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CustomersPage({ searchParams }: PageProps) {
  await requireAdminPage("customers.view");
  const params = await searchParams;
  const search = firstParam(params, "q") ?? "";

  let customers: Awaited<ReturnType<typeof listCustomers>> = [];
  let unavailable = false;

  try {
    customers = await listCustomers(search);
  } catch {
    unavailable = true;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Sales"
        title="Customers"
        description="Customer contact details are private. Use them only to support an order and never copy them into marketing, analytics, or public content."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Customers" },
        ]}
      />

      <AdminQueryNotice params={params} />

      <form method="get" className={`${panelClass} flex flex-wrap items-end gap-4`}>
        <div className="min-w-[16rem] flex-1">
          <label htmlFor="q" className={labelClass}>
            Search customers
          </label>
          <input
            id="q"
            name="q"
            defaultValue={search}
            placeholder="Name, email, or phone"
            className={inputClass}
          />
        </div>
        <button type="submit" className={buttonSecondary}>
          Search
        </button>
        {search ? (
          <Link href="/admin/customers" className={buttonSecondary}>
            Clear
          </Link>
        ) : null}
      </form>

      {unavailable ? (
        <div className={panelClass}>
          <p className="text-sm text-amber-200">
            Customer records could not be loaded because the database is
            unavailable.
          </p>
        </div>
      ) : customers.length === 0 ? (
        <div className={panelClass}>
          <p className="text-sm text-champagne/70">
            {search
              ? "No customers match this search."
              : "No customers yet. Customer records are created when an order is placed."}
          </p>
        </div>
      ) : (
        <AdminTable caption="Customer records" minWidth="56rem">
          <thead>
            <tr>
              <AdminTh>Customer</AdminTh>
              <AdminTh>Phone</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh align="right">Orders</AdminTh>
              <AdminTh align="right">Recorded value</AdminTh>
              <AdminTh>Joined</AdminTh>
              <AdminTh>Open</AdminTh>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => {
              const total = customer.orders.reduce(
                (sum, order) => sum + order.totalMinor,
                0,
              );

              return (
                <tr key={customer.id}>
                  <AdminTd>
                    <span className="font-semibold text-white">
                      {customer.name}
                    </span>
                    <span className="block text-xs text-champagne/60">
                      {customer.email}
                    </span>
                  </AdminTd>
                  <AdminTd>{customer.phone}</AdminTd>
                  <AdminTd>
                    <StatusPill
                      status={customer.status === "ACTIVE" ? "Active" : "Disabled"}
                      tone={customer.status === "ACTIVE" ? "success" : "danger"}
                    />
                  </AdminTd>
                  <AdminTd align="right">{customer._count.orders}</AdminTd>
                  <AdminTd align="right">
                    {formatPkr({ amountMinor: total, currency: "PKR" })}
                  </AdminTd>
                  <AdminTd>{formatDay(customer.createdAt)}</AdminTd>
                  <AdminTd>
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 hover:text-champagne focus-visible:outline-focus"
                    >
                      Open
                    </Link>
                  </AdminTd>
                </tr>
              );
            })}
          </tbody>
        </AdminTable>
      )}
    </div>
  );
}
