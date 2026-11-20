"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import logo from "@/public/Luxury Gold Jewelry Monogram Logo.png";

import { adminLogoutAction } from "@/lib/actions/admin";
import type { AdminNavGroup } from "@/lib/admin/navigation";

import { AdminMobileNav } from "./AdminMobileNav";
import { AdminNav } from "./AdminNav";
import { AdminSearchForm } from "./AdminSearchForm";

type AdminChromeUser = {
  name: string;
  email: string;
  roleName: string;
};

type AdminNotificationCounts = {
  pendingPayments: number;
  openReturns: number;
};

const SIDEBAR_STORAGE_KEY = "js-admin-sidebar";
const sidebarListeners = new Set<() => void>();

function subscribeToSidebar(listener: () => void) {
  sidebarListeners.add(listener);
  window.addEventListener("storage", listener);

  return () => {
    sidebarListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function sidebarIsCollapsed() {
  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "collapsed";
}

function sidebarServerSnapshot() {
  return false;
}

function persistSidebarState(collapsed: boolean) {
  window.localStorage.setItem(
    SIDEBAR_STORAGE_KEY,
    collapsed ? "collapsed" : "expanded",
  );
  sidebarListeners.forEach((listener) => listener());
}

function initials(name: string): string {
  const value = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return value || "JS";
}

function currentPage(groups: AdminNavGroup[], pathname: string) {
  if (pathname === "/admin/search") {
    return { title: "Search", group: "Overview" };
  }

  if (pathname.startsWith("/admin/mfa")) {
    return { title: "Multi-factor authentication", group: "Administration" };
  }

  const matches = groups
    .flatMap((group) =>
      group.items.map((item) => ({ ...item, group: group.label })),
    )
    .filter((item) =>
      item.exact
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length);

  const item = matches[0];

  return item
    ? { title: item.label, group: item.group }
    : { title: "Administration", group: "Overview" };
}

export function AdminChrome({
  groups,
  user,
  notifications,
  canSearch,
  children,
}: {
  groups: AdminNavGroup[];
  user: AdminChromeUser;
  notifications: AdminNotificationCounts;
  canSearch: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(
    subscribeToSidebar,
    sidebarIsCollapsed,
    sidebarServerSnapshot,
  );
  const profileRef = useRef<HTMLDetailsElement>(null);
  const page = currentPage(groups, pathname);

  useEffect(() => {
    if (profileRef.current) profileRef.current.open = false;
  }, [pathname]);

  useEffect(() => {
    if (profileRef.current) profileRef.current.open = false;
  }, [pathname]);

  const closeProfile = () => {
    if (profileRef.current) profileRef.current.open = false;
  };

  return (
    <div className="admin-shell">
      <a
        href="#admin-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-lg focus:bg-emerald-700 focus:px-4 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to administration content
      </a>

      <div className="admin-grid" data-collapsed={collapsed ? "true" : "false"}>
        <aside className="admin-sidebar sticky top-0 hidden h-screen px-2 py-4 print:hidden lg:flex lg:flex-col">
          <div
            className={`flex items-center gap-2 px-1 ${
              collapsed ? "lg:flex-col lg:justify-center" : "justify-between"
            }`}
          >
            <Link
              href="/admin"
              className={`flex min-w-0 items-center gap-3 rounded-lg px-1.5 py-1 focus-visible:outline-focus ${
                collapsed ? "lg:justify-center" : ""
              }`}
              aria-label="JS Jewellers administration dashboard"
            >
              <span className="admin-brand-mark">
                <Image
                  src={logo}
                  alt=""
                  priority
                  quality={90}
                  sizes="40px"
                  className="h-9 w-auto mix-blend-screen"
                />
              </span>
              <span
                className={`min-w-0 ${collapsed ? "lg:sr-only" : ""}`}
                aria-hidden={collapsed ? true : undefined}
              >
                <span className="block truncate text-[0.98rem] font-bold tracking-tight text-emerald-950">
                  JS Jewellers
                </span>
                <span className="mt-0.5 block text-[0.6rem] font-semibold uppercase tracking-[0.17em] text-slate-400">
                  Admin panel
                </span>
              </span>
            </Link>

            <button
              type="button"
              onClick={() => persistSidebarState(!collapsed)}
              aria-label={
                collapsed
                  ? "Expand administration sidebar"
                  : "Collapse administration sidebar"
              }
              aria-expanded={!collapsed}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden h-8 w-8 flex-none items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-focus lg:inline-flex"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-4 w-4 transition-transform ${
                  collapsed ? "rotate-180" : ""
                }`}
              >
                <path d="m14 6-6 6 6 6" />
              </svg>
            </button>
          </div>

          <div className="mt-6 flex-1 overflow-y-auto px-1 pb-4">
            <AdminNav groups={groups} collapsed={collapsed} />
          </div>

          <div
            className={`border-t border-slate-200 px-1 pt-3 ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-2.5 py-2">
              <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                {initials(user.name)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-800">
                  {user.name}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {user.roleName}
                </span>
              </span>
            </div>
            <form action={adminLogoutAction} className="mt-2">
              <button
                type="submit"
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-focus"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <path d="m16 17 5-5-5-5" />
                  <path d="M21 12H9" />
                </svg>
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <div className="admin-main">
          <header className="admin-topbar print:hidden">
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-2.5 lg:hidden">
                <Link
                  href="/admin"
                  className="flex items-center gap-2 rounded-lg focus-visible:outline-focus"
                  aria-label="JS Jewellers administration dashboard"
                >
                  <span className="admin-brand-mark h-9 w-9 rounded-lg">
                    <Image
                      src={logo}
                      alt=""
                      quality={90}
                      sizes="36px"
                      className="h-8 w-auto mix-blend-screen"
                    />
                  </span>
                  <span className="text-sm font-bold tracking-tight text-emerald-950">
                    JS Jewellers
                  </span>
                </Link>
              </div>

              <div className="hidden min-w-0 lg:block">
                <nav aria-label="Breadcrumb">
                  <ol className="flex items-center gap-1.5 text-[0.7rem] font-medium text-slate-400">
                    <li>
                      <Link
                        href="/admin"
                        className="rounded transition-colors hover:text-emerald-700 focus-visible:outline-focus"
                      >
                        Administration
                      </Link>
                    </li>
                    <li aria-hidden="true">/</li>
                    <li>{page.group}</li>
                    <li aria-hidden="true">/</li>
                    <li aria-current="page" className="text-slate-600">
                      {page.title}
                    </li>
                  </ol>
                </nav>
                <p className="mt-0.5 truncate text-lg font-bold tracking-tight text-slate-900">
                  {page.title}
                </p>
              </div>

              <div className="ml-auto flex items-center gap-2">
                {canSearch ? (
                  <div className="hidden w-64 xl:block">
                    <AdminSearchForm
                      action="/admin/search"
                      label="Search"
                      placeholder="Find orders, products, customers…"
                    />
                  </div>
                ) : null}

                {notifications.pendingPayments > 0 ? (
                  <Link
                    href="/admin/orders?paymentStatus=SUBMITTED"
                    aria-label={`${notifications.pendingPayments} payment${
                      notifications.pendingPayments === 1 ? "" : "s"
                    } to verify`}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100 focus-visible:outline-focus"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5"
                    >
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                    <span>{notifications.pendingPayments}</span>
                    <span className="hidden sm:inline">
                      payment
                      {notifications.pendingPayments === 1 ? "" : "s"} to verify
                    </span>
                  </Link>
                ) : null}

                {notifications.openReturns > 0 ? (
                  <Link
                    href="/admin/returns"
                    aria-label={`${notifications.openReturns} open return${
                      notifications.openReturns === 1 ? "" : "s"
                    }`}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-100 focus-visible:outline-focus"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M3 12a9 9 0 1 0 9-9 9.8 9.8 0 0 0-6.7 2.8L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                    <span>{notifications.openReturns}</span>
                    <span className="hidden sm:inline">
                      open return
                      {notifications.openReturns === 1 ? "" : "s"}
                    </span>
                  </Link>
                ) : null}

                <Link
                  href="/"
                  className="hidden min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-emerald-700 focus-visible:outline-focus md:inline-flex"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <path d="M15 3h6v6" />
                    <path d="M10 14 21 3" />
                  </svg>
                  View store
                </Link>

                <details ref={profileRef} className="relative">
                  <summary className="flex min-h-9 cursor-pointer list-none items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-2.5 text-left transition-colors hover:border-emerald-200 hover:bg-emerald-50/40 focus-visible:outline-focus [&::-webkit-details-marker]:hidden">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-[0.68rem] font-bold text-emerald-800">
                      {initials(user.name)}
                    </span>
                    <span className="hidden max-w-28 truncate text-xs font-semibold text-slate-700 sm:block">
                      {user.name}
                    </span>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3 w-3 text-slate-400"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </summary>

                  <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_45px_-22px_rgba(15,23,42,0.35)]">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {user.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {user.email}
                      </p>
                      <p className="mt-1.5 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[0.65rem] font-semibold text-emerald-700">
                        {user.roleName}
                      </p>
                    </div>
                    <div className="p-1.5">
                      <Link
                        href="/admin/account"
                        onClick={closeProfile}
                        className="flex min-h-9 items-center gap-2 rounded-lg px-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-emerald-700 focus-visible:outline-focus"
                      >
                        My account
                      </Link>
                      <Link
                        href="/admin/mfa"
                        onClick={closeProfile}
                        className="flex min-h-9 items-center gap-2 rounded-lg px-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-emerald-700 focus-visible:outline-focus"
                      >
                        Authenticator security
                      </Link>
                      <Link
                        href="/"
                        onClick={closeProfile}
                        className="flex min-h-9 items-center gap-2 rounded-lg px-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-emerald-700 focus-visible:outline-focus"
                      >
                        View storefront
                      </Link>
                    </div>
                    <form
                      action={adminLogoutAction}
                      className="border-t border-slate-100 p-1.5"
                    >
                      <button
                        type="submit"
                        className="flex min-h-9 w-full items-center rounded-lg px-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-focus"
                      >
                        Sign out
                      </button>
                    </form>
                  </div>
                </details>
              </div>
            </div>

            <div className="px-4 pb-3 lg:hidden">
              <AdminMobileNav groups={groups} />
            </div>
          </header>

          <main
            id="admin-content"
            tabIndex={-1}
            className="flex-1 px-4 py-6 focus:outline-none sm:px-6 lg:px-8 lg:py-8"
          >
            <div className="mx-auto w-full max-w-7xl space-y-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
