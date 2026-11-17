import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(resolve(root, "app/globals.css"), "utf8");

function readColour(token) {
  const pattern = new RegExp(`--color-${token}:\\s*(#[0-9a-fA-F]{6})\\b`);
  const match = css.match(pattern);

  if (!match) {
    throw new Error(`Missing or invalid --color-${token} in app/globals.css`);
  }

  return match[1].toLowerCase();
}

function readBlock(selector) {
  const pattern = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([\\s\\S]*?)\\}`);
  const match = css.match(pattern);

  if (!match) {
    throw new Error(`Missing ${selector} block in app/globals.css`);
  }

  return match[1];
}

function readThemeColour(block, token) {
  const pattern = new RegExp(`--${token}:\\s*(#[0-9a-fA-F]{6})\\b`);
  const match = block.match(pattern);

  if (!match) {
    throw new Error(`Missing or invalid --${token} in the theme block`);
  }

  return match[1].toLowerCase();
}

function channelToLinear(value) {
  const channel = value / 255;
  return channel <= 0.04045
    ? channel / 12.92
    : Math.pow((channel + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;

  return (
    0.2126 * channelToLinear(red) +
    0.7152 * channelToLinear(green) +
    0.0722 * channelToLinear(blue)
  );
}

function contrastRatio(first, second) {
  const lighter = Math.max(luminance(first), luminance(second));
  const darker = Math.min(luminance(first), luminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

/*
 * Black Gold Galaxy palette, owner-approved 5 November 2026.
 *
 * The seven brand colours stay exact. Surface and text tokens resolve per
 * theme, so the dark and light palettes are read from their own CSS blocks and
 * checked separately. Gold Shadow, Brown, Bronze, and Antique are
 * surface/decorative colours; text uses heading, body, or the dark-gold accent.
 */
const darkBlock = readBlock(":root");
const lightBlock = readBlock('html[data-theme="light"]');

function paletteFrom(block, extras) {
  return {
    obsidian: readThemeColour(block, "theme-page"),
    charcoal: readThemeColour(block, "theme-elevated"),
    "gold-shadow": readThemeColour(block, "theme-gold-shadow"),
    brown: readThemeColour(block, "theme-muted"),
    bronze: readThemeColour(block, "theme-bronze"),
    champagne: readThemeColour(block, "theme-body"),
    white: readThemeColour(block, "theme-heading"),
    accent: readThemeColour(block, "theme-accent"),
    focus: readThemeColour(block, "theme-focus"),
    headingHero: readThemeColour(block, "theme-heading-hero"),
    headingPrimary: readThemeColour(block, "theme-heading-primary"),
    headingSecondary: readThemeColour(block, "theme-heading-secondary"),
    headingProduct: readThemeColour(block, "theme-heading-product"),
    ...extras,
  };
}

const shared = {
  gold: readColour("gold"),
  "gold-strong": readColour("gold-strong"),
  antique: readColour("antique"),
  "on-gold": readColour("on-gold"),
};

const dark = paletteFrom(darkBlock, shared);
const light = paletteFrom(lightBlock, shared);

const darkChecks = [
  // Body and secondary copy on every approved dark surface.
  { label: "White on deep black", fg: "white", bg: "obsidian", min: 4.5 },
  { label: "Champagne on deep black", fg: "champagne", bg: "obsidian", min: 4.5 },
  { label: "Champagne on charcoal", fg: "champagne", bg: "charcoal", min: 4.5 },
  { label: "Champagne on dark gold shadow", fg: "champagne", bg: "gold-shadow", min: 4.5 },
  { label: "Champagne on dark brown", fg: "champagne", bg: "brown", min: 4.5 },
  { label: "Champagne on bronze", fg: "champagne", bg: "bronze", min: 4.5 },
  { label: "White on bronze", fg: "white", bg: "bronze", min: 4.5 },

  // Heading hierarchy on the homepage base and dark page surface.
  { label: "Hero champagne-gold heading on deep black", fg: "headingHero", bg: "obsidian", min: 4.5 },
  { label: "Primary warm-gold heading on deep black", fg: "headingPrimary", bg: "obsidian", min: 4.5 },
  { label: "Secondary ivory heading on deep black", fg: "headingSecondary", bg: "obsidian", min: 4.5 },
  { label: "Product heading neutral on deep black", fg: "headingProduct", bg: "obsidian", min: 4.5 },

  // Luxury Gold is approved for normal text on dark surfaces.
  { label: "Luxury Gold on deep black", fg: "gold", bg: "obsidian", min: 4.5 },
  { label: "Luxury Gold on charcoal", fg: "gold", bg: "charcoal", min: 4.5 },
  { label: "Luxury Gold on dark gold shadow", fg: "gold", bg: "gold-shadow", min: 4.5 },
  { label: "Luxury Gold on dark brown", fg: "gold", bg: "brown", min: 4.5 },
  /* Owner rule: gold on bronze only for large text or short labels. */
  { label: "Luxury Gold on bronze (large text/short labels only)", fg: "gold", bg: "bronze", min: 3 },

  // Gold buttons and champagne surfaces.
  { label: "Deep black text on Luxury Gold", fg: "on-gold", bg: "gold", min: 4.5 },
  { label: "Deep black text on gold hover", fg: "on-gold", bg: "gold-strong", min: 4.5 },
  { label: "Deep black text on champagne", fg: "on-gold", bg: "champagne", min: 4.5 },

  // Focus indicators are offset onto the surrounding dark page.
  { label: "Focus ring: champagne on deep black (UI)", fg: "focus", bg: "obsidian", min: 3 },
  { label: "Focus ring: white on deep black (UI)", fg: "white", bg: "obsidian", min: 3 },
  { label: "Focus ring: champagne on charcoal (UI)", fg: "focus", bg: "charcoal", min: 3 },
];

const lightChecks = [
  // Dark espresso text on ivory surfaces.
  { label: "Heading on warm ivory page", fg: "white", bg: "obsidian", min: 4.5 },
  { label: "Body on warm ivory page", fg: "champagne", bg: "obsidian", min: 4.5 },
  { label: "Body on ivory elevated card", fg: "champagne", bg: "charcoal", min: 4.5 },
  { label: "Body on muted band", fg: "champagne", bg: "brown", min: 4.5 },
  { label: "Body on bronze-tint band", fg: "champagne", bg: "bronze", min: 4.5 },

  // Heading hierarchy on the warm ivory page.
  { label: "Hero deep-gold heading on warm ivory", fg: "headingHero", bg: "obsidian", min: 4.5 },
  { label: "Primary deep-gold heading on warm ivory", fg: "headingPrimary", bg: "obsidian", min: 4.5 },
  { label: "Secondary espresso heading on warm ivory", fg: "headingSecondary", bg: "obsidian", min: 4.5 },
  { label: "Product espresso heading on warm ivory", fg: "headingProduct", bg: "obsidian", min: 4.5 },

  // Readable deep-gold accent for headings, prices, and links.
  { label: "Deep-gold accent on page", fg: "accent", bg: "obsidian", min: 4.5 },
  { label: "Deep-gold accent on elevated card", fg: "accent", bg: "charcoal", min: 4.5 },
  { label: "Deep-gold accent on muted band", fg: "accent", bg: "brown", min: 4.5 },

  // Premium gold buttons with black text in both themes.
  { label: "Deep black text on Luxury Gold", fg: "on-gold", bg: "gold", min: 4.5 },
  { label: "Deep black text on gold hover", fg: "on-gold", bg: "gold-strong", min: 4.5 },

  // Focus ring offset onto the ivory page.
  { label: "Focus ring: espresso on page (UI)", fg: "focus", bg: "obsidian", min: 3 },
  { label: "Focus ring: espresso on elevated card (UI)", fg: "focus", bg: "charcoal", min: 3 },
];

/*
 * Pairs that must stay below the normal-text threshold so they are only used
 * as decoration. `max` is exclusive.
 */
const darkRestricted = [
  { label: "Luxury Gold on white (decorative only)", fg: "gold", bg: "white", max: 3 },
  { label: "Antique Gold on deep black (decorative only)", fg: "antique", bg: "obsidian", max: 4.5 },
  { label: "Antique Gold on dark brown (decorative only)", fg: "antique", bg: "brown", max: 4.5 },
  { label: "Antique Gold on bronze (not a border/UI colour)", fg: "antique", bg: "bronze", max: 3 },
];

const lightRestricted = [
  // Raw Luxury Gold is not used for body text on ivory; the accent token is.
  { label: "Raw Luxury Gold on ivory page (decorative only)", fg: "gold", bg: "obsidian", max: 3 },
];

let failed = false;

function runChecks(palette, heading, checks, restricted) {
  console.log(`WCAG contrast checks — ${heading}\n`);

  for (const check of checks) {
    const ratio = contrastRatio(palette[check.fg], palette[check.bg]);
    const passed = ratio >= check.min;
    failed ||= !passed;

    console.log(
      `${passed ? "PASS" : "FAIL"}  ${check.label}: ${ratio.toFixed(2)}:1 (minimum ${check.min}:1)`,
    );
  }

  for (const check of restricted) {
    const ratio = contrastRatio(palette[check.fg], palette[check.bg]);
    const passed = ratio < check.max;
    failed ||= !passed;

    console.log(
      `${passed ? "PASS" : "FAIL"}  ${check.label}: ${ratio.toFixed(2)}:1 (must be below ${check.max}:1)`,
    );
  }

  console.log("");
}

runChecks(dark, "Black Gold Galaxy (dark, default)", darkChecks, darkRestricted);
runChecks(light, "Ivory & Gold (light, opt-in)", lightChecks, lightRestricted);

if (failed) {
  console.error("Contrast checks failed.");
  process.exit(1);
}

console.log("All contrast checks passed.");
