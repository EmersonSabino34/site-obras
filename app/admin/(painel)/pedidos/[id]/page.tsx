import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Card, InfoList, linkButton, PageHeader } from "@/components/admin/ui";
import { inputBase } from "@/components/forms";
import { WhatsAppIcon } from "@/components/icons";
import { PageSkeleton } from "@/components/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { updateRequestStatusAction } from "@/lib/actions/admin";
import { quoteStatusLabel, requestStatusLabel, statusTone, whatsappNumberFor } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth/session";
import { listQuotesByRequest } from "@/lib/data/quotes";
import { getRequest } from "@/lib/data/requests";
import { REQUEST_STATUSES } from "@/lib/data/types";
import { formatDate, formatDateTime, formatMoney, quoteDisplayStatus } from "@/lib/format";

export default function RequestPage(props: PageProps<"/admin/pedidos/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ params }: PageProps<"/admin/pedidos/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const request = await getRequest(Number(id));
  if (!request) notFound();
  const quotes = await listQuotesByRequest(request.id);
  const wa = whatsappNumberFor(request.client_phone);

  return (
    <>
      <PageHeader
        back={{ href: "/admin/pedidos", label: "Pedidos" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            Pedido #{request.id}
            <StatusBadge tone={statusTone[request.status]}>{requestStatusLabel[request.status]}</StatusBadge>
          </span>
        }
        description={`${request.service} · recebido em ${formatDateTime(request.created_at)}`}
        actions={
          <Link href={`/admin/orcamentos/novo?pedido=${request.id}`} className={linkButton.primary}>
            Criar orçamento
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card title="Descrição do pedido">
            <InfoList
              items={[
                { label: "Serviço", value: request.service },
                { label: "Localidade", value: request.location },
              ]}
            />
            <p className="mt-4 whitespace-pre-line rounded-xl bg-slate-50 p-4 leading-relaxed text-slate-700">
              {request.description}
            </p>
          </Card>

          <Card title="Orçamentos deste pedido">
            {quotes.length === 0 ? (
              <p className="text-sm text-slate-500">Ainda não foi criado nenhum orçamento para este pedido.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {quotes.map((quote) => {
                  const status = quoteDisplayStatus(quote);
                  return (
                    <li key={quote.id} className="flex items-center justify-between gap-3 py-3">
                      <Link href={`/admin/orcamentos/${quote.id}`} className="font-semibold text-navy-900 hover:text-brand-700">
                        {quote.number}
                        <span className="ml-2 font-normal text-slate-500">{formatMoney(quote.total_cents)}</span>
                      </Link>
                      <StatusBadge tone={statusTone[status]}>{quoteStatusLabel[status]}</StatusBadge>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Cliente">
            <InfoList
              items={[
                {
                  label: "Nome",
                  value: (
                    <Link href={`/admin/clientes/${request.user_id}`} className="text-brand-700 hover:underline">
                      {request.client_name}
                    </Link>
                  ),
                },
                { label: "Email", value: <a href={`mailto:${request.client_email}`}>{request.client_email}</a> },
                { label: "Telefone", value: request.client_phone },
              ]}
            />
            {wa ? (
              <a
                href={`https://wa.me/${wa}?text=${encodeURIComponent(`Olá ${request.client_name.split(" ")[0]}! Recebemos o seu pedido de orçamento (${request.service}).`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkButton.whatsapp} mt-4 w-full`}
              >
                <WhatsAppIcon className="size-4" />
                Contactar no WhatsApp
              </a>
            ) : null}
          </Card>

          <Card title="Estado do pedido">
            <form action={updateRequestStatusAction} className="flex gap-2">
              <input type="hidden" name="id" value={request.id} />
              <label htmlFor="request-status" className="sr-only">
                Estado
              </label>
              <select id="request-status" name="status" defaultValue={request.status} className={inputBase}>
                {REQUEST_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {requestStatusLabel[status]}
                  </option>
                ))}
              </select>
              <SubmitButton variant="navy">Guardar</SubmitButton>
            </form>
            <p className="mt-3 text-xs text-slate-500">Atualizado em {formatDate(request.updated_at)}.</p>
          </Card>
        </div>
      </div>
    </>
  );
}
