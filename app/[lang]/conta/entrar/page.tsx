import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthShell } from "@/components/account/auth-shell";
import { LoginForm } from "@/components/account/login-form";
import { WhatsAppIcon } from "@/components/icons";
import { getDictionary } from "@/lib/i18n";
import { hasLocale } from "@/lib/locales";
import { whatsappLink } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/conta/entrar">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: `${getDictionary(lang).account.loginPage.title} | HENPROTRUST` };
}

export default async function LoginPage({ params }: PageProps<"/[lang]/conta/entrar">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.loginPage;

  return (
    <AuthShell dict={dict} title={t.title} subtitle={t.subtitle}>
      <LoginForm lang={lang} labels={t} passwordLabels={dict.account.passwordToggle} />
      <div className="mt-8 space-y-5 border-t border-slate-200 pt-6 text-sm text-slate-600">
        <p>
          {t.noAccount}{" "}
          <Link href={`/${lang}/conta/registo`} className="font-semibold text-brand-700 underline underline-offset-2">
            {dict.account.register}
          </Link>
        </p>
        <div>
          <p className="font-semibold text-navy-900">{t.forgot}</p>
          <p className="mt-1">{t.forgotHelp}</p>
          <a
            href={whatsappLink(t.forgotMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 font-semibold text-emerald-700 hover:text-emerald-800"
          >
            <WhatsAppIcon className="size-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </AuthShell>
  );
}
