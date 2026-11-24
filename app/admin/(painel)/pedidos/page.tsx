import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { EmptyState, FilterTabs, PageHeader, table } from "@/components/admin/ui";
import { PageSkeleton } from "@/components/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { requestStatusLabel, statusTone } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth/session";
import { listRequests } from "@/lib/data/requests";
import { REQUEST_STATUSES, type RequestStatus } from "@/lib/data/types";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Pedidos" };

export default function RequestsPage(props: PageProps<"/admin/pedidos">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ searchParams }: PageProps<"/admin/pedidos">) {
  await requireAdmin();
  const { estado } = await searchParams;
  const status = REQUEST_STATUSES.includes(estado as RequestStatus) ? (estado as RequestStatus) : undefined;
  const requests = await listRequests(status);

  return (
    <>
      <PageHeader title="Pedidos de orçamento" description="Pedidos enviados pelos clientes na área de cliente." />
      <FilterTabs
        items={[
          { label: "Todos", href: "/admin/pedidos", active: !status },
          ...REQUEST_STATUSES.map((s) => ({
            label: requestStatusLabel[s],
            href: `/admin/pedidos?estado=${s}`,
            active: status === s,
          })),
        ]}
      />
      {requests.length === 0 ? (
        <EmptyState>Não há pedidos {status ? `com o estado “${requestStatusLabel[status]}”` : "ainda"}.</EmptyState>
      ) : (
        <div className={table.wrap}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>#</th>
                <th className={table.th}>Cliente</th>
                <th className={table.th}>Serviço</th>
                <th className={table.th}>Localidade</th>
                <th className={table.th}>Recebido</th>
                <th className={table.th}>Orçamentos</th>
                <th className={table.th}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className={table.row}>
                  <td className={`${table.td} text-slate-400`}>{request.id}</td>
                  <td className={table.td}>
                    <Link href={`/admin/pedidos/${request.id}`} className="font-semibold text-navy-900 hover:text-brand-700">
                      {request.client_name}
                    </Link>
                    <p className="text-xs text-slate-500">{request.client_email}</p>
                  </td>
                  <td className={table.td}>
                    <p className="font-medium">{request.service}</p>
                    <p className="line-clamp-1 max-w-xs text-xs text-slate-500">{request.description}</p>
                  </td>
                  <td className={table.td}>{request.location ?? "—"}</td>
                  <td className={`${table.td} whitespace-nowrap`}>{formatDate(request.created_at)}</td>
                  <td className={table.td}>{request.quotes_count}</td>
                  <td className={table.td}>
                    <StatusBadge tone={statusTone[request.status]}>{requestStatusLabel[request.status]}</StatusBadge>
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
