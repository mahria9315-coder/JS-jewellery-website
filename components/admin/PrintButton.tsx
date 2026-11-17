"use client";

import { buttonSecondary } from "@/components/ui/FormPrimitives";

export function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <button
      type="button"
      className={`${buttonSecondary} print:hidden`}
      onClick={() => window.print()}
    >
      {label}
    </button>
  );
}
