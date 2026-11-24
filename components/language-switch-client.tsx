"use client";

import { usePathname } from "next/navigation";

import type { Locale } from "@/lib/locales";

import { LanguageSwitchView } from "./language-switch-view";

/** Keeps the visitor on the same page when switching language (/pt/conta → /en/conta). */
export function LanguageSwitchClient({
  current,
  label,
  className,
}: {
  current: Locale;
  label: string;
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <LanguageSwitchView
      current={current}
      label={label}
      className={className}
      hrefFor={(locale) => pathname.replace(/^\/(pt|en)(?=\/|$)/, `/${locale}`) || `/${locale}`}
    />
  );
}
