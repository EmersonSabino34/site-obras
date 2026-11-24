import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AccountNav } from "@/components/account/account-nav";
import { RequestForm } from "@/components/account/request-form";
import { PageSkeleton } from "@/components/skeleton";
import { Container } from "@/components/ui";
import { requireClient } from "@/lib/auth/session";
import { getUser } from "@/lib/data/users";
import { getDictionary } from "@/lib/i18n";
import { hasLocale } from "@/lib/locales";

export default function NewRequestPage(props: PageProps<"/[lang]/conta/pedidos/novo">) {
  return (
    <Container className="py-10 sm:py-12">
      <Suspense fallback={<PageSkeleton />}>
        <Content {...props} />
      </Suspense>
    </Container>
  );
}

async function Content({ params }: PageProps<"/[lang]/conta/pedidos/novo">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const session = await requireClient(lang);
  const user = await getUser(session.id);
  const dict = getDictionary(lang);
  const t = dict.account.requestPage;

  return (
    <div className="space-y-8">
      <AccountNav lang={lang} dict={dict} current="request" />
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <h1 className="font-display text-2xl font-bold text-navy-900 sm:text-3xl">{t.title}</h1>
        <p className="mt-2 text-slate-600">{t.subtitle}</p>
        <div className="mt-8">
          <RequestForm
            lang={lang}
            labels={t}
            services={dict.services.items.map((item) => item.title)}
            otherService={dict.form.otherService}
            selectLabel={dict.form.select}
            defaultLocation={user?.city}
          />
        </div>
      </div>
    </div>
  );
}
