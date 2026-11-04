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

const colours = Object.fromEntries(
  ["obsidian", "charcoal", "gold", "champagne", "white"].map((token) => [
    token,
    readColour(token),
  ]),
);

const checks = [
  { label: "Body text on white", fg: "obsidian", bg: "white", min: 4.5 },
  { label: "Secondary text on white", fg: "charcoal", bg: "white", min: 4.5 },
  { label: "Text on champagne", fg: "obsidian", bg: "champagne", min: 4.5 },
  { label: "Text on obsidian", fg: "white", bg: "obsidian", min: 4.5 },
  { label: "Text on charcoal", fg: "white", bg: "charcoal", min: 4.5 },
  { label: "Champagne on obsidian", fg: "champagne", bg: "obsidian", min: 4.5 },
  { label: "Gold accent on obsidian", fg: "gold", bg: "obsidian", min: 4.5 },
  { label: "Gold accent on charcoal", fg: "gold", bg: "charcoal", min: 4.5 },
  { label: "Obsidian text on gold button", fg: "obsidian", bg: "gold", min: 4.5 },
  { label: "Focus ring: obsidian on white (UI)", fg: "obsidian", bg: "white", min: 3 },
  { label: "Focus ring: champagne on obsidian (UI)", fg: "champagne", bg: "obsidian", min: 3 },
];

const restricted = { label: "Gold on white (must stay decorative)", fg: "gold", bg: "white", max: 3 };

let failed = false;

console.log("WCAG contrast checks\n");

for (const check of checks) {
  const ratio = contrastRatio(colours[check.fg], colours[check.bg]);
  const passed = ratio >= check.min;
  failed ||= !passed;

  console.log(
    `${passed ? "PASS" : "FAIL"}  ${check.label}: ${ratio.toFixed(2)}:1 (minimum ${check.min}:1)`,
  );
}

const restrictedRatio = contrastRatio(colours[restricted.fg], colours[restricted.bg]);
const restrictedPassed = restrictedRatio < restricted.max;
failed ||= !restrictedPassed;

console.log(
  `${restrictedPassed ? "PASS" : "FAIL"}  ${restricted.label}: ${restrictedRatio.toFixed(2)}:1 (must be below ${restricted.max}:1)`,
);

if (failed) {
  console.error("\nContrast checks failed.");
  process.exit(1);
}

console.log("\nAll contrast checks passed.");
