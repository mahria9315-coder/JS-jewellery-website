# JS Jewellers — Design System

**Status:** Established in T004 (4 November 2026); brand rules aligned in T003B (4 November 2026). **Black Gold Galaxy theme owner-approved and applied 5 November 2026.** **Dark/light theme toggle, editorial typography, premium 3D cards, and route-aware decorative backgrounds approved and applied 5–6 November 2026.** The 5 November starfield was replaced on 6 November 2026 by the owner-approved two-style background system; the homepage was then updated to the Bright Gold Geometric Grid, while every non-homepage route retains the existing Geometric Grid. Tokens live in `app/globals.css`. **Premium heading typography refined and verified 7 November 2026:** the homepage hero is now the largest heading site-wide (800 italic champagne-gold), with a consistent italic display hierarchy for page titles, section headings, and product names while body, navigation, buttons, and controls remain upright.
**Source of truth:** `spec.md` §3 (Brand and Visual Requirements) and `AGENTS.md` §4.

This document defines the shared visual conventions. Feature tasks must reuse these tokens instead of adding new colours, font stacks, or one-off spacing values.

**Brand:** JS Jewellers. The owner's existing logo is used exactly as supplied at `public/Luxury Gold Jewelry Monogram Logo.png`. Do not create a new logo, redraw it, crop it, recolour it, or replace it with a text wordmark. The source PNG is never modified. Its baked-in black background is removed visually with `mix-blend-mode: screen` on dark surfaces. In the light theme the same unchanged image sits on a dark circular plate (`.logo-plate::before`) so the screen blend still removes the black background without lightening the artwork. The header keeps the logo at its existing small size; the footer shows a larger, centred copy in a fixed square stage with the approved slow rotation.

**Protected artwork:** `public/Luxury Gold Jewelry Monogram Logo.png` (1229×1280) and `public/images/js-jewellers-hero.png` (1536×1024) are owner-approved assets. Preserve their aspect ratios and do not regenerate, overwrite, or otherwise alter the files.

## 1. Colour palette

Only the approved Black Gold Galaxy palette may be used. Do not introduce additional brand colours. The seven brand colours stay exact in both themes; surface and text aliases resolve per theme.

### 1.1 Approved brand colours

| Token | Utility examples | Hex | Intended use |
| --- | --- | --- | --- |
| Deep Black (`obsidian`) | `bg-obsidian`, `text-obsidian`, `border-obsidian` | `#050505` | Dark page base, header, footer floor, primary button text |
| Charcoal (`charcoal`) | `bg-charcoal`, `text-charcoal` | `#111111` | Dark elevated cards and panels |
| Dark Gold Shadow (`gold-shadow`) | `bg-gold-shadow`, `border-gold-shadow` | `#17120C` | Dark warm gradient stop, deep panel tones |
| Dark Brown (`brown`) | `bg-brown`, `border-brown` | `#20170D` | Dark warm gradient mid-stop, editorial bands |
| Bronze Brown (`bronze`) | `bg-bronze`, `border-bronze` | `#443019` | Dark gradient transition and warm accents |
| Antique Gold (`antique`) | `border-antique`, `bg-antique/…` | `#80602C` | **Decorative only** — dividers, glows, gradients |
| Luxury Gold (`gold`) | `bg-gold`, `text-gold`, `border-gold` | `#C29A45` | Primary accents, button backgrounds, borders — see the light-theme restriction below |
| Champagne (`champagne`) | `bg-champagne`, `text-champagne` | `#E8DCC5` | Dark-theme body copy and secondary text; the brand text colour |
| White (`white`) | `bg-white`, `text-white` | `#FFFFFF` | Dark-theme headings and primary text |

### 1.2 Theme modes

Black Gold Galaxy is the default dark theme. The light theme is opt-in and is a designed warm ivory-and-gold palette, not an inversion or filter. Both modes keep the approved `172deg` page gradient.

| Token | Dark (default) | Light (opt-in) | Purpose |
| --- | --- | --- | --- |
| `--theme-page` | `#050505` | `#FBF7EF` | Page base (maps to `obsidian`) |
| `--theme-heading` | `#FFFFFF` | `#1E1810` | Headings and primary text (maps to `white`) |
| `--theme-body` | `#E8DCC5` | `#453B2F` | Body and secondary text (maps to `champagne`) |
| `--theme-accent` | `#C29A45` | `#7A5A1E` | Readable gold text for eyebrows, prices, links |
| `--theme-focus` | `#E8DCC5` | `#3B2A12` | Focus-ring colour, readable on both page surfaces |
| `--theme-elevated` | `#111111` | `#FFFDF8` | Elevated cards and panels (maps to `charcoal`) |
| `--theme-muted` | `#20170D` | `#F6EDDC` | Alternate editorial bands (maps to `brown`) |
| `--theme-bronze` | `#443019` | `#E8D6B6` | Bronze-tint bands (maps to `bronze`) |
| `--theme-gold-shadow` | `#17120C` | `#F9F2E5` | Warm gradient stop (maps to `gold-shadow`) |
| `--theme-header` | `rgba(5,5,5,0.9)` | `rgba(251,247,239,0.92)` | Sticky header surface with backdrop blur |
| `--theme-heading-hero` | `#E8DCC5` | `#7A5A1E` | Homepage hero `h1` only (solid, no gradient text) |
| `--theme-heading-primary` | `#C29A45` | `#7A5A1E` | Primary editorial section headings and eyebrows |
| `--theme-heading-secondary` | `#FFFFFF` | `#1E1810` | Alternating ivory/espresso section headings |
| `--theme-heading-product` | `#FFFFFF` | `#1E1810` | Product names and card titles |

