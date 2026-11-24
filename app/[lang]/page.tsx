import { notFound } from "next/navigation";

import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { About } from "@/components/sections/about";
import { Area } from "@/components/sections/area";
import { Clients } from "@/components/sections/clients";
import { Contact } from "@/components/sections/contact";
import { Hero } from "@/components/sections/hero";
import { Process } from "@/components/sections/process";
import { QuoteCta } from "@/components/sections/quote-cta";
import { Services } from "@/components/sections/services";
import { getDictionary } from "@/lib/i18n";
import { hasLocale, htmlLang } from "@/lib/locales";
import { site, siteUrl, whatsappLink } from "@/lib/site";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  // Structured data so search engines understand this is a local business.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    "@id": `${siteUrl}/#business`,
    name: site.name,
    url: `${siteUrl}/${lang}`,
    logo: `${siteUrl}/icon.svg`,
    image: `${siteUrl}/${lang}/opengraph-image`,
    description: dict.meta.description,
    telephone: site.phoneHref.replace("tel:", ""),
    email: site.email,
    inLanguage: htmlLang[lang],
    address: {
      "@type": "PostalAddress",
      addressLocality: site.base,
      addressRegion: "Leiria",
      addressCountry: "PT",
    },
    areaServed: site.areas.map((name) => ({ "@type": "City", name })),
    knowsAbout: dict.services.items.map((item) => item.title),
  };

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only z-[60] rounded-lg bg-brand-500 px-4 py-2 font-semibold text-navy-950 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {dict.common.skipToContent}
      </a>
      <Header lang={lang} dict={dict} />
      <main id="conteudo">
        <Hero dict={dict} />
        <Services dict={dict} />
        <Clients dict={dict} />
        <About dict={dict} />
        <Process dict={dict} />
        <Area dict={dict} />
        <QuoteCta dict={dict} />
        <Contact dict={dict} />
      </main>
      <Footer lang={lang} dict={dict} />
      <FloatingWhatsApp
        href={whatsappLink(dict.common.whatsappMessage)}
        label={dict.floatingWhatsapp}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
