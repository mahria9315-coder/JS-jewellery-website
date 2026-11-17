"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "js-theme";

type Theme = "dark" | "light";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function getSnapshot(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

// Server (and hydration) always starts dark; the pre-paint boot script applies
// the persisted theme, and useSyncExternalStore reconciles to it after mount.
function getServerSnapshot(): Theme {
  return "dark";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

/**
 * Circular, icon-only dark/light toggle.
 *
 * Icons are swapped with CSS (`html[data-theme]`) rather than React state, so
 * a persisted light theme never flashes a moon icon. React only owns the
 * accessible label and persistence, which keeps hydration deterministic.
 */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggleTheme() {
    const next: Theme = theme === "light" ? "dark" : "light";

    applyTheme(next);

    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable (private mode); the theme still applies.
    }

    emitChange();
  }

  const label =
    theme === "light" ? "Switch to dark theme" : "Switch to light theme";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={label}
      title={label}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="theme-toggle__icon theme-toggle__icon--moon"
      >
        <path d="M20.1 14.2A8.2 8.2 0 0 1 9.8 3.9a8.4 8.4 0 1 0 10.3 10.3Z" />
        <path d="M18.4 3.8v2.4M17.2 5h2.4" />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="theme-toggle__icon theme-toggle__icon--sun"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2.2M12 19.8V22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2 12h2.2M19.8 12H22M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
      </svg>
    </button>
  );
}
