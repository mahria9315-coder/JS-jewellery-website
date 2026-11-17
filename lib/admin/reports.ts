import { getDb } from "@/lib/db";

/**
 * Sales and profit reporting.
 *
 * Every figure is calculated from recorded orders and the supplier cost that
 * was captured on each order line. Nothing is estimated, projected, or
 * invented. Cancelled orders are excluded from sales and profit, and refunds
 * are reported separately so a gross figure is never presented as net revenue.
 */

export type ReportRange = {
  from: Date;
  to: Date;
  label: string;
};

export function parseReportRange(
  fromRaw?: string,
  toRaw?: string,
): ReportRange {
  const today = new Date();
  const defaultFrom = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1),
  );

  const from = parseDate(fromRaw) ?? defaultFrom;
  const to = parseDate(toRaw) ?? today;
  const exclusiveTo = new Date(
    Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate() + 1),
  );

  if (from > to) {
    return { from: to, to: exclusiveTo, label: "" };
  }

  return {
    from,
    to: exclusiveTo,
    label: `${formatInput(from)} to ${formatInput(to)}`,
  };
}

function parseDate(value?: string): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatInput(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export type SalesReport = {
  range: ReportRange;
  orderCount: number;
  paidOrderCount: number;
  itemsSold: number;
  grossSalesMinor: number;
  supplierCostMinor: number;
  marginMinor: number;
  refundedMinor: number;
  currency: string;
  topProducts: Array<{
    productName: string;
    sku: string;
    quantity: number;
    salesMinor: number;
    marginMinor: number;
  }>;
  paymentBreakdown: Array<{
    method: string;
    orderCount: number;
    totalMinor: number;
  }>;
};

export async function buildSalesReport(
  fromRaw?: string,
  toRaw?: string,
): Promise<SalesReport> {
  const db = getDb();
  const range = parseReportRange(fromRaw, toRaw);

  const orders = await db.order.findMany({
    where: {
      createdAt: { gte: range.from, lt: range.to },
      orderStatus: { not: "CANCELLED" },
    },
    select: {
      id: true,
      paymentMethod: true,
      paymentStatus: true,
      totalMinor: true,
      currency: true,
      items: {
        select: {
          productName: true,
          sku: true,
          quantity: true,
          lineTotalMinor: true,
          supplierCostMinor: true,
          marginMinor: true,
        },
      },
      returnRequests: {
        where: { refundProcessedAt: { not: null } },
        select: { refundAmountMinor: true },
      },
    },
  });

  let itemsSold = 0;
  let grossSalesMinor = 0;
  let supplierCostMinor = 0;
  let marginMinor = 0;
  let refundedMinor = 0;
  let paidOrderCount = 0;

  const productTotals = new Map<
    string,
    { productName: string; sku: string; quantity: number; salesMinor: number; marginMinor: number }
  >();
  const paymentTotals = new Map<
    string,
    { method: string; orderCount: number; totalMinor: number }
  >();

  for (const order of orders) {
    grossSalesMinor += order.totalMinor;

    if (order.paymentStatus === "VERIFIED") {
      paidOrderCount += 1;
    }

    const payment = paymentTotals.get(order.paymentMethod) ?? {
      method: order.paymentMethod,
      orderCount: 0,
      totalMinor: 0,
    };
    payment.orderCount += 1;
    payment.totalMinor += order.totalMinor;
    paymentTotals.set(order.paymentMethod, payment);

    for (const request of order.returnRequests) {
      refundedMinor += request.refundAmountMinor;
    }

    for (const item of order.items) {
      itemsSold += item.quantity;
      supplierCostMinor += item.supplierCostMinor * item.quantity;
      marginMinor += item.marginMinor;

      const product = productTotals.get(item.sku) ?? {
        productName: item.productName,
        sku: item.sku,
        quantity: 0,
        salesMinor: 0,
        marginMinor: 0,
      };
      product.quantity += item.quantity;
      product.salesMinor += item.lineTotalMinor;
      product.marginMinor += item.marginMinor;
      productTotals.set(item.sku, product);
    }
  }

  return {
    range,
    orderCount: orders.length,
    paidOrderCount,
    itemsSold,
    grossSalesMinor,
    supplierCostMinor,
    marginMinor,
    refundedMinor,
    currency: orders[0]?.currency ?? "PKR",
    topProducts: [...productTotals.values()]
      .sort((a, b) => b.salesMinor - a.salesMinor)
      .slice(0, 10),
    paymentBreakdown: [...paymentTotals.values()].sort(
      (a, b) => b.totalMinor - a.totalMinor,
    ),
  };
}

export function formatMoneyMinor(
  amountMinor: number,
  currency = "PKR",
): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountMinor / 100);
}
