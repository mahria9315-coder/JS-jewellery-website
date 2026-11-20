"use client";

import { useRef } from "react";

import type { AdminNavGroup } from "@/lib/admin/navigation";

import { AdminNav } from "./AdminNav";

export function AdminMobileNav({ groups }: { groups: AdminNavGroup[] }) {
  const ref = useRef<HTMLDetailsElement>(null);

  return (
    <details ref={ref} className="admin-mobile-nav group lg:hidden">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3.5 text-sm font-semibold text-slate-700 focus-visible:outline-focus [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2.5">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="h-[1.15rem] w-[1.15rem] text-emerald-700"
          >
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
          </svg>
          Administration menu
        </span>
        <span
          aria-hidden="true"
          className="text-emerald-700 transition-transform group-open:rotate-180"
        >
          ▾
        </span>
      </summary>
      <div className="max-h-[70vh] overflow-y-auto border-t border-slate-200 p-3">
        <AdminNav
          groups={groups}
          onNavigate={() => {
            if (ref.current) ref.current.open = false;
          }}
        />
      </div>
    </details>
  );
}