Additional fixed tokens:

- `--color-on-gold` (`#050505`) — text on gold buttons in both themes.
- `--color-gold-strong` (`#A8812F`) — gold button hover, still passes with black text.
- `--brand-gradient` — champagne-to-gold text gradient for the `.brand-wordmark`; it switches to a deeper gold range in the light theme.

Light-theme restriction: raw Luxury Gold `#C29A45` is only 2.46:1 on the ivory page, so it must not carry normal text or act as a thin focus indicator there. Use `--color-accent` (`#7A5A1E`) for text and `--color-focus` for focus. Raw gold may still appear as borders, rules, glows, gradients, and decoration.

### 1.3 Approved gradients

Dark page background is a smooth `172deg` linear gradient:

`#050505 0% → #111111 18% → #17120C 38% → #20170D 60% → #443019 82% → #20170D 100%`

Light page background is a smooth `172deg` ivory gradient:

`#FDFAF3 0% → #FBF6EC 22% → #F8F0E1 48% → #F4E8D2 74% → #FBF6EC 100%`

Radial gold glows are layered above each gradient for depth. Do not add competing background colours to page-level sections; let the gradient show through. Panels use `surface-panel`; the footer uses `surface-footer` and closes the page with the theme-appropriate floor.

### 1.4 Contrast rules

Measured with the WCAG relative-luminance formula by `npm run check:contrast`, which reads both theme blocks. There are 38 approved-pair checks (including the four heading-hierarchy pairs in each theme) and 5 restricted decorative checks (43 total).

Dark theme:

| Pair | Ratio | Requirement | Result |
| --- | --- | --- | --- |
| White on deep black | 20.38:1 | 4.5:1 body text | Pass |
| Champagne on deep black | 15.02:1 | 4.5:1 body text | Pass |
| Champagne on charcoal | 13.91:1 | 4.5:1 body text | Pass |
| Champagne on dark gold shadow | 13.72:1 | 4.5:1 body text | Pass |
| Champagne on dark brown | 13.01:1 | 4.5:1 body text | Pass |
| Champagne on bronze | 9.20:1 | 4.5:1 body text | Pass |
| White on bronze | 12.48:1 | 4.5:1 body text | Pass |
| Hero champagne-gold heading on deep black | 15.02:1 | 4.5:1 heading | Pass |
| Primary warm-gold heading on deep black | 7.77:1 | 4.5:1 heading | Pass |
| Secondary ivory heading on deep black | 20.38:1 | 4.5:1 heading | Pass |
| Product neutral heading on deep black | 20.38:1 | 4.5:1 heading | Pass |
| Luxury Gold on deep black | 7.77:1 | 4.5:1 normal text | Pass |
| Luxury Gold on charcoal | 7.20:1 | 4.5:1 normal text | Pass |
| Luxury Gold on dark gold shadow | 7.09:1 | 4.5:1 normal text | Pass |
| Luxury Gold on dark brown | 6.73:1 | 4.5:1 normal text | Pass |
| Luxury Gold on bronze | 4.76:1 | 3:1 large text or short labels only | Pass — restricted |
| Deep black text on Luxury Gold | 7.77:1 | 4.5:1 button text | Pass |
| Deep black text on gold hover | 5.67:1 | 4.5:1 button text | Pass |
| Deep black text on champagne | 15.02:1 | 4.5:1 button text | Pass |
| Focus ring: champagne on deep black | 15.02:1 | 3:1 UI | Pass |
| Focus ring: white on deep black | 20.38:1 | 3:1 UI | Pass |
| Focus ring: champagne on charcoal | 13.91:1 | 3:1 UI | Pass |

Light theme:

