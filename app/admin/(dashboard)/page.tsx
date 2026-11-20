import type { Metadata } from "next";
import Link from "next/link";

import { AdminNavIcon } from "@/components/admin/AdminNavIcon";
import {
  AdminPageHeader,
  StatusPill,
} from "@/components/admin/AdminUI";
import { Notice } from "@/components/ui/FormPrimitives";
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

  const summary = [
    {
      label: "Suppliers",
      value: counts?.suppliers,
      href: "/admin/suppliers",
      iconHref: "/admin/suppliers",
      hint: "Trading partners",
      tone: "neutral" as const,
    },
    {
      label: "Products",
      value: counts?.products,
      href: "/admin/products",
      iconHref: "/admin/products",
      hint: "Catalogue total",
      tone: "neutral" as const,
    },
    {
      label: "Published products",
      value: counts?.published,
      href: "/admin/products",
      iconHref: "/admin/inventory",
      hint: "Visible in store",
      tone: "success" as const,
    },
    {
      label: "Orders",
      value: counts?.orders,
      href: "/admin/orders",
      iconHref: "/admin/orders",
      hint: "All time",
      tone: "neutral" as const,
    },
    {
      label: "Payments to verify",
      value: counts?.pendingPayments,
      href: "/admin/orders?paymentStatus=SUBMITTED",
      iconHref: "/admin/settings/payments",
      hint: "Awaiting manual check",
      tone:
        counts && counts.pendingPayments > 0
          ? ("warning" as const)
          : ("success" as const),
    },
    {
      label: "Open return requests",
      value: counts?.openReturns,
      href: "/admin/returns",
      iconHref: "/admin/returns",
      hint: "Submitted, in review or approved",
      tone:
        counts && counts.openReturns > 0
          ? ("info" as const)
          : ("success" as const),
    },
  ];

  return (
    <div className="space-y-8">
      {databaseError ? (
        <Notice tone="error">
          The database could not be reached. Check DATABASE_URL and the
          PostgreSQL service.
        </Notice>
      ) : null}

      <AdminPageHeader
        eyebrow="Overview"
        title="Business overview"
        description="Live operational counts, payment configuration and the safeguards that protect orders and returns."
      />

      <section aria-labelledby="admin-summary">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h2
            id="admin-summary"
            className="heading-editorial text-lg text-slate-900"
          >
            At a glance
          </h2>
          <p className="text-xs font-medium text-slate-500">
            {counts ? "Loaded from the live database" : "Database unavailable"}
          </p>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {summary.map((item) => (
            <div
              key={item.label}
              className="surface-panel group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    {item.label}
                  </dt>
                  <dd className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {item.value ?? "—"}
                  </dd>
                </div>
                <span
                  aria-hidden="true"
                  className={`inline-flex h-10 w-10 flex-none items-center justify-center rounded-lg ${
                    item.tone === "warning"
                      ? "bg-amber-50 text-amber-700"
                      : item.tone === "info"
                        ? "bg-sky-50 text-sky-700"
                        : item.tone === "success"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <AdminNavIcon href={item.iconHref} />
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{item.hint}</p>
              <Link
                href={item.href}
                className="mt-4 inline-flex min-h-9 items-center gap-1 self-start rounded-md text-sm font-semibold text-emerald-700 underline-offset-4 transition-colors hover:text-emerald-800 hover:underline focus-visible:outline-focus"
              >
                Manage
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          ))}
        </dl>
      </section>

      <section
        className="surface-panel rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        aria-labelledby="admin-payments"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="admin-payments"
              className="heading-editorial text-lg text-slate-900"
            >
              Payment configuration
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Only booleans and environment-variable names are shown. Secret
              values are never displayed or logged.
            </p>
          </div>
          <Link
            href="/admin/settings/payments"
            className="inline-flex min-h-9 items-center gap-1 rounded-md text-sm font-semibold text-emerald-700 underline-offset-4 hover:underline focus-visible:outline-focus"
          >
            Payment settings
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {paymentRows.map((row) => (
            <li
              key={row.label}
              className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{row.label}</p>
                <StatusPill
                  status={row.status.configured ? "Configured" : "Unavailable"}
                  tone={row.status.configured ? "success" : "warning"}
                />
              </div>
              {row.status.configured ? (
                <p className="mt-2 text-slate-600">
                  Configured and available for checkout.
                </p>
              ) : (
                <p className="mt-2 text-slate-600">
                  Missing:{" "}
                  <span className="font-mono text-xs text-amber-700">
                    {row.status.missingEnvKeys.join(", ") || "account details"}
                  </span>
                </p>
              )}
              <p className="mt-1.5 text-xs text-slate-500">
                Account-holder name:{" "}
                {row.status.accountHolderConfigured
                  ? "configured"
                  : "not configured"}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="surface-panel rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        aria-labelledby="admin-gates"
      >
        <h2
          id="admin-gates"
          className="heading-editorial text-lg text-slate-900"
        >
          Operational gates
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          These rules are enforced by the application and must not be bypassed.
        </p>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            "Payments are never marked received automatically. Verify each transfer manually before changing a payment to VERIFIED.",
            "A product cannot be published without a verified supplier, an approved agreement, confirmed SKU and price, approved content, image rights, and verified availability.",
            "Return deductions are calculated on the server. Protected cases are never reduced by the 25% change-of-mind term.",
            "International delivery and return rules are not configured. Do not accept or promise them.",
          ].map((rule) => (
            <li
              key={rule}
              className="flex items-start gap-3 rounded-lg border border-slate-200 p-3.5 text-sm leading-6 text-slate-600"
            >
              <span
                aria-hidden="true"
                className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald-50 text-emerald-700"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3"
                >
                  <path d="m5 12 5 5 9-9" />
                </svg>
              </span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
