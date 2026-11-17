"use client";

import { useEffect, useState } from "react";

import type { ProductImage } from "@/lib/catalogue";

import { ProductImageFrame } from "./ProductImageFrame";

type ZoomableProductImageProps = {
  image?: ProductImage;
  sizes: string;
};

/**
 * Product-detail image with a controlled zoom interaction.
 *
 * Desktop pointer devices get a gentle hover preview; touch and keyboard users
 * can tap/click or press Enter/Space to toggle the larger view. The zoom uses a
 * transform inside the existing fixed 4:5 frame, so it cannot shift layout.
 */
export function ZoomableProductImage({
  image,
  sizes,
}: ZoomableProductImageProps) {
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!zoomed) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setZoomed(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [zoomed]);

  if (!image) {
    return <ProductImageFrame image={image} sizes={sizes} priority />;
  }

  return (
    <button
      type="button"
      className="zoom-trigger rounded-brand border-0 bg-transparent p-0 text-left focus-visible:outline-offset-4"
      aria-label={zoomed ? "Reset product image zoom" : "Zoom product image"}
      aria-pressed={zoomed}
      title={zoomed ? "Reset zoom" : "Zoom image"}
      onClick={() => setZoomed((value) => !value)}
    >
      <ProductImageFrame image={image} sizes={sizes} priority />
    </button>
  );
}