| Pair | Ratio | Requirement | Result |
| --- | --- | --- | --- |
| Heading on warm ivory page | 16.47:1 | 4.5:1 body text | Pass |
| Body on warm ivory page | 10.24:1 | 4.5:1 body text | Pass |
| Body on ivory elevated card | 10.76:1 | 4.5:1 body text | Pass |
| Body on muted band | 9.41:1 | 4.5:1 body text | Pass |
| Body on bronze-tint band | 7.67:1 | 4.5:1 body text | Pass |
| Hero deep-gold heading on warm ivory | 5.94:1 | 4.5:1 heading | Pass |
| Primary deep-gold heading on warm ivory | 5.94:1 | 4.5:1 heading | Pass |
| Secondary espresso heading on warm ivory | 16.47:1 | 4.5:1 heading | Pass |
| Product espresso heading on warm ivory | 16.47:1 | 4.5:1 heading | Pass |
| Deep-gold accent on page | 5.94:1 | 4.5:1 normal text | Pass |
| Deep-gold accent on elevated card | 6.24:1 | 4.5:1 normal text | Pass |
| Deep-gold accent on muted band | 5.46:1 | 4.5:1 normal text | Pass |
| Deep black text on Luxury Gold | 7.77:1 | 4.5:1 button text | Pass |
| Deep black text on gold hover | 5.67:1 | 4.5:1 button text | Pass |
| Focus ring: espresso on page | 12.88:1 | 3:1 UI | Pass |
| Focus ring: espresso on elevated card | 13.54:1 | 3:1 UI | Pass |

Restricted pairs (verified to stay below the threshold so they are decorative only):

| Pair | Ratio | Restriction |
| --- | --- | --- |
| Luxury Gold on white | 2.62:1 | Decorative only, never text |
| Antique Gold on deep black | 3.52:1 | Decorative only |
| Antique Gold on dark brown | 3.05:1 | Decorative only |
| Antique Gold on bronze | 2.16:1 | Not a border or UI colour |
| Raw Luxury Gold on ivory page | 2.46:1 | Decorative only; use `--color-accent` |

Usage restrictions:

- **White and champagne** carry body copy in the dark theme. Never use a warm mid-tone for normal-sized body text.
- **Luxury Gold** may be used for normal text on deep black, charcoal, dark gold shadow, and dark brown.
- **Luxury Gold on bronze** is limited to large text or short labels; do not use it for paragraphs or dense UI.
- **Antique Gold is decorative only.** Do not use it for normal-sized text, and do not use antique-gold borders over bronze.
- **Gold on white is decorative only.** Use the darker `--color-accent` token for light-theme text and links.
- **Gold buttons** carry deep-black text and the theme focus ring. The ring's offset keeps it on the surrounding page surface in both themes.

## 2. Typography

No external webfont is downloaded. Each role names the preferred webfont first and then falls back through fonts that ship with the operating system, so the site stays fast and offline-safe and adds no third-party dependency. If the owner later licenses and self-hosts Playfair Display, Cormorant Garamond, Lora, Inter, and Montserrat, the existing stacks will pick them up without a code change. On the current Windows verification machine the first available families resolve to Palatino Linotype (hero), Garamond (sections), and Century Gothic (body/navigation); this is documented honestly rather than presented as a webfont download.

| Role | Token | Stack (preferred first, system fallbacks after) |
| --- | --- | --- |
| Homepage hero `h1` | `--font-hero` / `.font-hero` | Playfair Display, Bodoni MT, Didot, Bodoni 72, Iowan Old Style, Palatino Linotype, Palatino, Georgia, Times New Roman, serif |
| Section headings | `--font-heading` / `.font-serif` | Cormorant Garamond, EB Garamond, Garamond, Palatino Linotype, Palatino, Book Antiqua, Georgia, Times New Roman, serif |
| Product names | `--font-product` / `.font-product` | Lora, Constantia, Cambria, Georgia, Times New Roman, serif |
| Body copy | `--font-body` / `.font-sans` / `.font-body` | Inter, system UI stack (Segoe UI on Windows, San Francisco on Apple, Roboto on Android) |
| Navigation, buttons, labels, controls | `--font-nav` / `.font-nav` | Montserrat, Century Gothic, Segoe UI, system UI, sans-serif |
| Brand wordmark (unchanged) | `--font-display` / `.font-display` | Bodoni MT, Didot, Iowan Old Style, Palatino Linotype, Palatino, Georgia, Times New Roman, serif |

Base conventions:

- Headings use weight 600-800 italic display faces, line height 1.04-1.2, tight tracking, the theme heading colour, and balanced wrapping. Genuine italics are used where the resolved family provides them; browsers may synthesise the heavier weights.
- Body text uses the upright `--font-body` stack, line height 1.65 (1.7 in paragraphs), subtle positive tracking, and the theme body colour. Body copy is never italic.
- Navigation, buttons, form labels, controls, prices, and statuses use the upright `--font-nav` stack with `font-style: normal`; they never inherit heading italics.
- Recommended scale: homepage hero `clamp(2.375rem, 1.85rem + 3.2vw, 5rem)`, page title `text-4xl md:text-5xl`, section title `text-2xl md:text-4xl`, product name `text-2xl md:text-3xl`, body `text-base`, supporting copy `text-sm`.
- The homepage hero must remain the largest heading on the site. The measured sizes are 41.6px at 375px, 42.08px at 390px, 54.176px at 768px, 73.312px at 1366px, and 75.68px at 1440px, each larger than the largest section heading (30px mobile, 36px tablet/desktop).
- Avoid faux-bold body text, rainbow headings, gradient-clipped heading text, heavy glow, and low-contrast gold. Use size, italic, and colour hierarchy instead.

