import type { Metadata } from "next";
import Link from "next/link";

import {
  Notice,
  panelClass,
} from "@/components/ui/FormPrimitives";
import { getDb } from "@/lib/db";
import { requireAdminPage } from "@/lib/admin/session";
import { getPaymentConfigurationStatus } from "@/lib/payments/config";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Administration",
  description: "Private JS Jewellers administration.",
  path: "/admin",
  noIndex: true,
});

export default async function AdminDashboardPage() {
  await requireAdminPage("dashboard.view");
  const payments = getPaymentConfigurationStatus();

  let counts:
    | {
        suppliers: number;
        products: number;
        published: number;
        orders: number;
        pendingPayments: number;
        openReturns: number;
      }
    | null = null;
  let databaseError = false;

  try {
    const db = getDb();
    const [
      suppliers,
      products,
      published,
      orders,
      pendingPayments,
      openReturns,
    ] = await Promise.all([
      db.supplier.count(),
      db.product.count(),
      db.product.count({ where: { publicationStatus: "PUBLISHED" } }),
      db.order.count(),
      db.order.count({ where: { paymentStatus: "SUBMITTED" } }),
      db.returnRequest.count({
        where: { status: { in: ["SUBMITTED", "UNDER_REVIEW", "APPROVED"] } },
      }),
    ]);

    counts = {
      suppliers,
      products,
      published,
      orders,
      pendingPayments,
      openReturns,
    };
  } catch {
    databaseError = true;
  }

  const paymentRows = [
    { label: "Bank Transfer", status: payments.bankTransfer },
    { label: "Easypaisa", status: payments.easypaisa },
  ];

  return (
    <div className="space-y-8">
      {databaseError ? (
        <Notice tone="error">
          The database could not be reached. Check DATABASE_URL and the
          PostgreSQL service.
        </Notice>
      ) : null}

      <section aria-labelledby="admin-summary">
        <h2
          id="admin-summary"
          className="heading-editorial heading-champagne text-2xl"
        >
          At a glance
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: "Suppliers",
              value: counts?.suppliers,
              href: "/admin/suppliers",
            },
            {
              label: "Products",
              value: counts?.products,
              href: "/admin/products",
            },
            {
              label: "Published products",
              value: counts?.published,
              href: "/admin/products",
            },
            {
              label: "Orders",
              value: counts?.orders,
              href: "/admin/orders",
            },
            {
              label: "Payments to verify",
              value: counts?.pendingPayments,
              href: "/admin/orders",
            },
            {
              label: "Open return requests",
              value: counts?.openReturns,
              href: "/admin/returns",
            },
          ].map((item) => (
            <div key={item.label} className={panelClass}>
              <dt className="text-sm text-champagne/70">{item.label}</dt>
              <dd className="font-nav mt-2 text-3xl font-semibold text-accent">
                {item.value ?? "—"}
              </dd>
              <dd>
                <Link
                  href={item.href}
                  className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-champagne underline decoration-gold/40 underline-offset-4 hover:text-accent focus-visible:outline-focus"
                >
                  Manage
                </Link>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={panelClass} aria-labelledby="admin-payments">
        <h2
          id="admin-payments"
          className="heading-editorial heading-champagne text-2xl"
        >
          Payment configuration
        </h2>
        <p className="mt-2 text-sm text-champagne/70">
          Only booleans and environment-variable names are shown. Secret values
          are never displayed or logged.
        </p>
        <ul className="mt-4 space-y-3">
          {paymentRows.map((row) => (
            <li
              key={row.label}
              className="rounded-brand border border-gold/20 p-4 text-sm"
            >
              <p className="font-semibold text-white">{row.label}</p>
              {row.status.configured ? (
                <p className="mt-1 text-emerald-200">Configured and available.</p>
              ) : (
                <p className="mt-1 text-amber-200">
                  Unavailable. Missing:{" "}
                  <span className="font-mono">
                    {row.status.missingEnvKeys.join(", ") || "account details"}
                  </span>
                </p>
              )}
              <p className="mt-1 text-champagne/60">
                Account-holder name:{" "}
                {row.status.accountHolderConfigured
                  ? "configured"
                  : "not configured"}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className={panelClass} aria-labelledby="admin-gates">
        <h2
          id="admin-gates"
          className="heading-editorial heading-champagne text-2xl"
        >
          Operational gates
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-champagne/80">
          <li>
            Payments are never marked received automatically. Verify each
            transfer manually before changing a payment to VERIFIED.
          </li>
          <li>
            A product cannot be published without a verified supplier, an
            approved agreement, confirmed SKU and price, approved content, image
            rights, and verified availability.
          </li>
          <li>
            Return deductions are calculated on the server. Protected cases are
            never reduced by the 25% change-of-mind term.
          </li>
          <li>
            International delivery and return rules are not configured. Do not
            accept or promise them.
          </li>
        </ul>
      </section>
    </div>
  );
}
