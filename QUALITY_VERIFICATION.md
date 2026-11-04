# Quality Verification — Responsive, Accessibility, and Performance (T040/T041)

**Date:** 4 November 2026
**Build under test:** production (`next build` + `next start`), Next.js 16.4.5
**Result:** T040 and T041 acceptance criteria pass. Four verified defects were fixed; no unverified changes were made.

This document records what was tested, how, what was found, what changed, and what remains unverified. It is evidence for `tasks.md` T040 and T041.

---

## 1. Environment

| Item | Value |
| --- | --- |
| OS | Windows (`win32`), local machine |
| Node.js | 24.21.0 |
| npm | 11.19.0 |
| Browser | Google Chrome, headless mode via Chrome DevTools Protocol |
| Server | `next start` on `http://127.0.0.1:3100` |
| Mobile profile | 375x812, DPR 1, 150 ms latency, 1.6 Mbps down / 750 kbps up, 4x CPU throttle, cold cache |
| Desktop profile | 1440x1000, DPR 1, no network throttle (localhost), no CPU throttle, cold cache |
| Accessibility engine | axe-core 4.14.0 (transitive dev dependency), WCAG 2.0/2.1/2.2 A+AA and best-practice rules |
| Harness | External Node scripts using the WebSocket CDP API; no package was added to the project |

Raw artifacts (not committed): `C:\Users\lapstore\AppData\Local\Temp\opencode\t040-t041\`, `...\responsive-diag\`, `...\perf-runs\`.

---

# T040 — Responsive design and accessibility

## 2. Test matrix

Responsive layout was measured at 11 widths:

`320, 360, 375, 414, 640, 767, 768, 834, 1024, 1280, 1440` px

on four routes:

- `/`
- `/collections`
- `/collections/customized-name-jewellery`
- `/search`

The full accessibility scan (DOM semantics + axe-core) ran at five viewports:

`320x640`, `375x812`, `768x1024`, `1280x900`, `1440x1000`

on six pages:

- `/`
- `/collections`
- `/collections/womens-jewellery`
- `/search`
- `/search?q=necklace&collection=rings&availability=in_stock&sort=price-asc`
- `/products/does-not-exist` (branded 404)

## 3. Results

### Layout

| Check | Result |
| --- | --- |
| Horizontal page overflow | 0 px at every width and route |
| Header overlap | none at any width; logo and navigation/button never intersect |
| Navigation breakpoint | desktop nav appears at 768 px; mobile toggle below 768 px |
| Mobile menu | hidden until opened; opens on click; Escape closes it; focus returns to the toggle |
| Grid behaviour | collection and category grids collapse to one column on mobile and expand without overflow |
| Touch targets | every visible control is at least 24x24 CSS px (WCAG 2.2 AA target-size minimum); primary actions are 44 px high. The only sub-24 px element is the visually hidden skip link, which becomes a 44 px-high control when focused |
| Clipped-element heuristic | only two expected cases: the hidden skip link and the decorative hero rings inside an `overflow-hidden` figure. Neither causes page overflow |
| Long content | breadcrumbs wrap; search controls stack; footer columns stack |

Screenshots were captured for mobile, tablet, and desktop, but the agent could not visually inspect them. Acceptance therefore relies on DOM geometry, computed styles, keyboard traversal, and automated accessibility results, which are stronger for the specific checks above but do not replace a designer's visual review.

### Semantics and labelling

| Check | Result |
| --- | --- |
| Exactly one `h1` per page | pass on all six pages |
| One `main`, one `header`, one `footer` | pass |
| Landmarks named | primary, mobile primary, breadcrumb, footer shop, footer collections, footer policies |
| Document language | `lang="en"` |
| Form fields labelled | 0 unlabelled fields; search input and two selects use `<label for>` |
| Duplicate IDs | none |
| Generic link text | none |
| Image `alt` | no `<img>` elements exist yet because no approved product images exist. Code-level review confirmed `next/image` receives a required `alt` from the `ProductImage` type and the placeholder is `aria-hidden` |
| Decorative graphics | marked `aria-hidden` |
| Current page | exactly one page link per navigation is `aria-current="page"` after the fix; breadcrumb current item is a non-link span |
| Skip link | focusable; activating it moves keyboard focus to `MAIN` after the fix |
| axe-core violations | 0 on all 30 page/viewport combinations after fixes (was 1 serious rule, 2 nodes, on every page) |

### Keyboard and focus

| Check | Result |
| --- | --- |
| Tab order | follows visual order through skip link, header, main, footer |
| Focus visible | every stop had a 2 px solid outline; no stop relied on colour alone |
| Focus contrast | obsidian ring on light surfaces (19.91:1), champagne ring on dark/footer surfaces (14.67:1); both exceed the 3:1 UI minimum |
| Skip link visibility | hidden until focused, then rendered at the top-left with a visible ring |
| Mobile menu | Escape closes and restores focus; the toggle exposes `aria-expanded` and `aria-controls` |
| Focus trap | not implemented, deliberately: the mobile menu is a disclosure, not a modal dialog, so Tab may leave it |
| Transition side effect | `transition-colors` briefly animates outline colour on some links, but the ring remains visible throughout |

## 4. Verified defects fixed

### D1 — Logo accessible name did not contain its visible text

- **Found by:** axe rule `label-content-name-mismatch` (serious), 2 nodes per page (header and footer logo).
- **Cause:** both visible logo spans were `aria-hidden`, and the link used `aria-label="J's Jewellery home"`. The visible "J's Jewellery" text was excluded from the accessible name calculation.
- **Fix:** removed `aria-hidden` from the two visible text spans in `components/layout/SiteLogo.tsx`. The link keeps its descriptive `aria-label`.
- **Verified:** accessible name is "J's Jewellery home", visible text is "J's Jewellery", axe violation count is 0.
- **Constraint preserved:** the 9.6 px "Jewellery" wordmark remains decorative in size; it is real text, not an image.

### D2 — Skip link did not move keyboard focus

- **Found by:** keyboard activation of "Skip to content" changed the URL hash but left `document.activeElement` on `BODY`.
- **Cause:** the `main` target was not focusable.
- **Fix:** `app/layout.tsx` now sets `tabIndex={-1}` on `main#main-content` and uses `focus:outline-none` so the programmatic target does not show a misleading ring.
- **Verified:** after Enter or click, `document.activeElement` is `MAIN#main-content`.
- **Note:** browsers still scroll the target; the fix adds the missing focus move expected by keyboard and screen-reader users.

