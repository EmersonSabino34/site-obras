import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";

import "../globals.css";

import { inter, montserrat } from "@/lib/fonts";
import { getDictionary } from "@/lib/i18n";
import { hasLocale, htmlLang, locales, ogLocale } from "@/lib/locales";
import { site, siteUrl } from "@/lib/site";
import { themeScript } from "@/lib/theme";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { meta } = getDictionary(lang);

  return {
    metadataBase: new URL(siteUrl),
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    applicationName: site.name,
    authors: [{ name: site.name }],
    alternates: {
      canonical: `/${lang}`,
      languages: {
        "pt-PT": "/pt",
        en: "/en",
        "x-default": "/pt",
      },
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      title: meta.title,
      description: meta.description,
      url: `/${lang}`,
      locale: ogLocale[lang],
      alternateLocale: locales.filter((l) => l !== lang).map((l) => ogLocale[l]),
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#101b2b",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    // data-theme is changed by the inline script before paint, hence suppressHydrationWarning.
    <html
      lang={htmlLang[lang]}
      data-theme="light"
      suppressHydrationWarning
      className={`${inter.variable} ${montserrat.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