### 2.1 Heading utilities and colour hierarchy

Major headings use an elegant italic display treatment with varied colour. Body copy, navigation, and buttons stay upright; do not set paragraphs in italic.

| Class | Purpose |
| --- | --- |
| `.hero-title` | Homepage `h1`: `--font-hero`, weight 800, italic, line height 1.04, tracking `-0.02em`, solid `--theme-heading-hero` |
| `.heading-page` | Route `h1` (collections, search, policies, not-found): `--font-display`, weight 700, italic, line height 1.08 |
| `.heading-editorial` | Section `h2`/`h3`: `--font-heading`, weight 600, italic, line height 1.1, tracking `-0.012em` |
| `.heading-product` | Product `h1` and card names: `--font-product`, weight 600, italic, line height 1.2, `--theme-heading-product` |
| `.heading-hero` | Hero colour: champagne `#E8DCC5` in dark, deep gold `#7A5A1E` in light |
| `.heading-ivory` | Heading colour: ivory/white in dark, espresso in light |
| `.heading-champagne` | Heading colour: champagne in dark, dark brown in light |
| `.heading-gold` | Heading colour: readable `--color-accent` gold in both themes |
| `.eyebrow` | Upright nav sans, uppercase, `0.3em` tracking, primary heading accent colour |
| `.body-copy` | Upright body copy with line height 1.75 and theme body colour |
| `.card-3d-title` | Product/card title: `--font-product`, weight 600, italic, `--theme-heading-product` |

Usage:

```tsx
<p className="eyebrow">Collections</p>
<h1 className="heading-page heading-gold mt-3 text-4xl md:text-5xl">
  Shop jewellery collections
</h1>
<h2 className="heading-editorial heading-ivory mt-3 text-3xl md:text-4xl">
  New Arrivals
</h2>
<p className="body-copy mt-4 text-base">Readable, upright body copy.</p>
```

The dark theme alternates primary warm-gold `#C29A45` and ivory `#FFFFFF` section headings. The light theme alternates deep gold `#7A5A1E` and espresso `#1E1810`. Product names stay neutral: white in dark and espresso in light. Keep the homepage hero to a single solid champagne/deep-gold colour; do not apply a gradient to it.


### 2.2 Brand wordmark

`.brand-wordmark` is a separate text element, not a replacement for the owner logo. It uses the italic display serif, balanced `0.065em` tracking, the champagne-to-gold `--brand-gradient` clipped to text, and a soft drop shadow for depth. It appears in the header beside the unchanged logo and in the footer. It must never be used instead of the supplied logo, and it must not be inserted over or into the logo image. Keep it `nowrap` and scale it responsively; it may be hidden at narrow widths where space is tight.

## 3. Spacing and layout

| Token | Value | Utility | Purpose |
| --- | --- | --- | --- |
| `--spacing-gutter` | `clamp(1rem, 4vw, 2rem)` | `px-gutter`, `gap-gutter` | Fluid page gutter |
| `--spacing-section` | `4rem` | `py-section` | Mobile section rhythm |
| `--spacing-section-lg` | `6rem` | `py-section-lg` | Tablet/desktop section rhythm |
| `--container-page` | `80rem` | `max-w-page` | Maximum content width |
| `--radius-brand` | `0.5rem` | `rounded-brand` | Buttons, inputs, small controls |
| `--radius-card` | `1rem` | `rounded-card` | Layered cards, panels, media frames |

Use the standard Tailwind spacing scale inside sections. Prefer generous whitespace over decorative dividers.

## 4. Reusable conventions

| Class | Purpose |
| --- | --- |
| `container-page` | Centred page wrapper capped at `80rem` with the fluid gutter |
| `surface-dark` | Theme page base with heading text |
| `surface-panel` | Theme-aware elevated panel with champagne/body text and a soft shadow, used for cards, forms, and empty states |
| `surface-muted` | Theme-aware editorial band with body text |
| `surface-footer` | Theme-aware footer surface with body text, raised above the decorative background |
| `footer-logo-stage` | Fixed square stage that keeps the rotating footer logo inside the layout |
| `footer-logo-rotate` | `34s linear infinite` footer logo rotation; see §6 |
| `brand-wordmark` | Italic champagne-to-gold JS Jewellers text treatment; see §2.2 |
| `logo-plate` | Transparent in dark; adds a dark disc behind the unchanged logo in light |
| `theme-toggle` | Circular 44×44px icon-only theme control; see §5 |
| `card-3d` | Layered product/collection/category card with depth, border, and shadow; see §6 |
| `site-background` | Route-aware fixed decorative layer: Bright Gold Geometric Grid on the homepage, existing geometric grid elsewhere; see §6.1 |

