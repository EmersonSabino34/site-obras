import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Container } from "@/components/ui";
import { getDictionary } from "@/lib/i18n";
import { privacyPolicy } from "@/lib/legal/privacy";
import { hasLocale } from "@/lib/locales";

export async function generateMetadata({ params }: PageProps<"/[lang]/privacidade">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return {
    title: `${privacyPolicy[lang].title} | HENPROTRUST`,
    alternates: {
      canonical: `/${lang}/privacidade`,
      languages: { "pt-PT": "/pt/privacidade", en: "/en/privacidade" },
    },
  };
}

export default async function PrivacyPage({ params }: PageProps<"/[lang]/privacidade">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const policy = privacyPolicy[lang];

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main id="conteudo" className="bg-slate-50 py-14 sm:py-20 dark:bg-navy-950">
        <Container>
          <article className="mx-auto max-w-3xl rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800 p-6 shadow-sm sm:p-12">
            <h1 className="font-display text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">{policy.title}</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{policy.updated}</p>
            <p className="mt-6 text-lg leading-relaxed text-slate-700 dark:text-slate-300">{policy.intro}</p>
            {policy.sections.map((section) => (
              <section key={section.title} className="mt-10">
                <h2 className="font-display text-xl font-bold text-navy-900 dark:text-white">{section.title}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="mt-3 leading-relaxed text-slate-700 dark:text-slate-300">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </article>
        </Container>
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
