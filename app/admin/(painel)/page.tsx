import Link from "next/link";
import { Suspense } from "react";

import { ActivityFeed } from "@/components/admin/activity-feed";
import { Card, linkButton, PageHeader, StatCard } from "@/components/admin/ui";
import { PageSkeleton } from "@/components/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { quoteStatusLabel, statusTone, workStatusLabel } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth/session";
import { listActivity } from "@/lib/data/activity";
import { listQuotes } from "@/lib/data/quotes";
import { listRequests } from "@/lib/data/requests";
import { getDashboardStats } from "@/lib/data/stats";
import { listWorks } from "@/lib/data/works";
import { formatDate, formatMoney, quoteDisplayStatus } from "@/lib/format";

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}

function AttentionRow({ href, title, meta, badge }: { href: string; title: string; meta: string; badge: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-slate-50">
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-navy-900">{title}</span>
          <span className="block truncate text-xs text-slate-500">{meta}</span>
        </span>
        {badge}
      </Link>
    </li>
  );
}

async function Dashboard() {
  const admin = await requireAdmin();
  const [stats, newRequests, quotes, works, activity] = await Promise.all([
    getDashboardStats(),
    listRequests("novo"),
    listQuotes(),
    listWorks(),
    listActivity({ limit: 15 }),
  ]);

  const drafts = quotes.filter((quote) => quote.status === "rascunho").slice(0, 5);
  const waiting = quotes
    .filter((quote) => quote.status === "enviado")
    .sort((a, b) => (a.valid_until ?? "9999").localeCompare(b.valid_until ?? "9999"))
    .slice(0, 5);
  const activeWorks = works.filter((work) => work.status === "em_curso" || work.status === "por_iniciar").slice(0, 6);
  const decided = stats.quotes_accepted + stats.quotes_rejected;
  const acceptance = decided ? Math.round((stats.quotes_accepted / decided) * 100) : null;

  return (
    <>
      <PageHeader
        title={`Olá, ${admin.name.split(" ")[0]}`}
        description="Resumo da atividade da HENPROTRUST."
        actions={
          <>
            <Link href="/admin/clientes/novo" className={linkButton.outline}>
              Novo cliente
            </Link>
            <Link href="/admin/orcamentos/novo" className={linkButton.primary}>
              Novo orçamento
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Pedidos novos"
          value={stats.requests_new}
          hint={`${stats.requests_review} em análise`}
          href="/admin/pedidos?estado=novo"
          highlight={stats.requests_new > 0}
        />
        <StatCard
          label="À espera de resposta"
          value={stats.quotes_waiting}
          hint={`${formatMoney(stats.pipeline_cents)} em orçamentos enviados`}
          href="/admin/orcamentos?estado=enviado"
        />
        <StatCard
          label="Valor adjudicado este ano"
          value={formatMoney(stats.accepted_year_cents)}
          hint={`${plural(stats.quotes_accepted, "orçamento aceite", "orçamentos aceites")} no total`}
          href="/admin/orcamentos?estado=aceite"
        />
        <StatCard
          label="Obras em curso"
          value={stats.works_active}
          hint={`${stats.works_pending} por iniciar · ${plural(stats.works_done, "concluída", "concluídas")}`}
          href="/admin/obras"
        />
        <StatCard label="Rascunhos por enviar" value={stats.quotes_draft} href="/admin/orcamentos?estado=rascunho" />
        <StatCard
          label="Orçamentos expirados"
          value={stats.quotes_expired}
          hint="Enviados e fora da validade"
          href="/admin/orcamentos?estado=enviado"
        />
        <StatCard
          label="Taxa de aceitação"
          value={acceptance === null ? "—" : `${acceptance}%`}
          hint={`${plural(stats.quotes_accepted, "aceite", "aceites")} · ${plural(stats.quotes_rejected, "recusado", "recusados")}`}
        />
        <StatCard
          label="Clientes"
          value={stats.clients_total}
          hint={`${plural(stats.clients_new_30d, "novo", "novos")} nos últimos 30 dias`}
          href="/admin/clientes"
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <Card title="Pedidos novos" action={<Link href="/admin/pedidos" className="text-sm font-semibold text-brand-700">Ver todos</Link>}>
            {newRequests.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">Sem pedidos novos.</p>
            ) : (
              <ul className="-mx-2">
                {newRequests.slice(0, 5).map((request) => (
                  <AttentionRow
                    key={request.id}
                    href={`/admin/pedidos/${request.id}`}
                    title={`${request.client_name} — ${request.service}`}
                    meta={[request.location, formatDate(request.created_at)].filter(Boolean).join(" · ")}
                    badge={<StatusBadge tone="orange">Novo</StatusBadge>}
                  />
                ))}
              </ul>
            )}
          </Card>

          <Card title="Orçamentos a aguardar o cliente">
            {waiting.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">Nenhum orçamento à espera de resposta.</p>
            ) : (
              <ul className="-mx-2">
                {waiting.map((quote) => {
                  const status = quoteDisplayStatus(quote);
                  return (
                    <AttentionRow
                      key={quote.id}
                      href={`/admin/orcamentos/${quote.id}`}
                      title={`${quote.number} — ${quote.client_name}`}
                      meta={`${formatMoney(quote.total_cents)} · válido até ${formatDate(quote.valid_until)}${quote.viewed_at ? " · visto" : " · não aberto"}`}
                      badge={<StatusBadge tone={statusTone[status]}>{quoteStatusLabel[status]}</StatusBadge>}
                    />
                  );
                })}
              </ul>
            )}
          </Card>

          <Card title="Rascunhos por enviar">
            {drafts.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">Sem rascunhos.</p>
            ) : (
              <ul className="-mx-2">
                {drafts.map((quote) => (
                  <AttentionRow
                    key={quote.id}
                    href={`/admin/orcamentos/${quote.id}`}
                    title={`${quote.number} — ${quote.title}`}
                    meta={`${quote.client_name} · ${formatMoney(quote.total_cents)}`}
                    badge={<StatusBadge tone="gray">Rascunho</StatusBadge>}
                  />
                ))}
              </ul>
            )}
          </Card>

          <Card title="Obras ativas" action={<Link href="/admin/obras" className="text-sm font-semibold text-brand-700">Ver todas</Link>}>
            {activeWorks.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">Sem obras ativas.</p>
            ) : (
              <ul className="-mx-2">
                {activeWorks.map((work) => (
                  <AttentionRow
                    key={work.id}
                    href={`/admin/obras/${work.id}`}
                    title={work.title}
                    meta={`${work.client_name}${work.location ? ` · ${work.location}` : ""}`}
                    badge={<StatusBadge tone={statusTone[work.status]}>{workStatusLabel[work.status]}</StatusBadge>}
                  />
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card title="Atividade recente" action={<Link href="/admin/atividade" className="text-sm font-semibold text-brand-700">Histórico completo</Link>}>
          <ActivityFeed entries={activity} />
        </Card>
      </div>
    </>
  );
}
