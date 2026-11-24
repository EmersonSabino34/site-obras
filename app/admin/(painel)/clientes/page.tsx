import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { EmptyState, linkButton, PageHeader, table } from "@/components/admin/ui";
import { inputClass } from "@/components/forms";
import { PageSkeleton } from "@/components/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { requireAdmin } from "@/lib/auth/session";
import { listClients } from "@/lib/data/users";
import { formatDate, formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Clientes" };

export default function ClientsPage(props: PageProps<"/admin/clientes">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ searchParams }: PageProps<"/admin/clientes">) {
  await requireAdmin();
  const { q } = await searchParams;
  const search = typeof q === "string" ? q.trim().slice(0, 100) : "";
  const clients = await listClients(search || undefined);

  return (
    <>
      <PageHeader
        title="Clientes"
        description={`${clients.length} cliente(s)${search ? ` encontrados para “${search}”` : ""}`}
        actions={
          <Link href="/admin/clientes/novo" className={linkButton.primary}>
            Novo cliente
          </Link>
        }
      />

      <form className="mb-6 flex max-w-xl gap-2" role="search">
        <label htmlFor="client-search" className="sr-only">
          Procurar clientes
        </label>
        <input
          id="client-search"
          name="q"
          type="search"
          defaultValue={search}
          placeholder="Procurar por nome, email, telefone, empresa ou NIF"
          className={`${inputClass} mt-0`}
        />
        <button type="submit" className={linkButton.navy}>
          Procurar
        </button>
      </form>

      {clients.length === 0 ? (
        <EmptyState>{search ? "Nenhum cliente encontrado." : "Ainda não há clientes registados."}</EmptyState>
      ) : (
        <div className={table.wrap}>
          <table className={table.table}>
            <thead>
              <tr>
                <th className={table.th}>Cliente</th>
                <th className={table.th}>Contacto</th>
                <th className={table.th}>Localidade</th>
                <th className={`${table.th} text-center`}>Pedidos</th>
                <th className={`${table.th} text-center`}>Orçamentos</th>
                <th className={`${table.th} text-right`}>Valor aceite</th>
                <th className={table.th}>Último acesso</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className={table.row}>
                  <td className={table.td}>
                    <Link href={`/admin/clientes/${client.id}`} className="font-semibold text-navy-900 hover:text-brand-700">
                      {client.name}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {[client.company, client.client_type].filter(Boolean).join(" · ") || "—"}
                    </p>
                    {client.active ? null : <StatusBadge tone="red">Desativado</StatusBadge>}
                  </td>
                  <td className={table.td}>
                    <p>{client.email}</p>
                    <p className="text-xs text-slate-500">{client.phone ?? "—"}</p>
                  </td>
                  <td className={table.td}>{client.city ?? "—"}</td>
                  <td className={`${table.td} text-center`}>{client.requests_count}</td>
                  <td className={`${table.td} text-center`}>{client.quotes_count}</td>
                  <td className={`${table.td} text-right tabular-nums`}>{formatMoney(client.accepted_total_cents)}</td>
                  <td className={`${table.td} whitespace-nowrap text-slate-500`}>
                    {client.last_login_at ? formatDate(client.last_login_at) : "Nunca"}
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