### D3 — Two navigation links marked as the current page

- **Found by:** on `/collections/customized-name-jewellery`, both "Collections" and "Customized Name" had `aria-current="page"` in each navigation.
- **Cause:** `pathname.startsWith(href)` marked the parent collection route as current as well as the specific child.
- **Fix:** `components/layout/SiteHeader.tsx` now selects the longest matching link once and marks only that link. Matching uses exact equality or a `/` boundary, so `/search` does not match an unrelated prefix.
- **Verified:** exactly one current page link per visible navigation on `/`, `/collections`, `/collections/customized-name-jewellery`, and `/search`, at desktop and with the mobile menu open.

## 5. T040 limitations

- No real product images exist, so runtime image `alt` behaviour and image layout could only be reviewed in code.
- Automated axe results do not replace manual screen-reader testing (NVDA/JAWS/VoiceOver) or expert WCAG review. No formal conformance claim is made.
- The agent could not visually inspect screenshots; geometry and computed styles were used instead.
- Contrast is verified for the documented token pairs (12 checks) and measured focus rings. Hover, disabled, and future data-driven states are not exhaustively covered.
- Browser coverage is Chrome only. Safari and Firefox were not tested.
- 24 px is the WCAG 2.2 AA minimum, not the 44 px comfort target; several secondary links are between 24 and 44 px.
- Broken future links (`/cart`, `/privacy`, `/returns`) remain by design until T017/T029.

---

# T041 — Performance

## 6. Method

- Production build served by `next start`; no dev-mode overhead.
- Fresh Chrome profile and cleared cache before every run.
- Three cold runs per page and profile; the table reports the median, with min/max for LCP.
- Metrics collected from the browser: Navigation Timing, Paint Timing, LCP, CLS, long tasks (TBT approximation), resource sizes, and CDP task/script/layout timings.
- Pages: `/`, `/collections`, `/collections/womens-jewellery`, `/search`.
- Mobile profile is a synthetic slow-4G/4x-CPU approximation, not a real device or field data.

## 7. Results — median of three cold runs

### Mobile (375x812, slow 4G, 4x CPU)

| Page | TTFB | FCP | LCP | CLS | TBT | Transfer | JS | Requests |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 20 ms | 568 ms | 568 ms | 0 | ~0 ms | 162 KB | 142 KB | 14 |
| `/collections` | 26 ms | 504 ms | 504 ms | 0 | ~0 ms | 164 KB | 142 KB | 16 |
| `/collections/womens-jewellery` | 18 ms | 548 ms | 548 ms | 0 | ~0 ms | 167 KB | 142 KB | 18 |
| `/search` | 20 ms | 600 ms | 600 ms | 0 | ~0 ms | 164 KB | 142 KB | 11 |

Homepage LCP across the three runs: 560 ms / 568 ms / 1024 ms. The first run is a warm-up outlier; the target in `spec.md` §18 is under 3 seconds on a typical mobile connection, and every run is well inside it.

### Desktop (1440x1000, localhost, no throttle)