Example page section:

```tsx
<section className="py-section md:py-section-lg">
  <div className="container-page">
    <p className="eyebrow">Collections</p>
    <h2 className="heading-editorial heading-gold mt-3 text-2xl md:text-3xl">
      Section title
    </h2>
    <p className="body-copy mt-4 max-w-prose text-base">Readable body copy.</p>
  </div>
</section>
```

Example panel with an accessible focus ring:

```tsx
<section className="surface-panel rounded-card border border-gold/25 p-6">
  <h2 className="heading-editorial heading-ivory text-2xl">Panel title</h2>
  <button className="mt-4 rounded-brand bg-gold px-5 py-3 text-sm text-on-gold focus-visible:outline-focus">
    Action
  </button>
</section>
```

### 4.1 Theme toggle

- A real `<button type="button">` in the header, 44×44px, icon-only, circular, with a gold/champagne border and hover lift.
- Shows a moon in the dark theme and a sun in the light theme. Both SVGs are `aria-hidden`; the button carries `aria-label` and `title` that describe the action (`Switch to light theme` / `Switch to dark theme`), so state is not communicated by colour alone.
- Keyboard activation uses the native button behaviour (Enter/Space). Focus uses the theme focus ring; hover and active add a small transform that is removed under reduced motion.
- Persists to `localStorage` under `js-theme`. An inline boot script in `app/layout.tsx` applies the stored value before first paint, so a light-theme visitor never sees a dark flash. `suppressHydrationWarning` covers the pre-paint `data-theme` attribute.
- React uses `useSyncExternalStore` with a dark server snapshot; icons are swapped by `html[data-theme]` CSS so there is no icon-state hydration mismatch. If storage is unavailable, the theme still applies for the session and the site defaults to dark.
- The toggle must remain available on every route and viewport.

### 4.2 Premium 3D cards

`.card-3d` is the shared shell for product, collection, category, and showcase cards. It provides:

- A thicker, layered appearance: `1px` gold-tinted border, `1rem` radius, theme panel gradient, elevation shadow, and a thin gold rule along the bottom edge.
- Clear separation between media, title, price/availability, and action via `.card-3d-media`, `.card-3d-body`, and `.card-3d-divider`.
- An optional flush media frame (`ProductImageFrame` `flush`) so the image and card share one rounded shell.
- Hover lift and a subtle perspective tilt on fine-pointer devices, shadow deepening, border brightening, and a `1.06` image zoom.
- A quick `1.02` press scale on activation, then a smooth CSS transition back to rest. No JavaScript delays navigation, no click handler intercepts the link, and keyboard activation uses the link's native behaviour.
- `:focus-within` produces the theme focus ring plus the elevated border/shadow, so keyboard users get the same affordance.
- No continuous animation on cards and no bouncing, flashing, or shaking.

## 5. Focus and interaction

- The global `:focus-visible` style is a 2px `--color-focus` outline with a 2px offset. It resolves to champagne in dark mode (15.02:1 on deep black) and espresso in light mode (12.88:1 on ivory).
- Controls on `surface-panel`, `surface-muted`, and `surface-footer` add `focus-visible:outline-focus`.
- Gold buttons use black text and the theme focus ring. The ring's offset keeps it on the surrounding page surface in both themes.
- Cards show a focus ring through `:focus-within`, matching the hover elevation without moving the page.
- Never remove the focus outline without supplying an equally visible replacement.
- Motion is limited and purposeful. See §6; `prefers-reduced-motion` disables non-essential animation and transitions.

## 6. Motion and animation

Owner-approved 5 November 2026. Motion is a presentation layer only. It must not change copy, navigation destinations, product data, prices, availability, business rules, or orderability.

| Feature | Implementation | Duration / easing | Constraint |
| --- | --- | --- | --- |
| Hero reveal | CSS fade/translate with a short stagger for eyebrow, heading, copy, actions, and artwork | Short stagger; total settle under one second | Content remains readable immediately |
| Gold shimmer | One-pass highlight sweep on selected gold buttons, triggered by hover, focus-visible, or active | One pass | No infinite loop, no flashing |
| Product image zoom | Controlled scale on the product-detail main image; hover/focus on pointer devices and tap/click toggle on touch | Transform only | Fixed 4:5 frame, no layout shift; Escape resets; alt text intact |
| Scroll reveal | One-shot fade/translate as sections enter the viewport | CSS view timeline | CSS-first with a visible no-JavaScript fallback; no replay |
| Navigation indicator | Gold underline that grows on hover, focus-visible, and the current page | Short transition | Existing destinations and mobile behaviour preserved |
| Page transition | Short fade/translate on route content after client navigation | Short | Never blocks or delays navigation; Back/Forward keep working |
| Footer logo rotation | Slow 360-degree rotation, one turn every 34 seconds | `34s linear infinite` | Approved continuous exception; fixed square stage; decorative only |
| Decorative backgrounds | Static CSS Bright Gold Geometric Grid on the homepage and the existing geometric grid on every other route | None | No continuous animation; `pointer-events: none`; clipped; reduced motion unaffected |
| Theme toggle | Hover lift `1.05`, icon rotate `14deg`, press `0.93` | `220ms` transform, `260ms` icon, `80ms` press | No layout change; stopped under reduced motion |
| Premium cards | Hover lift `6px` with `rotateX(1.2deg)`, image zoom `1.06`, press `1.02` | `260ms` card, `420ms` image, `90ms` press | Transform/opacity only; no delay to navigation; stopped under reduced motion |

