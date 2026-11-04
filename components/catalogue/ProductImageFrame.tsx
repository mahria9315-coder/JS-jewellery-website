import Image from "next/image";

import type { ProductImage } from "@/lib/catalogue";

type ProductImageFrameProps = {
  image?: ProductImage;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/**
 * Consistent 4:5 product-image frame. When no approved image exists, show a
 * clearly neutral placeholder instead of inventing product photography.
 */
export function ProductImageFrame({
  image,
  sizes,
  priority = false,
  className = "",
}: ProductImageFrameProps) {
  return (
    <div
      className={`relative aspect-[4/5] overflow-hidden rounded-brand border border-charcoal/15 bg-champagne/40 ${className}`}
    >
      {image ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-8 w-8 text-charcoal/50"
          >
            <path d="M12 3 21 12 12 21 3 12 12 3Z" />
          </svg>
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-charcoal">
            Image pending
          </span>
        </div>
      )}
    </div>
  );
}
