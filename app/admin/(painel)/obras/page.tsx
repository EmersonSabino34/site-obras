import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { EmptyState, FilterTabs, PageHeader, table } from "@/components/admin/ui";
import { PageSkeleton } from "@/components/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { statusTone, workStatusLabel } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth/session";
import { WORK_STATUSES, type WorkStatus } from "@/lib/data/types";
import { listWorks } from "@/lib/data/works";
import { formatDate, formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Obras" };

export default function WorksPage(props: PageProps<"/admin/obras">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ searchParams }: PageProps<"/admin/obras">) {
  await requireAdmin();
  const { estado } = await searchParams;
  const status = WORK_STATUSES.includes(estado as WorkStatus) ? (estado as WorkStatus) : undefined;
  const works = await listWorks(status);

  return (
    <>
      <PageHeader
        title="Obras"
        description="Cada orçamento aceite pelo cliente abre automaticamente uma obra."
      />
      <FilterTabs
        items={[
          { label: "Todas", href: "/admin/obras", active: !status },
          ...WORK_STATUSES.map((s) => ({ label: workStatusLabel[s], href: `/admin/obras?estado=${s}`, active: status === s })),
        ]}
      />
      {works.length === 0 ? (
        <EmptyState>Ainda não há obras{status ? ` com o estado “${workStatusLabel[status]}”` : ""}.</EmptyState>
      ) : (
        <div className={table.wrap}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>Obra</th>
                <th className={table.th}>Cliente</th>
                <th className={`${table.th} text-right`}>Valor</th>
                <th className={table.th}>Início</th>
                <th className={table.th}>Conclusão</th>
                <th className={table.th}>Última atualização</th>
                <th className={table.th}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {works.map((work) => (
                <tr key={work.id} className={table.row}>
                  <td className={table.td}>
                    <Link href={`/admin/obras/${work.id}`} className="font-semibold text-navy-900 hover:text-brand-700">
                      {work.title}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {[work.location, work.quote_number].filter(Boolean).join(" · ")}
                    </p>
                  </td>
                  <td className={table.td}>
                    <Link href={`/admin/clientes/${work.user_id}`} className="hover:text-brand-700">
                      {work.client_name}
                    </Link>
                  </td>
                  <td className={`${table.td} text-right tabular-nums`}>
                    {work.total_cents !== null ? formatMoney(work.total_cents) : "—"}
                  </td>
                  <td className={`${table.td} whitespace-nowrap`}>{formatDate(work.start_date)}</td>
                  <td className={`${table.td} whitespace-nowrap`}>{formatDate(work.end_date)}</td>
                  <td className={`${table.td} whitespace-nowrap text-slate-500`}>
                    {work.last_update_at ? formatDate(work.last_update_at) : "—"}
                    {work.updates_count ? ` (${work.updates_count})` : ""}
                  </td>
                  <td className={table.td}>
                    <StatusBadge tone={statusTone[work.status]}>{workStatusLabel[work.status]}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