Motion rules:

- Use CSS first. No animation library or new dependency is approved for this batch.
- Animate only `transform` and `opacity`; do not animate layout properties.
- Do not add continuous or infinite animation **except the approved footer logo rotation**. The shimmer runs only in response to interaction and never loops, and the decorative backgrounds are static.
- Do not cause horizontal overflow or layout shifts. Keep the 4:5 product frame and existing image aspect ratios.
- `prefers-reduced-motion: reduce` disables the hero reveal, shimmer, scroll reveal, navigation transitions, page transitions, card transforms/transitions, theme-toggle transforms, and the footer logo rotation. Content must remain visible and immediately readable. User-initiated product zoom may still change scale without an animated transition.
- Keep keyboard focus visible and preserve all existing focus-ring rules.
- Page transitions and card presses must remain non-blocking and must not interfere with browser Back/Forward or loading states.
- Avoid JavaScript animation loops; the footer rotation and shimmer are pure CSS, and the backgrounds use no animation at all.
- Keep card motion restrained: no continuous animation on every card, no bouncing, flashing, or shaking.

### 6.1 Route-aware decorative backgrounds

Owner-approved homepage update, 6 November 2026. The previous decorative starfield was removed completely. The homepage silk-wave layer was then superseded by the Bright Gold Geometric Grid; every non-homepage route keeps the existing Geometric Grid.

- **Homepage only — Bright Gold Geometric Grid:** `components/layout/BrightGoldGrid.tsx` renders a fixed, clipped, `aria-hidden` CSS-only layer. It uses a deep premium black `--home-grid-base`, 1px bright champagne-gold major lines, lower-opacity secondary lines, and restrained radial gold glows. Major cells are `56×48px` on mobile, `64×56px` from 768px, and `72×60px` from 1024px; the secondary lines sit on the half-cell offset. A soft top-left scrim keeps hero copy comfortable without hiding the grid. The `--home-grid-*` tokens switch to a warm ivory base and deeper gold lines in the light theme, so light mode never forces a black background.
- **Every other route — Geometric Grid retained:** `components/layout/GeometricGrid.tsx` keeps the existing CSS-only black-and-gold grid over the approved `172deg` theme gradient. Fine 24px lines and stronger 120px lines stay subtle, with a low-opacity gold glow at the page edges. The light theme uses restrained espresso-gold lines on ivory. It applies to collections, collection details, search, product pages, policy pages, and all future non-homepage routes. This homepage task does not change it.
- `components/layout/SiteBackground.tsx` selects the layer from `usePathname()`. The pathname resolves during server rendering, so the correct background is present on first paint and updates on client navigation. `components/layout/SilkWaves.tsx` remains in the repository but is no longer rendered.
- Both layers are `position: fixed`, `inset: 0`, `z-index: 0`, `overflow: hidden`, and `pointer-events: none`. Page content (`#main-content`) and the footer sit at `z-index: 1`.
- Both are decorative only: no text, jewellery, rings, logos, navigation, or controls. They use no image asset, no JavaScript animation loop, and no continuous animation, so reduced motion requires no background-specific override.
- The backgrounds must not obscure content, capture pointer events, create horizontal overflow, or carry the full reference screenshot; the CSS gradients are authored from the approved visual direction.
- The owner logo, hero artwork, hero text and CTAs, header/navigation, section order, cards, footer, typography, and theme toggle/persistence are unchanged by this background update.

## 7. Accessibility

- The theme toggle is a native button with `aria-label` and `title`, a 44×44px target, visible focus, and a non-colour state cue (different icon plus label).
- Decorative SVGs inside the toggle and the background layers are hidden from assistive technology.
- All interactive cards remain links with their original destinations and native keyboard activation; card decoration adds no focusable elements.
- Focus remains visible in both themes through `--color-focus`.
- Text and surface pairs are checked in both themes by `npm run check:contrast`.
- Reduced motion stops all decorative movement while keeping content visible.
- Content is never placed behind the decorative backgrounds, and the backgrounds cannot receive pointer events.

## 8. Verification

```bash
npm run check:contrast
npm run lint
npm run typecheck
npm run build
```

