import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { AccountNav } from "@/components/account/account-nav";
import { FileIcon } from "@/components/account/file-icon";
import { ArrowRightIcon, WhatsAppIcon } from "@/components/icons";
import { PageSkeleton } from "@/components/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { Container } from "@/components/ui";
import { statusTone } from "@/lib/admin/labels";
import { requireClient } from "@/lib/auth/session";
import { listQuotesForUser } from "@/lib/data/quotes";
import { listRequestsForUser } from "@/lib/data/requests";
import { listWorksForClient } from "@/lib/data/works";
import { formatDate, formatDateTime, formatMoney, quoteDisplayStatus } from "@/lib/format";
import { getDictionary } from "@/lib/i18n";
import { hasLocale } from "@/lib/locales";
import { whatsappLink } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/conta">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: `${getDictionary(lang).account.area} | HENPROTRUST` };
}

export default function AccountPage(props: PageProps<"/[lang]/conta">) {
  return (
    <Container className="py-10 sm:py-12">
      <Suspense fallback={<PageSkeleton />}>
        <Dashboard {...props} />
      </Suspense>
    </Container>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <section>
      <h2 className="flex items-center gap-2 font-display text-xl font-bold text-navy-900">
        {title}
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-600">{count}</span>
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center text-slate-500">
      {children}
    </p>
  );
}

async function Dashboard({ params, searchParams }: PageProps<"/[lang]/conta">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const user = await requireClient(lang);
  const dict = getDictionary(lang);
  const t = dict.account;
  const d = t.dashboardPage;
  const { pedido } = await searchParams;

  const [quotes, requests, works] = await Promise.all([
    listQuotesForUser(user.id),
    listRequestsForUser(user.id),
    listWorksForClient(user.id),
  ]);

  return (
    <div className="space-y-10">
      <AccountNav lang={lang} dict={dict} current="dashboard" />

      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy-900">
            {d.greeting.replace("{name}", user.name.split(" ")[0])}
          </h1>
          <p className="mt-2 text-slate-600">{d.intro}</p>
        </div>
        <Link
          href={`/${lang}/conta/pedidos/novo`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 font-semibold text-navy-950 shadow-sm transition-colors hover:bg-brand-400"
        >
          {t.newRequest}
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>

      {pedido === "enviado" ? (
        <div role="status" className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium text-emerald-800">{d.requestCreated}</p>
          <a
            href={whatsappLink(d.notifyRequestMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-whatsapp px-4 py-2.5 text-sm font-semibold text-navy-950"
          >
            <WhatsAppIcon className="size-4" />
            {d.notifyWhatsapp}
          </a>
        </div>
      ) : null}

      {user.must_change_password ? (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium text-amber-900">{d.mustChangePassword}</p>
          <Link href={`/${lang}/conta/perfil`} className="shrink-0 font-semibold text-amber-900 underline underline-offset-4">
            {d.changeNow}
          </Link>
        </div>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <Section title={d.quotes} count={quotes.length}>
            {quotes.length === 0 ? (
              <Empty>{d.emptyQuotes}</Empty>
            ) : (
              <ul className="space-y-3">
                {quotes.map((quote) => {
                  const status = quoteDisplayStatus(quote);
                  const awaiting = status === "enviado";
                  return (
                    <li key={quote.id}>
                      <Link
                        href={`/${lang}/conta/orcamentos/${quote.id}`}
                        className={`group flex flex-col gap-4 rounded-2xl border bg-white p-5 transition hover:shadow-md sm:flex-row sm:items-center ${
                          awaiting ? "border-brand-500 ring-4 ring-brand-500/10" : "border-slate-200"
                        }`}
                      >
                        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-navy-900 text-brand-400">
                          <FileIcon className="size-6" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-navy-900">{quote.title}</span>
                            <StatusBadge tone={statusTone[status]}>{t.status.quote[status]}</StatusBadge>
                          </span>
                          <span className="mt-1 block text-sm text-slate-500">
                            {quote.number} · {formatDate(quote.sent_at ?? quote.created_at, lang)}
                            {awaiting && quote.valid_until
                              ? ` · ${dict.account.quotePage.validUntil} ${formatDate(quote.valid_until, lang)}`
                              : ""}
                          </span>
                        </span>
                        <span className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                          <span className="font-display text-lg font-bold text-navy-900">
                            {formatMoney(quote.total_cents, lang)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                            {awaiting ? d.awaiting : d.viewQuote}
                            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>

          <Section title={d.works} count={works.length}>
            {works.length === 0 ? (
              <Empty>{d.emptyWorks}</Empty>
            ) : (
              <ul className="space-y-4">
                {works.map((work) => (
                  <li key={work.id} className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-navy-900">{work.title}</p>
                        <p className="text-sm text-slate-500">
                          {[work.location, work.quote_number && `${d.quoteRef} ${work.quote_number}`]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <StatusBadge tone={statusTone[work.status]}>{t.status.work[work.status]}</StatusBadge>
                    </div>
                    <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-1 text-sm">
                      <div className="flex gap-2">
                        <dt className="text-slate-500">{d.start}:</dt>
                        <dd className="font-medium">{formatDate(work.start_date, lang)}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-slate-500">{d.end}:</dt>
                        <dd className="font-medium">{formatDate(work.end_date, lang)}</dd>
                      </div>
                    </dl>
                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{d.updates}</p>
                      {work.updates.length === 0 ? (
                        <p className="mt-2 text-sm text-slate-500">{d.noUpdates}</p>
                      ) : (
                        <ol className="mt-3 space-y-3 border-l-2 border-brand-500/40 pl-4">
                          {work.updates.slice(0, 5).map((update) => (
                            <li key={update.id}>
                              <p className="text-xs text-slate-500">{formatDateTime(update.created_at, lang)}</p>
                              <p className="mt-0.5 whitespace-pre-line text-sm text-navy-900">{update.message}</p>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <Section title={d.requests} count={requests.length}>
          {requests.length === 0 ? (
            <Empty>{d.emptyRequests}</Empty>
          ) : (
            <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
              {requests.map((request) => (
                <li key={request.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-navy-900">{request.service}</p>
                    <StatusBadge tone={statusTone[request.status]}>{t.status.request[request.status]}</StatusBadge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {[request.location, formatDate(request.created_at, lang)].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{request.description}</p>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}
