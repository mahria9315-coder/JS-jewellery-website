import Link from "next/link";
import type { ReactNode } from "react";

import { panelClass } from "@/components/ui/FormPrimitives";

/** Shared presentation helpers for the private administration area. */

export type Breadcrumb = { label: string; href?: string };

export function AdminBreadcrumbs({ items }: { items: Breadcrumb[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-champagne/60">
        {items.map((item, index) => {
          const last = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="underline decoration-gold/30 underline-offset-4 hover:text-accent focus-visible:outline-focus"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined}>{item.label}</span>
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
    <header className="border-b border-gold/20 pb-5">
      {breadcrumbs ? <AdminBreadcrumbs items={breadcrumbs} /> : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h2 className="heading-editorial heading-champagne mt-2 text-2xl sm:text-3xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 text-sm text-champagne/70">{description}</p>
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
      <p className="heading-editorial heading-champagne text-lg">{title}</p>
      {children ? (
        <div className="mt-2 text-sm text-champagne/70">{children}</div>
      ) : null}
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
    <div className="overflow-x-auto rounded-card border border-gold/20">
      <table
        className="w-full border-collapse text-left text-sm"
        style={{ minWidth }}
      >
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
      className={`bg-charcoal/70 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-champagne/70 ${
        align === "right" ? "text-right" : "text-left"
      }`}
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
      className={`border-t border-gold/10 px-3 py-3 align-top text-champagne ${
        align === "right" ? "text-right" : "text-left"
      } ${className}`}
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
    neutral: "border-gold/30 bg-champagne/[0.04] text-champagne",
    success: "border-emerald-400/40 bg-emerald-950/25 text-emerald-100",
    warning: "border-amber-400/40 bg-amber-950/25 text-amber-100",
    danger: "border-red-400/40 bg-red-950/25 text-red-100",
    info: "border-sky-400/40 bg-sky-950/25 text-sky-100",
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