`npm run check:contrast` reads the colour tokens directly from both theme blocks in `app/globals.css`, so the documented ratios stay in sync with the implementation. The 5 November 2026 verification additionally checked every existing route at `1440×900`, `768×900`, `390×844`, and `320×700` in both themes: no horizontal or body overflow, no broken images, a 44×44px toggle on every route, content and footer above the decorative layer, an `h1` on every route, theme persistence across navigation and reload, keyboard/touch activation, no hydration or console errors, card hover/active/return behaviour, and reduced-motion overrides. The production catalogue remains intentionally empty, so product-card interaction could only be exercised on collection and category cards.

The earlier 6 November 2026 background-replacement verification (at that stage) covered 15 routes × 4 viewports × 2 theme passes (120 checks) at `1440×900`, `768×900`, `390×844`, and `320×700`. It confirmed the silk-wave layer on `/` only and the geometric grid on all 14 non-homepage paths, both layers `aria-hidden`, fixed, clipped, and `pointer-events: none`, with no starfield layers, star animations, horizontal overflow, or broken images. Content, header, footer, keyboard focus, and theme toggle remained above and usable, and client navigation switched silk → grid → silk correctly. Known limitation: the framework's 404 error shell (`/not-found` and unknown product/collection slugs) omits the root prepaint theme script and therefore renders in the default dark theme even when `js-theme` is light; the grid is still present there. Normal routes respond correctly to both themes.

The later 6 November 2026 Bright Gold Geometric Grid verification covered the homepage at `375×812`, `390×844`, `768×900`, `1366×900`, and `1440×900` in both dark and light themes. It confirmed the bright-gold layer on `/` only, `aria-hidden="true"`, `position: fixed`, clipped to the viewport, `pointer-events: none`, `z-index: 0`, and no animation. There was no horizontal or body overflow; `/collections` and `/search` retained the existing `geometric-grid`; the header, footer, hero copy, Shop Now and Search links, logo, hero artwork, and 44×44px theme toggle remained present and loaded. The light theme kept its warm ivory base with deep-gold lines, the toggle persisted `js-theme` across reload, the hero CTA navigated to `/collections`, and reduced motion left the background static. The repository TypeScript and production build checks also pass (exit 0), so T006A is DONE.

The 7 November 2026 premium typography verification covered 7 routes (`/`, `/collections`, `/collections/womens-jewellery`, `/search`, `/privacy`, `/returns`, `/not-found`) at `375×812`, `390×844`, `768×900`, `1366×900`, and `1440×900` in both themes: 70 checks, no failures. Confirmed: the homepage hero is the only `h1` and the largest heading at every viewport (41.6px, 42.08px, 54.176px, 73.312px, 75.68px; weight 800, italic); its colour is `#E8DCC5` in dark and `#7A5A1E` in light; page and section headings are italic display faces while body copy, navigation, the hero CTA, and controls are upright; no horizontal document or body overflow, no clipped text, no heading offscreen, no hero/artwork overlap, no broken images after lazy-loading, and a 44×44px theme toggle on every route. The hero's larger `scrollHeight` is italic glyph ink overflow with `overflow: visible`, not clipping. `npm run lint`, `npm run typecheck`, `npm run check:contrast` (43/43), and `npm run build` all pass. Two limitations are unchanged and unrelated to typography: the framework 404 error shell (`/not-found` and unknown slugs) re-renders the root shell in the default dark theme even when `js-theme` is light, and the production catalogue remains intentionally empty, so live product cards/detail pages could not be browser-exercised. The five recorded `/not-found` theme entries are therefore known limitations, not typography failures.

## 9. Administration panel — Green & White

Owner-requested redesign, 17 November 2026. The private administration area now uses a modern Emerald Green and White dashboard while the public storefront keeps the approved Black Gold Galaxy theme unchanged. The Cartsy screenshot supplied by the owner was used only as a layout and interaction reference; no Cartsy branding, logo, copy, or asset was copied.

### 9.1 Scope and isolation

- Every admin rule is scoped to `.admin-shell`, which wraps only `/admin/**` screens. Public routes never receive admin styles.
- `app/globals.css` remaps the existing semantic utilities (`gold`, `champagne`, `charcoal`, `obsidian`, `accent`, `focus`, and related theme variables) to the admin palette **inside** `.admin-shell`. Existing admin pages therefore inherit the new look without changing their business markup or server logic.
- Shared primitives such as `panelClass`, `inputClass`, `buttonPrimary`, and `Notice` remain unchanged globally, so the storefront and checkout are unaffected.
- The storefront theme toggle and Black Gold tokens are untouched; the admin panel always renders light with its own `color-scheme: light`.

