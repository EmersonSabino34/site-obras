import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { EmptyState, FilterTabs, linkButton, PageHeader, table } from "@/components/admin/ui";
import { PageSkeleton } from "@/components/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { quoteStatusLabel, statusTone } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth/session";
import { listQuotes } from "@/lib/data/quotes";
import { QUOTE_STATUSES, type QuoteStatus } from "@/lib/data/types";
import { formatDate, formatMoney, quoteDisplayStatus } from "@/lib/format";

export const metadata: Metadata = { title: "Orçamentos" };

export default function QuotesPage(props: PageProps<"/admin/orcamentos">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ searchParams }: PageProps<"/admin/orcamentos">) {
  await requireAdmin();
  const { estado } = await searchParams;
  const status = QUOTE_STATUSES.includes(estado as QuoteStatus) ? (estado as QuoteStatus) : undefined;
  const quotes = await listQuotes(status);
  const total = quotes.reduce((sum, quote) => sum + quote.total_cents, 0);

  return (
    <>
      <PageHeader
        title="Orçamentos"
        description={`${quotes.length} orçamento(s) · ${formatMoney(total)} no total`}
        actions={
          <Link href="/admin/orcamentos/novo" className={linkButton.primary}>
            Novo orçamento
          </Link>
        }
      />
      <FilterTabs
        items={[
          { label: "Todos", href: "/admin/orcamentos", active: !status },
          ...QUOTE_STATUSES.map((s) => ({
            label: quoteStatusLabel[s],
            href: `/admin/orcamentos?estado=${s}`,
            active: status === s,
          })),
        ]}
      />
      {quotes.length === 0 ? (
        <EmptyState
          action={
            <Link href="/admin/orcamentos/novo" className={linkButton.primary}>
              Criar orçamento
            </Link>
          }
        >
          Ainda não há orçamentos{status ? ` com o estado “${quoteStatusLabel[status]}”` : ""}.
        </EmptyState>
      ) : (
        <div className={table.wrap}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>N.º</th>
                <th className={table.th}>Cliente</th>
                <th className={table.th}>Trabalho</th>
                <th className={`${table.th} text-right`}>Total</th>
                <th className={table.th}>Validade</th>
                <th className={table.th}>Cliente viu</th>
                <th className={table.th}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => {
                const display = quoteDisplayStatus(quote);
                return (
                  <tr key={quote.id} className={table.row}>
                    <td className={`${table.td} whitespace-nowrap`}>
                      <Link href={`/admin/orcamentos/${quote.id}`} className="font-semibold text-navy-900 hover:text-brand-700">
                        {quote.number}
                      </Link>
                    </td>
                    <td className={table.td}>
                      <Link href={`/admin/clientes/${quote.user_id}`} className="hover:text-brand-700">
                        {quote.client_name}
                      </Link>
                    </td>
                    <td className={`${table.td} max-w-xs truncate`}>{quote.title}</td>
                    <td className={`${table.td} text-right font-semibold tabular-nums`}>{formatMoney(quote.total_cents)}</td>
                    <td className={`${table.td} whitespace-nowrap`}>{formatDate(quote.valid_until)}</td>
                    <td className={`${table.td} whitespace-nowrap text-slate-500`}>
                      {quote.status === "rascunho" ? "—" : quote.viewed_at ? formatDate(quote.viewed_at) : "Ainda não"}
                    </td>
                    <td className={table.td}>
                      <StatusBadge tone={statusTone[display]}>{quoteStatusLabel[display]}</StatusBadge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
