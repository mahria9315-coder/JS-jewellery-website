import Image from "next/image";
import Link from "next/link";

import logo from "@/public/Luxury Gold Jewelry Monogram Logo.png";

type SiteLogoProps = {
  variant?: "header" | "footer";
  onNavigate?: () => void;
};

/**
 * Owner-supplied logo. The source PNG is never edited. On dark surfaces the
 * baked-in black background is removed visually with `mix-blend-screen`; the
 * footer variant adds the owner-approved slow rotation inside a fixed stage.
 */
export function SiteLogo({ variant = "header", onNavigate }: SiteLogoProps) {
  const isFooter = variant === "footer";

  return (
    <Link
      href="/"
      onClick={onNavigate}
      className={`logo-plate inline-flex items-center justify-center rounded-brand focus-visible:outline-focus ${
        isFooter ? "w-[66%]" : ""
      }`}
    >
      <Image
        src={logo}
        alt="JS Jewellers"
        priority={!isFooter}
        quality={90}
        sizes={
          isFooter
            ? "(min-width: 1024px) 174px, 125px"
            : "(min-width: 1024px) 64px, (min-width: 640px) 48px, 44px"
        }
        className={
          isFooter
            ? "footer-logo-rotate h-auto w-full mix-blend-screen"
            : "h-11 w-auto mix-blend-screen sm:h-12 lg:h-16"
        }
      />
    </Link>
  );
}
