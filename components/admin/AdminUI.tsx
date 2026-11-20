import Link from "next/link";
import type { ReactNode } from "react";

import { panelClass } from "@/components/ui/FormPrimitives";

/** Shared presentation helpers for the private administration area. */

export type Breadcrumb = { label: string; href?: string };

export function AdminBreadcrumbs({ items }: { items: Breadcrumb[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-3">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
        {items.map((item, index) => {
          const last = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="rounded underline-offset-4 transition-colors hover:text-emerald-700 hover:underline focus-visible:outline-focus"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={last ? "font-medium text-slate-600" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!last ? <span aria-hidden="true">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
}) {
  return (
    <header className="border-b border-slate-200 pb-5">
      {breadcrumbs ? <AdminBreadcrumbs items={breadcrumbs} /> : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h2 className="heading-editorial mt-2 text-2xl text-slate-900 sm:text-[1.75rem]">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}

export function AdminEmptyState({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className={`${panelClass} border-dashed`}>
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M4 7h16" />
            <path d="M7 12h10" />
            <path d="M10 17h4" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-base font-semibold text-slate-800">{title}</p>
          {children ? (
            <div className="mt-1 text-sm leading-6 text-slate-600">
              {children}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function AdminTable({
  caption,
  minWidth = "52rem",
  children,
}: {
  caption: string;
  minWidth?: string;
  children: ReactNode;
}) {
  return (
    <div className="admin-table-wrap">
      <table className="w-full border-collapse text-left text-sm" style={{ minWidth }}>
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}

export function AdminTh({
  scope = "col",
  children,
  align = "left",
}: {
  scope?: "col" | "row";
  children: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      scope={scope}
      className={align === "right" ? "text-right" : "text-left"}
    >
      {children}
    </th>
  );
}

export function AdminTd({
  children,
  align = "left",
  className = "",
}: {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td
      className={`${align === "right" ? "text-right" : "text-left"} ${className}`}
    >
      {children}
    </td>
  );
}

export function StatusPill({
  status,
  tone = "neutral",
}: {
  status: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const tones: Record<string, string> = {
    neutral: "border-slate-200 bg-slate-50 text-slate-600",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    danger: "border-red-200 bg-red-50 text-red-700",
    info: "border-sky-200 bg-sky-50 text-sky-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}
    >
      {status}
    </span>
  );
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatDay(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-PK", { dateStyle: "medium" });
}
