# J's Jewellery — Design System

**Status:** Established in T004 (4 November 2026). Tokens live in `app/globals.css`.
**Source of truth:** `spec.md` §3 (Brand and Visual Requirements) and `AGENTS.md` §4.

This document defines the shared visual conventions. Feature tasks must reuse these tokens instead of adding new colours, font stacks, or one-off spacing values.

## 1. Colour palette

Only the approved palette may be used. Do not introduce additional brand colours.

| Token | Utility examples | Hex | Intended use |
| --- | --- | --- | --- |
| Obsidian Black | `bg-obsidian`, `text-obsidian`, `border-obsidian` | `#090909` | Primary text, dark surfaces, focus rings on light surfaces |
| Charcoal | `bg-charcoal`, `text-charcoal` | `#191919` | Secondary text, secondary dark surfaces |
| Luxury Gold | `bg-gold`, `text-gold`, `border-gold` | `#C6A15B` | Selective accents, dividers, icon detail, primary button background |
| Champagne | `bg-champagne`, `text-champagne` | `#E8DCC5` | Muted surfaces, focus rings on dark surfaces, light accents |
| White | `bg-white`, `text-white` | `#FFFFFF` | Page background, text on dark surfaces |

### Contrast rules

Measured with the WCAG relative-luminance formula by `npm run check:contrast`.

| Pair | Ratio | Requirement | Result |
| --- | --- | --- | --- |
| Obsidian on white | 19.91:1 | 4.5:1 body text | Pass |
| Charcoal on white | 17.58:1 | 4.5:1 body text | Pass |
| Obsidian on champagne | 14.67:1 | 4.5:1 body text | Pass |
| White on obsidian | 19.91:1 | 4.5:1 body text | Pass |
| White on charcoal | 17.58:1 | 4.5:1 body text | Pass |
| Champagne on obsidian | 14.67:1 | 4.5:1 body text | Pass |
| Gold on obsidian | 8.20:1 | 4.5:1 text/UI | Pass |
| Gold on charcoal | 7.24:1 | 4.5:1 text/UI | Pass |
| Obsidian on gold | 8.20:1 | 4.5:1 button text | Pass |
| Focus ring: obsidian on white | 19.91:1 | 3:1 UI | Pass |
| Focus ring: champagne on obsidian | 14.67:1 | 3:1 UI | Pass |
| **Gold on white** | **2.43:1** | 4.5:1 body text | **Fail — restricted** |

**Restriction:** Luxury Gold must not be used for normal-size text, icons, or focus rings on white or champagne. On light surfaces, use obsidian text with gold reserved for decorative rules, borders, or backgrounds that carry obsidian text.

## 2. Typography

No external webfont is downloaded. The system stacks keep the site fast and avoid a third-party dependency; the owner may approve a specific webfont later.

| Role | Token | Stack |
| --- | --- | --- |
| Headings | `font-serif` | Iowan Old Style, Palatino Linotype, Palatino, Georgia, Times New Roman, serif |
| Body and UI | `font-sans` | System UI stack (Segoe UI on Windows, San Francisco on Apple, Roboto on Android) |

Base conventions:

- Headings use `font-serif`, weight 400, tight line height, and balanced wrapping.
- Body text uses `font-sans` at a comfortable line height.
- Recommended scale: page title `text-4xl md:text-5xl`, section title `text-2xl md:text-3xl`, body `text-base`, supporting copy `text-sm`.
- Avoid faux-bold serif headings; use size and spacing for hierarchy.
- Do not set `text-gold` for small text on light backgrounds (see the contrast restriction).

## 3. Spacing and layout

| Token | Value | Utility | Purpose |
| --- | --- | --- | --- |
| `--spacing-gutter` | `clamp(1rem, 4vw, 2rem)` | `px-gutter`, `gap-gutter` | Fluid page gutter |
| `--spacing-section` | `4rem` | `py-section` | Mobile section rhythm |
| `--spacing-section-lg` | `6rem` | `py-section-lg` | Tablet/desktop section rhythm |
| `--container-page` | `80rem` | `max-w-page` | Maximum content width |
| `--radius-brand` | `0.125rem` | `rounded-brand` | Restrained corners on cards, inputs, buttons |

Use the standard Tailwind spacing scale inside sections. Prefer generous whitespace over decorative dividers.

## 4. Reusable conventions

| Class | Purpose |
| --- | --- |
| `container-page` | Centred page wrapper capped at `80rem` with the fluid gutter |
| `surface-dark` | Obsidian background with white text |
| `surface-muted` | Champagne background with obsidian text |

Example page section:

```tsx
<section className="py-section md:py-section-lg">
  <div className="container-page">
    <h2 className="text-2xl md:text-3xl">Section title</h2>
    <p className="mt-4 max-w-prose text-base">Readable body copy.</p>
  </div>
</section>
```

Example dark section with an accessible focus ring:

```tsx
<section className="surface-dark py-section">
  <div className="container-page">
    <button className="rounded-brand bg-gold px-5 py-3 text-obsidian focus-visible:outline-champagne">
      Action
    </button>
  </div>
</section>
```

## 5. Focus and interaction

- The global `:focus-visible` style is a 2px obsidian outline with a 2px offset.
- On `surface-dark` and other dark backgrounds, add `focus-visible:outline-champagne` so the ring remains visible (14.67:1).
- Never remove the focus outline without supplying an equally visible replacement.
- Motion is limited; `prefers-reduced-motion` disables non-essential animation and transitions.

## 6. Verification

```bash
npm run check:contrast
npm run lint
npm run typecheck
npm run build
```

`npm run check:contrast` reads the colour tokens directly from `app/globals.css`, so the documented ratios stay in sync with the implementation. Full browser-based keyboard and screen-reader testing belongs to T040 (responsive and accessibility testing).
