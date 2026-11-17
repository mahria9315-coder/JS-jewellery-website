import type { ReactNode } from "react";

/**
 * Shared form and panel primitives for the cart, checkout, order, and admin
 * screens. They use the existing Black Gold Galaxy tokens and work in both the
 * dark and light themes.
 */

export const panelClass =
  "surface-panel rounded-card border border-gold/20 p-5 sm:p-6";

export const labelClass =
  "block text-sm font-semibold text-champagne";

export const inputClass =
  "mt-1.5 block w-full rounded-brand border border-gold/30 bg-charcoal px-3 py-2.5 text-sm text-white placeholder:text-champagne/45 focus-visible:outline-focus";

export const checkboxClass =
  "mt-0.5 h-4 w-4 rounded border-gold/40 bg-charcoal text-gold focus-visible:outline-focus";

export const buttonPrimary =
  "gold-shimmer inline-flex min-h-11 items-center justify-center rounded-brand bg-gold px-5 py-2.5 text-sm font-semibold text-on-gold transition-colors hover:bg-gold-strong focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60";

export const buttonSecondary =
  "inline-flex min-h-11 items-center justify-center rounded-brand border border-gold/40 bg-champagne/[0.03] px-5 py-2.5 text-sm font-medium text-champagne transition-colors hover:border-gold hover:text-accent focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60";

export const buttonDanger =
  "inline-flex min-h-11 items-center justify-center rounded-brand border border-red-400/50 bg-red-950/20 px-5 py-2.5 text-sm font-medium text-red-200 transition-colors hover:border-red-300 hover:text-red-100 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60";

export const linkClass =
  "inline-flex min-h-11 items-center font-semibold text-accent underline decoration-gold/40 underline-offset-4 transition-colors hover:text-champagne focus-visible:outline-focus";

type NoticeTone = "info" | "success" | "warning" | "error";

const noticeClasses: Record<NoticeTone, string> = {
  info: "border-gold/30 bg-champagne/[0.04] text-champagne",
  success: "border-emerald-400/40 bg-emerald-950/20 text-emerald-100",
  warning: "border-amber-400/40 bg-amber-950/20 text-amber-100",
  error: "border-red-400/40 bg-red-950/20 text-red-100",
};

export function Notice({
  tone = "info",
  className = "",
  children,
}: {
  tone?: NoticeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-card border px-4 py-3 text-sm ${noticeClasses[tone]} ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) {
    return null;
  }

  return (
    <p id={id} className="mt-1.5 text-sm text-red-300">
      {children}
    </p>
  );
}

export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="heading-page heading-gold mt-3 text-4xl md:text-5xl">
        {title}
      </h1>
      {intro ? <p className="body-copy mt-4 text-base">{intro}</p> : null}
    </div>
  );
}
