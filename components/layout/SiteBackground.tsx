"use client";

import { usePathname } from "next/navigation";

import { GeometricGrid } from "./GeometricGrid";
import { HomepageShoppingBackground } from "./HomepageShoppingBackground";

/**
 * Route-aware decorative background.
 *
 * The homepage uses the owner-supplied shopping background image. Every other
 * route keeps its existing subtle black-and-gold geometric grid over the
 * approved theme gradient. `usePathname` resolves during server rendering as
 * well, so the correct layer is present on the first paint.
 */
export function SiteBackground() {
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  return isHomepage ? <HomepageShoppingBackground /> : <GeometricGrid />;
}
