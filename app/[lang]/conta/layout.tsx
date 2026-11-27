import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { getDictionary } from "@/lib/i18n";
import { hasLocale } from "@/lib/locales";

// Private area: keep it out of search engines.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AccountLayout({ children, params }: LayoutProps<"/[lang]/conta">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main id="conteudo" className="min-h-[70vh] bg-slate-50 dark:bg-navy-950">
        {children}
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