| Page | TTFB | FCP | LCP | CLS | TBT | Transfer | JS | Requests |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 14 ms | 156 ms | 156 ms | 0 | ~0 ms | 167 KB | 142 KB | 18 |
| `/collections` | 15 ms | 120 ms | 120 ms | 0 | ~0 ms | 168 KB | 142 KB | 21 |
| `/collections/womens-jewellery` | 17 ms | 128 ms | 128 ms | 0 | ~0 ms | 171 KB | 142 KB | 22 |
| `/search` | 26 ms | 152 ms | 152 ms | 0 | ~0 ms | 172 KB | 142 KB | 16 |

LCP is always the page heading or lead paragraph, never an image. There are no third-party scripts, fonts, analytics, or trackers.

### Transfer breakdown (first run per profile)

| Page | Document | JS | CSS | Images |
| --- | --- | --- | --- | --- |
| `/` | 6 KB | 142 KB | 8 KB | 0 KB |
| `/collections` | 5 KB | 142 KB | 8 KB | 0 KB |
| `/collections/womens-jewellery` | 5 KB | 142 KB | 8 KB | 0 KB |
| `/search` | 10 KB | 142 KB | 8 KB | 0 KB |

The 142 KB of compressed JavaScript is the shared Next.js/React baseline. The two largest chunks are approximately 72 KB and 47 KB. Desktop makes 3-4 extra small RSC prefetch requests for visible links (about 5-8 KB); mobile makes fewer because less is in view.

## 8. JavaScript review

- Only `components/layout/SiteHeader.tsx` is a client component. It needs `usePathname` for current-page state and local state for the mobile disclosure.
- Search is a native GET form with server-side filtering; it works without client JavaScript. Hydration is still part of the shared Next.js bundle.
- No component imports a date, chart, icon, animation, or UI library. No third-party runtime is loaded.
- No safe further reduction was identified without changing the framework baseline or removing required navigation behaviour. Shipping less React would be a framework change, not a T041 fix.

## 9. Images and loading

- There are no product images yet (`public/` is empty aside from `.gitkeep`), so no image bytes are transferred and image optimisation cannot be measured.
- `components/catalogue/ProductImageFrame.tsx` and `ProductDetail.tsx` already use `next/image` with `fill`, responsive `sizes`, and a `priority` option.
- The image frame has a fixed 4:5 aspect ratio, so future images should not shift layout.
- The no-image placeholder is an inline `aria-hidden` SVG, not a fake product photo.
- Real image weight, responsive variants, and LCP-image behaviour must be verified after approved images exist (T012/T014).

## 10. Verified defect fixed

### D4 — `/search` layout shift from a Suspense fallback swap

- **Found by:** 0.1706 CLS on desktop `/search` in every cold run. The shift source was the footer being pushed when the "Loading search…" fallback was replaced by the results panel.
- **Cause:** the search results read `searchParams` inside `<Suspense>`, so the shell painted the short fallback first and the final content later. That is a real, repeatable layout shift, not throttling noise.
- **Fix:**
  - `app/search/page.tsx` now declares `export const instant = false`, awaits `searchParams`, and renders the final content directly; the Suspense fallback was removed.
  - `components/catalogue/SearchExperience.tsx` now accepts the resolved parameter object synchronously.
- **Verified:** CLS is 0 on `/search` in all three mobile and all three desktop runs; the initial HTML contains the final heading, form, and empty state, and no "Loading search" text.
- **Trade-off:** `/search` is now a dynamic route (`ƒ`) instead of partially prerendered. That is appropriate because the content depends on the query string. Measured local TTFB stayed at 20-26 ms.
- **No regression:** the other pages remain static or partially prerendered and still report CLS 0.

## 11. T041 limitations

- Measurements come from localhost and synthetic throttling; they are not field data (no CrUX/Lighthouse field metrics) and do not guarantee performance on real low-end devices or real mobile networks.
- Only Chrome was measured. Safari/Firefox behaviour, especially font and paint timing, may differ.
- Homepage mobile LCP varied (560-1024 ms) across cold runs; the median is reported and the worst run is disclosed.
- The catalogue is empty and no images exist, so the heaviest expected production cost — product imagery — is not represented.
- TBT is approximated from long tasks and was effectively 0 ms; no interaction latency (INP) was measured because no interactive customer flow exists yet.
- Adding cart, checkout, admin, analytics, or real images will change these numbers and require re-measurement (T038/T042).
- No performance budget or CI regression gate exists yet.

---

## 12. Checks run after the fixes

| Check | Result |
| --- | --- |
| `npm run lint` | pass |
| `npm run typecheck` | pass |
| `npm run check:contrast` | 12/12 pass |
| `npm run build` | pass, 16/16 pages |
| axe-core | 0 violations, 30 page/viewport combinations |
| Responsive matrix | 0 horizontal overflow, 11 widths x 4 routes |
| CLS | 0 on all measured pages/profiles |
| Keyboard walk | every stop focus-visible; skip link focuses `MAIN`; mobile Escape restores focus |
