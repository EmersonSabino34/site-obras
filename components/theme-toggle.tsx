"use client";

import { useLayoutEffect } from "react";

import { THEME_STORAGE_KEY } from "@/lib/theme";

import { MoonIcon, SunIcon } from "./icons";

type Labels = { toDark: string; toLight: string; dark: string; light: string };

function applySavedTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "dark" || saved === "light") document.documentElement.setAttribute("data-theme", saved);
  } catch {
    // localStorage unavailable (private mode): keep the default.
  }
}

function toggleTheme() {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Not persisted, but still applied for this visit.
  }
}

/**
 * Sun/moon button. Which icon/label shows is decided by CSS (dark: variant),
 * so the server HTML never mismatches the visitor's saved theme.
 */
export function ThemeToggle({
  labels,
  variant = "icon",
  className = "",
}: {
  labels: Labels;
  variant?: "icon" | "row";
  className?: string;
}) {
  // React's dev remount resets <html> attributes; re-apply the saved theme before paint.
  useLayoutEffect(applySavedTheme, []);

  if (variant === "row") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`flex w-full items-center justify-center gap-2.5 rounded-lg border border-white/20 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-white/5 ${className}`}
      >
        <MoonIcon className="size-5 dark:hidden" />
        <span className="dark:hidden">{labels.dark}</span>
        <SunIcon className="hidden size-5 dark:block" />
        <span className="hidden dark:inline">{labels.light}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`size-10 place-items-center rounded-lg border border-white/15 text-slate-200 transition-colors hover:border-white/40 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 ${className || "grid"}`}
    >
      <MoonIcon className="size-5 dark:hidden" />
      <SunIcon className="hidden size-5 text-brand-300 dark:block" />
      <span className="sr-only dark:hidden">{labels.toDark}</span>
      <span className="sr-only hidden dark:inline">{labels.toLight}</span>
    </button>
  );
}
