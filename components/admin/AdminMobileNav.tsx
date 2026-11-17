"use client";

import { useRef } from "react";

import { AdminNav } from "./AdminNav";
import type { AdminNavGroup } from "@/lib/admin/navigation";

export function AdminMobileNav({ groups }: { groups: AdminNavGroup[] }) {
  const ref = useRef<HTMLDetailsElement>(null);

  return (
    <details
      ref={ref}
      className="group rounded-brand border border-gold/25 bg-charcoal/70 lg:hidden"
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-semibold text-champagne focus-visible:outline-focus [&::-webkit-details-marker]:hidden">
        Administration menu
        <span
          aria-hidden="true"
          className="text-accent transition-transform group-open:rotate-180"
        >
          ▾
        </span>
      </summary>
      <div className="max-h-[70vh] overflow-y-auto border-t border-gold/15 p-3">
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
