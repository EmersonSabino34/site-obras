import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthShell } from "@/components/account/auth-shell";
import { RegisterForm } from "@/components/account/register-form";
import { getDictionary } from "@/lib/i18n";
import { hasLocale } from "@/lib/locales";

export async function generateMetadata({ params }: PageProps<"/[lang]/conta/registo">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: `${getDictionary(lang).account.registerPage.title} | HENPROTRUST` };
}

export default async function RegisterPage({ params }: PageProps<"/[lang]/conta/registo">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.registerPage;

  return (
    <AuthShell dict={dict} title={t.title} subtitle={t.subtitle}>
      <RegisterForm
        lang={lang}
        labels={t}
        clientTypes={dict.form.clientTypes}
        selectLabel={dict.form.select}
        privacyLabel={dict.privacyLink}
        passwordLabels={dict.account.passwordToggle}
      />
      <p className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-600">
        {t.haveAccount}{" "}
        <Link href={`/${lang}/conta/entrar`} className="font-semibold text-brand-700 underline underline-offset-2">
          {dict.account.login}
        </Link>
      </p>
    </AuthShell>
  );
}
