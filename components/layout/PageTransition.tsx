"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Subtle route-content transition for the App Router.
 *
 * The first render is never animated. After a client-side navigation, the new
 * content receives a short CSS fade/translate. Navigation is never blocked:
 * the class is applied only after the route has changed, and unsupported
 * browsers or reduced-motion users simply see the content immediately.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    container.classList.remove("page-transition-enter");
    void container.offsetWidth;
    container.classList.add("page-transition-enter");

    const animatedContainer = container;

    function handleAnimationEnd(event: AnimationEvent) {
      if (event.target === animatedContainer) {
        animatedContainer.classList.remove("page-transition-enter");
      }
    }

    container.addEventListener("animationend", handleAnimationEnd);

    return () => {
      container.removeEventListener("animationend", handleAnimationEnd);
      container.classList.remove("page-transition-enter");
    };
  }, [pathname]);

  return (
    <div ref={containerRef} data-page-transition>
      {children}
    </div>
  );
}
