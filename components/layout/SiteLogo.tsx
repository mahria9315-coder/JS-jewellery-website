import Link from "next/link";

type SiteLogoProps = {
  tone?: "light" | "dark";
  onNavigate?: () => void;
};

export function SiteLogo({ tone = "light", onNavigate }: SiteLogoProps) {
  const isDark = tone === "dark";

  return (
    <Link
      href="/"
      aria-label="J's Jewellery home"
      onClick={onNavigate}
      className={`inline-flex items-baseline gap-2 rounded-brand ${
        isDark ? "focus-visible:outline-champagne" : ""
      }`}
    >
      <span
        aria-hidden="true"
        className={`font-serif text-2xl leading-none ${
          isDark ? "text-white" : "text-obsidian"
        }`}
      >
        J&apos;s
      </span>
      <span
        aria-hidden="true"
        className={`text-[0.6rem] font-medium uppercase tracking-[0.3em] ${
          isDark ? "text-champagne" : "text-charcoal"
        }`}
      >
        Jewellery
      </span>
    </Link>
  );
}
