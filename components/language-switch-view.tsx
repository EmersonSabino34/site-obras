import Link from "next/link";

import { htmlLang, locales, type Locale } from "@/lib/locales";

export function LanguageSwitchView({
  current,
  label,
  hrefFor,
  className = "",
}: {
  current: Locale;
  label: string;
  hrefFor: (locale: Locale) => string;
  className?: string;
}) {
  return (
    <nav
      aria-label={label}
      className={`flex items-center rounded-full border border-white/15 p-0.5 text-xs font-bold ${className}`}
    >
      {locales.map((locale) => {
        const active = locale === current;
        return (
          <Link
            key={locale}
            href={hrefFor(locale)}
            hrefLang={htmlLang[locale]}
            lang={htmlLang[locale]}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-2.5 py-1 uppercase tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 ${
              active ? "bg-white text-navy-900" : "text-slate-300 hover:text-white"
            }`}
          >
            {locale}
          </Link>
        );
      })}
    </nav>
  );
}
