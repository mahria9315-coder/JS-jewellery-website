"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { AdminNavGroup } from "@/lib/admin/navigation";

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({
  groups,
  onNavigate,
}: {
  groups: AdminNavGroup[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Administration" className="space-y-6">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-champagne/45">
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
                    className={`flex min-h-10 items-center rounded-brand px-3 text-sm transition-colors focus-visible:outline-focus ${
                      active
                        ? "bg-gold/15 font-semibold text-accent"
                        : "text-champagne/75 hover:bg-champagne/[0.05] hover:text-champagne"
                    }`}
                  >
                    {item.label}
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
