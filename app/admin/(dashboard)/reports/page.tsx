import type { Metadata } from "next";

import {
  AdminPageHeader,
  AdminTable,
  AdminTd,
  AdminTh,
} from "@/components/admin/AdminUI";
import { firstParam } from "@/components/admin/AdminQueryNotice";
import {
  Notice,
  buttonPrimary,
  inputClass,
  labelClass,
  panelClass,
} from "@/components/ui/FormPrimitives";
import {
  buildSalesReport,
  formatMoneyMinor,
  parseReportRange,
} from "@/lib/admin/reports";
import { requireAdminPage } from "@/lib/admin/session";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Reports",
  description: "Private sales and profit reporting.",
  path: "/admin/reports",
  noIndex: true,
});

type ReportsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function toInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  await requireAdminPage("reports.view");
  const params = await searchParams;
  const fromParam = firstParam(params, "from");
  const toParam = firstParam(params, "to");

  let report: Awaited<ReturnType<typeof buildSalesReport>> | null = null;
  let unavailable = false;

  try {
    report = await buildSalesReport(fromParam, toParam);
  } catch {
    unavailable = true;
  }

  const range = parseReportRange(fromParam, toParam);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Overview"
        title="Sales and profit"
        description="Every figure comes from recorded orders and the supplier cost captured on each order line. Cancelled orders are excluded. Refunds are shown separately and never netted into a gross total without a label."
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Reports" }]}
      />

      {unavailable ? (
        <Notice tone="error">
          Report data could not be read. Check the database connection.
        </Notice>
      ) : null}

      <form method="get" className={`${panelClass} flex flex-wrap items-end gap-4`}>
        <div>
          <label htmlFor="from" className={labelClass}>
            From
          </label>
          <input
            id="from"
            name="from"
            type="date"
            defaultValue={toInputValue(range.from)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="to" className={labelClass}>
            To
          </label>
          <input
            id="to"
            name="to"
            type="date"
            defaultValue={toInputValue(new Date(range.to.getTime() - 86400000))}
            className={inputClass}
          />
        </div>
        <button type="submit" className={buttonPrimary}>
          Update report
        </button>
      </form>

      {report ? (
        <>
          <section aria-labelledby="report-summary">
            <h3
              id="report-summary"
              className="heading-editorial heading-champagne text-xl"
            >
              Summary for {report.range.label}
            </h3>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Orders", String(report.orderCount)],
                ["Payments verified", String(report.paidOrderCount)],
                ["Items sold", String(report.itemsSold)],
                [
                  "Order value",
                  formatMoneyMinor(report.grossSalesMinor, report.currency),
                ],
                [
                  "Recorded supplier cost",
                  formatMoneyMinor(report.supplierCostMinor, report.currency),
                ],
                [
                  "Gross margin",
                  formatMoneyMinor(report.marginMinor, report.currency),
                ],
                [
                  "Refunds processed",
                  formatMoneyMinor(report.refundedMinor, report.currency),
                ],
                ["Currency", report.currency],
              ].map(([label, value]) => (
                <div key={label} className={panelClass}>
                  <dt className="text-sm text-champagne/70">{label}</dt>
                  <dd className="font-nav mt-2 text-2xl font-semibold text-accent">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm text-champagne/60">
              Gross margin is selling price minus the supplier cost recorded at
              order time. It does not include delivery charges, payment fees, or
              operating expenses, because those are not recorded per order.
            </p>
          </section>

          <section aria-labelledby="report-products">
            <h3
              id="report-products"
              className="heading-editorial heading-champagne text-xl"
            >
              Top products
            </h3>
            {report.topProducts.length === 0 ? (
              <p className="mt-3 text-sm text-champagne/70">
                No product sales in this period.
              </p>
            ) : (
              <div className="mt-4">
                <AdminTable caption="Top products by recorded sales">
                  <thead>
                    <tr>
                      <AdminTh>Product</AdminTh>
                      <AdminTh>SKU</AdminTh>
                      <AdminTh align="right">Units</AdminTh>
                      <AdminTh align="right">Sales</AdminTh>
                      <AdminTh align="right">Margin</AdminTh>
                    </tr>
                  </thead>
                  <tbody>
                    {report.topProducts.map((product) => (
                      <tr key={product.sku}>
                        <AdminTd>{product.productName}</AdminTd>
                        <AdminTd>
                          <span className="font-mono text-xs">{product.sku}</span>
                        </AdminTd>
                        <AdminTd align="right">{product.quantity}</AdminTd>
                        <AdminTd align="right">
                          {formatMoneyMinor(product.salesMinor, report.currency)}
                        </AdminTd>
                        <AdminTd align="right">
                          {formatMoneyMinor(product.marginMinor, report.currency)}
                        </AdminTd>
                      </tr>
                    ))}
                  </tbody>
                </AdminTable>
              </div>
            )}
          </section>

          <section aria-labelledby="report-payments">
            <h3
              id="report-payments"
              className="heading-editorial heading-champagne text-xl"
            >
              Order value by payment method
            </h3>
            {report.paymentBreakdown.length === 0 ? (
              <p className="mt-3 text-sm text-champagne/70">
                No orders in this period.
              </p>
            ) : (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {report.paymentBreakdown.map((row) => (
                  <li key={row.method} className={panelClass}>
                    <p className="font-semibold text-white">
                      {row.method.replaceAll("_", " ")}
                    </p>
                    <p className="mt-1 text-sm text-champagne/70">
                      {row.orderCount} order{row.orderCount === 1 ? "" : "s"} ·{" "}
                      {formatMoneyMinor(row.totalMinor, report.currency)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
