import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AccountNav } from "@/components/account/account-nav";
import { QuoteDecision } from "@/components/account/quote-decision";
import { ArrowRightIcon, WhatsAppIcon } from "@/components/icons";
import { PrintButton } from "@/components/print-button";
import { QuoteDocument } from "@/components/quote-document";
import { PageSkeleton } from "@/components/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { Container } from "@/components/ui";
import { statusTone } from "@/lib/admin/labels";
import { requireClient } from "@/lib/auth/session";
import { logActivity } from "@/lib/data/activity";
import { getQuoteForUser, markQuoteViewed } from "@/lib/data/quotes";
import { formatDate, quoteDisplayStatus } from "@/lib/format";
import { getDictionary } from "@/lib/i18n";
import { hasLocale } from "@/lib/locales";
import { whatsappLink } from "@/lib/site";

export default function QuotePage(props: PageProps<"/[lang]/conta/orcamentos/[id]">) {
  return (
    <Container className="py-10 sm:py-12 print:py-0">
      <Suspense fallback={<PageSkeleton />}>
        <QuoteView {...props} />
      </Suspense>
    </Container>
  );
}

function Notice({ tone, children }: { tone: "green" | "amber" | "gray"; children: React.ReactNode }) {
  const styles = {
    green: "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
    amber: "border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-200",
    gray: "border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300",
  };
  return (
    <div role="status" className={`rounded-2xl border p-5 font-medium print:hidden ${styles[tone]}`}>
      {children}
    </div>
  );
}

async function QuoteView({ params, searchParams }: PageProps<"/[lang]/conta/orcamentos/[id]">) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();
  const user = await requireClient(lang);
  const quote = await getQuoteForUser(Number(id), user.id);
  if (!quote) notFound();

  const { resultado } = await searchParams;
  const dict = getDictionary(lang);
  const t = dict.account.quotePage;
  const status = quoteDisplayStatus(quote);

  if (await markQuoteViewed(quote.id, user.id)) {
    await logActivity({
      actorId: user.id,
      clientId: user.id,
      action: "quote.viewed",
      entity: "quote",
      entityId: quote.id,
      details: quote.number,
    });
  }

  return (
    <div className="space-y-8">
      <AccountNav lang={lang} dict={dict} current="quote" />

      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={`/${lang}/conta`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white">
          <ArrowRightIcon className="size-4 rotate-180" />
          {t.back}
        </Link>
        <PrintButton label={t.print} />
      </div>

      {resultado === "aceite" && quote.status === "aceite" ? (
        <div role="status" className="flex flex-col gap-4 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-6 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <p className="font-semibold text-emerald-800 dark:text-emerald-300">{t.acceptedSuccess}</p>
          <a
            href={whatsappLink(t.notifyAccepted.replace("{number}", quote.number))}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-whatsapp px-4 py-2.5 text-sm font-semibold text-navy-950"
          >
            <WhatsAppIcon className="size-4" />
            {t.notify}
          </a>
        </div>
      ) : null}
      {status === "expirado" ? <Notice tone="amber">{t.expired}</Notice> : null}
      {status === "cancelado" ? <Notice tone="gray">{t.cancelled}</Notice> : null}
      {status === "recusado" && quote.decided_at ? (
        <Notice tone="gray">{t.rejectedOn.replace("{date}", formatDate(quote.decided_at, lang))}</Notice>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] print:block">
        <QuoteDocument
          quote={quote}
          locale={lang}
          labels={t}
          units={dict.account.units}
          status={<StatusBadge tone={statusTone[status]}>{dict.account.status.quote[status]}</StatusBadge>}
        />
        <aside className="space-y-4 print:hidden">
          {status === "enviado" ? <QuoteDecision lang={lang} quoteId={quote.id} labels={t} /> : null}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800 p-6">
            <p className="font-semibold text-navy-900 dark:text-white">{t.questions}</p>
            <a
              href={whatsappLink(t.questionsMessage.replace("{number}", quote.number))}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300"
            >
              <WhatsAppIcon className="size-4" />
              WhatsApp
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
