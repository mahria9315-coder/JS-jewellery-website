"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { AdminNavGroup } from "@/lib/admin/navigation";

import { AdminNavIcon } from "./AdminNavIcon";

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({
  groups,
  onNavigate,
  collapsed = false,
}: {
  groups: AdminNavGroup[];
  onNavigate?: () => void;
  /** Desktop rail mode. Mobile navigation always shows full labels. */
  collapsed?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Administration" className="space-y-5">
      {groups.map((group) => (
        <div key={group.label}>
          <p
            className={`admin-nav-section ${collapsed ? "lg:sr-only" : ""}`}
            aria-hidden={collapsed ? true : undefined}
          >
            {group.label}
          </p>
          <ul className="mt-2 space-y-1">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href, item.exact);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    aria-label={collapsed ? item.label : undefined}
                    title={collapsed ? item.label : undefined}
                    data-active={active ? "true" : "false"}
                    className="admin-nav-link group focus-visible:outline-focus"
                  >
                    <span
                      className={`flex-none ${
                        active
                          ? "text-emerald-700"
                          : "text-slate-400 group-hover:text-emerald-700"
                      }`}
                    >
                      <AdminNavIcon href={item.href} />
                    </span>
                    <span
                      className={`min-w-0 truncate ${collapsed ? "lg:sr-only" : ""}`}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
