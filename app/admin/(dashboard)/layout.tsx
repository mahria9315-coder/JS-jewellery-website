import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminSearchForm } from "@/components/admin/AdminSearchForm";
import { buttonSecondary } from "@/components/ui/FormPrimitives";
import { adminLogoutAction } from "@/lib/actions/admin";
import { visibleAdminNavigation } from "@/lib/admin/navigation";
import { requireAdminSession } from "@/lib/admin/session";
import { getAdminNotificationCounts } from "@/lib/admin/notifications";
import { pageMetadata } from "@/lib/site";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Administration",
  description: "Private JS Jewellers administration.",
  path: "/admin",
  noIndex: true,
});

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const context = await requireAdminSession();
  const groups = visibleAdminNavigation(
    context.user.role.permissions,
    context.user.role.key,
  );
  const notifications = await getAdminNotificationCounts(
    context.user.role.permissions,
  );
  const canSearch = context.user.role.permissions.some((permission) =>
    ["products.view", "orders.view", "customers.view", "suppliers.view"].includes(
      permission,
    ),
  );

  return (
    <div className="relative z-10 min-h-screen w-full">
      <a
        href="#admin-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-brand focus:bg-gold focus:px-4 focus:text-sm focus:text-on-gold"
      >
        Skip to administration content
      </a>

      <div className="lg:grid lg:min-h-screen lg:grid-cols-[17rem_1fr]">
        <aside className="hidden border-r border-gold/20 bg-charcoal/80 px-4 py-6 backdrop-blur-sm print:hidden lg:flex lg:flex-col">
          <Link
            href="/admin"
            className="block rounded-brand px-3 focus-visible:outline-focus"
          >
            <span className="heading-editorial block text-2xl text-accent">
              JS Jewellers
            </span>
            <span className="mt-1 block text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-champagne/50">
              Administration
            </span>
          </Link>

          <div className="mt-8 flex-1 overflow-y-auto">
            <AdminNav groups={groups} />
          </div>

          <div className="mt-6 border-t border-gold/15 pt-4">
            <p className="px-3 text-sm font-semibold text-white">
              {context.user.name}
            </p>
            <p className="px-3 text-xs text-champagne/60">
              {context.user.role.name}
            </p>
            <form action={adminLogoutAction} className="mt-3 px-3">
              <button type="submit" className={`${buttonSecondary} w-full`}>
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-20 border-b border-gold/20 bg-black/75 px-4 py-3 backdrop-blur-md print:static print:hidden sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 lg:hidden">
                <Link
                  href="/admin"
                  className="heading-editorial text-lg text-accent focus-visible:outline-focus"
                >
                  JS Jewellers
                </Link>
              </div>

              <div className="hidden flex-1 lg:block">
                {canSearch ? (
                  <AdminSearchForm
                    action="/admin/search"
                    label="Search"
                    placeholder="Find orders, products, customers…"
                  />
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                {notifications.pendingPayments > 0 ? (
                  <Link
                    href="/admin/orders?payment=SUBMITTED"
                    className="inline-flex min-h-9 items-center rounded-full border border-amber-400/40 bg-amber-950/30 px-3 text-xs font-semibold text-amber-100 focus-visible:outline-focus"
                  >
                    {notifications.pendingPayments} payment
                    {notifications.pendingPayments === 1 ? "" : "s"} to verify
                  </Link>
                ) : null}
                {notifications.openReturns > 0 ? (
                  <Link
                    href="/admin/returns"
                    className="inline-flex min-h-9 items-center rounded-full border border-gold/35 bg-champagne/[0.05] px-3 text-xs font-semibold text-champagne focus-visible:outline-focus"
                  >
                    {notifications.openReturns} open return
                    {notifications.openReturns === 1 ? "" : "s"}
                  </Link>
                ) : null}
                <Link
                  href="/"
                  className="inline-flex min-h-9 items-center rounded-brand px-3 text-xs font-semibold text-champagne/75 hover:text-accent focus-visible:outline-focus"
                >
                  View store
                </Link>
              </div>
            </div>

            <div className="mt-3 lg:hidden">
              <AdminMobileNav groups={groups} />
            </div>
          </header>

          <main
            id="admin-content"
            tabIndex={-1}
            className="flex-1 px-4 py-6 focus:outline-none sm:px-6 lg:px-8 lg:py-8"
          >
            <div className="mx-auto w-full max-w-6xl space-y-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
