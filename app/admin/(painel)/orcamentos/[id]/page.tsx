import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ActivityFeed } from "@/components/admin/activity-feed";
import { Card, InfoList, linkButton, PageHeader } from "@/components/admin/ui";
import { WhatsAppIcon } from "@/components/icons";
import { PrintButton } from "@/components/print-button";
import { QuoteDocument } from "@/components/quote-document";
import { PageSkeleton } from "@/components/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { cancelQuoteAction, sendQuoteAction, withdrawQuoteAction } from "@/lib/actions/admin";
import { quoteStatusLabel, statusTone, whatsappNumberFor } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth/session";
import { listActivity } from "@/lib/data/activity";
import { getQuote } from "@/lib/data/quotes";
import { getWorkByQuote } from "@/lib/data/works";
import { formatDate, formatDateTime, formatMoney, quoteDisplayStatus } from "@/lib/format";
import { getDictionary } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

export default function AdminQuotePage(props: PageProps<"/admin/orcamentos/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ params }: PageProps<"/admin/orcamentos/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const quote = await getQuote(Number(id));
  if (!quote) notFound();

  const [work, history] = await Promise.all([
    getWorkByQuote(quote.id),
    listActivity({ clientId: quote.user_id, limit: 200 }),
  ]);
  const quoteHistory = history.filter((entry) => entry.entity === "quote" && entry.entity_id === quote.id);
  const status = quoteDisplayStatus(quote);
  const pt = getDictionary("pt").account;

  const clientLocale = quote.client.locale === "en" ? "en" : "pt";
  const link = `${siteUrl}/${clientLocale}/conta/orcamentos/${quote.id}`;
  const firstName = quote.client.name.split(" ")[0];
  const message =
    clientLocale === "en"
      ? `Hello ${firstName}! We've sent you quote ${quote.number} (${formatMoney(quote.total_cents, "en")}). You can review and accept it in your client area: ${link}`
      : `Olá ${firstName}! Enviámos o orçamento ${quote.number} (${formatMoney(quote.total_cents)}). Pode consultá-lo e aceitá-lo na sua área de cliente: ${link}`;
  const wa = whatsappNumberFor(quote.client.phone);
  const id_ = <input type="hidden" name="id" value={quote.id} />;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/orcamentos", label: "Orçamentos" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {quote.number}
            <StatusBadge tone={statusTone[status]}>{quoteStatusLabel[status]}</StatusBadge>
          </span>
        }
        description={`${quote.title} · ${quote.client.name}`}
        actions={<PrintButton label="Imprimir / PDF" />}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] print:block">
        <QuoteDocument quote={quote} locale="pt" labels={pt.quotePage} units={pt.units} />

        <div className="space-y-6 print:hidden">
          <Card title="Ações">
            <div className="space-y-3">
              {quote.status === "rascunho" ? (
                <>
                  <Link href={`/admin/orcamentos/${quote.id}/editar`} className={`${linkButton.outline} w-full`}>
                    Editar orçamento
                  </Link>
                  <form action={sendQuoteAction}>
                    {id_}
                    <SubmitButton
                      className="w-full py-3"
                      confirmMessage={`Enviar o orçamento ${quote.number} a ${quote.client.name}? O cliente passa a vê-lo na área de cliente.`}
                    >
                      Enviar ao cliente
                    </SubmitButton>
                  </form>
                  {quote.items.length === 0 ? (
                    <p className="text-xs text-red-600">Adicione pelo menos uma linha antes de enviar.</p>
                  ) : null}
                </>
              ) : null}

              {quote.status === "enviado" ? (
                <>
                  {wa ? (
                    <a
                      href={`https://wa.me/${wa}?text=${encodeURIComponent(message)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${linkButton.whatsapp} w-full py-3`}
                    >
                      <WhatsAppIcon className="size-4" />
                      Avisar cliente no WhatsApp
                    </a>
                  ) : (
                    <p className="text-sm text-slate-500">O cliente não tem telefone registado.</p>
                  )}
                  <form action={withdrawQuoteAction}>
                    {id_}
                    <SubmitButton
                      variant="outline"
                      className="w-full"
                      confirmMessage="Retirar o orçamento? Deixa de estar disponível para o cliente e volta a rascunho para poder editá-lo."
                    >
                      Retirar para editar
                    </SubmitButton>
                  </form>
                </>
              ) : null}

              {quote.status === "rascunho" || quote.status === "enviado" ? (
                <form action={cancelQuoteAction}>
                  {id_}
                  <SubmitButton
                    variant="danger"
                    className="w-full"
                    confirmMessage={`Anular o orçamento ${quote.number}? Esta ação não pode ser desfeita.`}
                  >
                    Anular orçamento
                  </SubmitButton>
                </form>
              ) : null}

              {quote.status === "aceite" && work ? (
                <Link href={`/admin/obras/${work.id}`} className={`${linkButton.navy} w-full py-3`}>
                  Ver obra
                </Link>
              ) : null}
              {quote.status === "recusado" && quote.decision_note ? (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                  Motivo indicado pelo cliente: “{quote.decision_note}”
                </p>
              ) : null}
            </div>
          </Card>

          <Card title="Estado">
            <InfoList
              items={[
                { label: "Criado", value: formatDateTime(quote.created_at) },
                { label: "Enviado", value: formatDateTime(quote.sent_at) },
                { label: "Visto pelo cliente", value: quote.viewed_at ? formatDateTime(quote.viewed_at) : quote.status === "enviado" ? "Ainda não" : "—" },
                { label: quote.status === "recusado" ? "Recusado" : "Aceite", value: formatDateTime(quote.decided_at) },
                { label: "Válido até", value: formatDate(quote.valid_until) },
                {
                  label: "Cliente",
                  value: (
                    <Link href={`/admin/clientes/${quote.user_id}`} className="text-brand-700 hover:underline">
                      {quote.client.name}
                    </Link>
                  ),
                },
                {
                  label: "Pedido",
                  value: quote.request_id ? (
                    <Link href={`/admin/pedidos/${quote.request_id}`} className="text-brand-700 hover:underline">
                      #{quote.request_id}
                    </Link>
                  ) : (
                    "—"
                  ),
                },
              ]}
            />
          </Card>

          <Card title="Histórico do orçamento">
            <ActivityFeed entries={quoteHistory} empty="Sem registos." />
          </Card>
        </div>
      </div>
    </>
  );
}