### 9.2 Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--admin-bg` | `#f4f7f5` | Off-white app background |
| `--admin-surface` | `#ffffff` | Cards, sidebar, topbar |
| `--admin-surface-muted` | `#f8fafc` | Table headings, quiet rows |
| `--admin-text` | `#0f172a` | Headings and primary values |
| `--admin-text-soft` | `#334155` | Body copy |
| `--admin-text-muted` | `#64748b` | Secondary labels and hints |
| `--admin-border` | `#e2e8e5` | Subtle borders and separators |
| `--admin-primary` | `#059669` | Emerald accents, active indicators |
| `--admin-primary-strong` | `#047857` | Links, actions, icon emphasis |
| `--admin-forest` | `#064e3b` | Dark forest logo plate and active text |
| `--admin-primary-soft` | `#ecfdf5` | Active nav background, soft success |
| `--admin-focus` | `#065f46` | Keyboard focus ring |

Cards use white surfaces, `0.875rem` radii, a one-pixel `--admin-border` and a restrained shadow. Tables use a white `admin-table-wrap` with a muted uppercase header row, subtle row separators, and a hover tint.

### 9.3 Layout and navigation

- `components/admin/AdminChrome.tsx` is the client shell: collapsible desktop sidebar, sticky top header, breadcrumb and page title, existing permission-aware search, existing payment/return notification links, profile menu, sign-out, and mobile navigation.
- Sidebar collapse persists in `localStorage` under `js-admin-sidebar` through `useSyncExternalStore`, so there is no hydration-time state write or layout flash.
- `components/admin/AdminNav.tsx` keeps the existing navigation groups, labels, destinations, permission filtering, and exact-match rules. `AdminNavIcon.tsx` supplies inline SVG icons for every existing destination, so no icon dependency was added.
- Active state is a soft emerald background, forest text, and a 3px inset primary bar. Collapsed mode keeps icons and accessible labels; mobile mode always shows full labels.
- `components/admin/AdminMobileNav.tsx` provides the same groups in an expandable panel beneath the header.
- The skip link targets `#admin-content`. The sidebar and topbar are hidden in print, and the main region keeps a visible heading structure.

### 9.4 Shared components and auth

- `AdminPageHeader`, `AdminBreadcrumbs`, `AdminEmptyState`, `AdminTable`/`AdminTh`/`AdminTd`, and `StatusPill` use the admin palette. Existing pages that already used these components inherit the redesign.
- Manual tables in audit, products, orders (list and detail), and suppliers (list and detail) use `admin-table-wrap` for horizontal scrolling and a consistent card frame.
- `AdminAuthShell` gives `/admin/login`, `/admin/setup`, `/admin/mfa`, `/admin/mfa/verify`, and `/admin/mfa/codes` a shared white card on a soft green-tinted background, with the owner logo on a dark forest plate.
- `PasswordInput` adds an accessible show/hide control to existing password fields; it changes no authentication or validation behaviour.
- Existing form, validation, error, loading, empty, and permission logic is preserved. Only presentation classes and safe UI controls changed.

### 9.5 Covered routes

Dashboard, reports, products (list/new/edit/preview), categories, brands, inventory, orders (list/detail), returns, customers (list/detail), suppliers (list/detail), content (list/editor/homepage), navigation, media, SEO, business/payments/shipping/notifications settings, users (list/detail), roles, audit, account, search, login, first-run setup, MFA enrolment, MFA verification, and recovery codes.

### 9.6 Accessibility and responsive behaviour

- Green primary actions keep white text; the admin token remap deliberately makes ordinary `text-white` resolve to dark body text on white cards.
- Contrast is verified for the admin palette separately from the storefront palettes: headings, body, muted text, links, primary buttons, focus rings, and all warning/danger/info/success tints pass 4.5:1 for text and 3:1 for UI/focus.
- Tables scroll horizontally inside `admin-table-wrap` rather than forcing page-level overflow.
- Sidebar labels truncate safely, the topbar wraps controls on narrow screens, and the profile menu uses native `<details>` behaviour.
- `prefers-reduced-motion` removes non-essential transitions; no admin animation is required for comprehension.

### 9.7 Verification (17 November 2026)

- `npm run typecheck` — exit 0.
- `npm run lint` — exit 0.
- `npm test` — 245 passed, 0 failed.
- `npm run build` — exit 0, 67 pages generated.
- `npm run check:contrast` — all storefront checks unchanged and all 14 new administration pairs pass.
- `npm run check:contrast` now reads `--admin-*` values directly from the `.admin-shell` block, so the documented admin ratios stay in sync with the implementation.

**Limitations:** no administrator account exists in the local environment, so authenticated admin screens could not be browser-driven or screenshot-reviewed. The redesign was verified through static compilation, permission-aware route generation, the production build, token contrast checks, and unauthenticated HTTP checks: `/admin/setup` rendered the Green & White auth shell at HTTP 200, while `/admin/login` and `/admin/mfa/verify` redirected to setup and `/admin`, `/admin/orders`, and `/admin/account` redirected to the sign-in flow. Database schema, migrations, payment/order/product/return logic, permissions, API behaviour, and the storefront were not modified.

