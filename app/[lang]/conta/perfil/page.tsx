import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AccountNav } from "@/components/account/account-nav";
import { PasswordForm, ProfileForm } from "@/components/account/profile-forms";
import { PageSkeleton } from "@/components/skeleton";
import { Container } from "@/components/ui";
import { requireClient } from "@/lib/auth/session";
import { getUser } from "@/lib/data/users";
import { getDictionary } from "@/lib/i18n";
import { hasLocale } from "@/lib/locales";

export default function ProfilePage(props: PageProps<"/[lang]/conta/perfil">) {
  return (
    <Container className="py-10 sm:py-12">
      <Suspense fallback={<PageSkeleton />}>
        <Content {...props} />
      </Suspense>
    </Container>
  );
}

async function Content({ params }: PageProps<"/[lang]/conta/perfil">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const session = await requireClient(lang);
  const user = await getUser(session.id);
  if (!user) notFound();
  const dict = getDictionary(lang);
  const t = dict.account.profilePage;
  const r = dict.account.registerPage;

  return (
    <div className="space-y-8">
      <AccountNav lang={lang} dict={dict} current="profile" />
      <div>
        <h1 className="font-display text-3xl font-bold text-navy-900">{t.title}</h1>
        <p className="mt-2 text-slate-600">{t.subtitle}</p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <ProfileForm
            lang={lang}
            user={user}
            labels={{ ...r, save: t.save, emailNote: t.emailNote }}
            clientTypes={dict.form.clientTypes}
            selectLabel={dict.form.select}
          />
        </section>
        <section
          id="palavra-passe"
          className={`h-fit rounded-3xl border bg-white p-6 shadow-sm sm:p-8 ${
            user.must_change_password ? "border-amber-300 ring-4 ring-amber-100" : "border-slate-200"
          }`}
        >
          <h2 className="font-display text-xl font-bold text-navy-900">{t.passwordTitle}</h2>
          <div className="mt-6">
            <PasswordForm lang={lang} labels={{ ...t, passwordHint: r.passwordHint }} />
          </div>
        </section>
      </div>
    </div>
  );
}
