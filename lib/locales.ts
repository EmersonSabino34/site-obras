// Kept free of other imports so it can be shared with proxy.ts.

export const locales = ["pt", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "pt";

export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Value for the <html lang> attribute and hreflang links. */
export const htmlLang: Record<Locale, string> = {
  pt: "pt-PT",
  en: "en",
};

/** Open Graph locale codes. */
export const ogLocale: Record<Locale, string> = {
  pt: "pt_PT",
  en: "en_GB",
};

export function hasLocale(value: string | undefined): value is Locale {
  return value !== undefined && (locales as readonly string[]).includes(value);
}
