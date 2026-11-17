import Image from "next/image";
import Link from "next/link";

import {
  DEFAULT_HOME_HERO,
  type HomeHeroContent,
} from "@/lib/home-hero";

export function HomeHero({
  content = DEFAULT_HOME_HERO,
}: {
  content?: HomeHeroContent;
}) {
  return (
    <section
      className="relative overflow-hidden border-b border-gold/25"
      aria-labelledby="hero-heading"
    >
      <div className="container-page grid items-center gap-12 py-section md:py-section-lg lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="eyebrow hero-reveal">{content.eyebrow}</p>
          <h1
            id="hero-heading"
            className="hero-title hero-reveal hero-reveal-delay-1 mt-4"
          >
            {content.heading}
          </h1>
          <p className="body-copy hero-reveal hero-reveal-delay-2 mt-6 max-w-prose text-base">
            {content.description}
          </p>

          <div className="hero-reveal hero-reveal-delay-3 mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={content.primaryHref}
              className="gold-shimmer font-nav inline-flex min-h-11 items-center justify-center rounded-brand bg-gold px-6 py-3 text-sm font-semibold text-on-gold transition-colors hover:bg-gold-strong focus-visible:outline-focus"
            >
              <span>{content.primaryLabel}</span>
            </Link>
            <Link
              href={content.secondaryHref}
              className="font-nav inline-flex min-h-11 items-center justify-center rounded-brand border border-gold/40 bg-champagne/[0.03] px-6 py-3 text-sm font-medium text-champagne transition-colors hover:border-gold hover:text-accent focus-visible:outline-focus"
            >
              {content.secondaryLabel}
            </Link>
          </div>
        </div>

        <figure className="hero-artwork-reveal relative mx-auto w-full max-w-xl lg:mx-0 lg:max-w-none">
          <div aria-hidden="true" className="hero-artwork-glow" />
          <div className="relative rounded-card border border-gold/40 bg-gradient-to-br from-gold/15 via-obsidian/30 to-antique/15 p-2.5 shadow-2xl shadow-black/60">
            <Image
              src={content.imageSrc}
              alt={content.imageAlt}
              width={1536}
              height={1024}
              preload
              sizes="(min-width: 1024px) 45vw, (min-width: 640px) 36rem, calc(100vw - 2rem)"
              className="h-auto w-full rounded-[0.55rem] border border-gold/15"
            />
          </div>
        </figure>
      </div>
    </section>
  );
}
