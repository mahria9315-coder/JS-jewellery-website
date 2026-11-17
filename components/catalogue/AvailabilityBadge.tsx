import type { ProductAvailabilityStatus } from "@/lib/catalogue";

const labels: Record<ProductAvailabilityStatus, string> = {
  in_stock: "In stock",
  out_of_stock: "Currently unavailable",
  verification_pending: "Availability pending verification",
};

export function AvailabilityBadge({
  status,
}: {
  status: ProductAvailabilityStatus;
}) {
  const isAvailable = status === "in_stock";

  return (
    <span className="inline-flex items-center gap-2 rounded-brand border border-gold/25 bg-obsidian/60 px-2.5 py-1 text-xs text-champagne">
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${
          isAvailable ? "bg-gold" : "bg-champagne/40"
        }`}
      />
      {labels[status]}
    </span>
  );
}
