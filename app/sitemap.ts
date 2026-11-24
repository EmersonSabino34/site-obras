import type { MetadataRoute } from "next";

import { htmlLang, locales } from "@/lib/locales";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    locales.map((locale) => [htmlLang[locale], `${siteUrl}/${locale}`]),
  );

  return locales.map((locale) => ({
    url: `${siteUrl}/${locale}`,
    changeFrequency: "monthly",
    priority: locale === "pt" ? 1 : 0.8,
    alternates: { languages },
  }));
}
