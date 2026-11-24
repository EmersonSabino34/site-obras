import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ActivityFeed } from "@/components/admin/activity-feed";
import { ResetPasswordForm } from "@/components/admin/admin-forms";
import { Card, InfoList, linkButton, PageHeader, StatCard } from "@/components/admin/ui";
import { WhatsAppIcon } from "@/components/icons";
import { PageSkeleton } from "@/components/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { toggleClientActiveAction } from "@/lib/actions/admin";
import {
  quoteStatusLabel,
  requestStatusLabel,
  statusTone,
  whatsappNumberFor,
  workStatusLabel,
} from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth/session";
import { listActivity } from "@/lib/data/activity";
import { listQuotesByUser } from "@/lib/data/quotes";
import { listRequestsForUser } from "@/lib/data/requests";
import { getUser } from "@/lib/data/users";
import { listWorksByUser } from "@/lib/data/works";
import { formatDate, formatDateTime, formatMoney, quoteDisplayStatus } from "@/lib/format";
import { siteUrl } from "@/lib/site";

export default function ClientPage(props: PageProps<"/admin/clientes/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}

function Row({ href, title, meta, badge }: { href: string; title: string; meta: string; badge: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="flex items-center justify-between gap-3 py-3 hover:text-brand-700">
        <span className="min-w-0">
          <span className="block truncate font-semibold text-navy-900">{title}</span>
          <span className="block truncate text-xs text-slate-500">{meta}</span>
        </span>
        {badge}
      </Link>
    </li>
  );
}

async function Content({ params }: PageProps<"/admin/clientes/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const client = await getUser(Number(id));
  if (!client || client.role !== "client") notFound();

  const [requests, quotes, works, activity] = await Promise.all([
    listRequestsForUser(client.id),
    listQuotesByUser(client.id),
    listWorksByUser(client.id),
    listActivity({ clientId: client.id, limit: 100 }),
  ]);
  const acceptedTotal = quotes.filter((q) => q.status === "aceite").reduce((sum, q) => sum + q.total_cents, 0);
  const wa = whatsappNumberFor(client.phone);

  return (
    <>
      <PageHeader
        back={{ href: "/admin/clientes", label: "Clientes" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {client.name}
            {client.active ? null : <StatusBadge tone="red">Conta desativada</StatusBadge>}
          </span>
        }
        description={`Cliente desde ${formatDate(client.created_at)} · último acesso ${client.last_login_at ? formatDateTime(client.last_login_at) : "nunca"}`}
        actions={
          <>
            {wa ? (
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className={linkButton.whatsapp}>
                <WhatsAppIcon className="size-4" />
                WhatsApp
              </a>
            ) : null}
            <Link href={`/admin/orcamentos/novo?cliente=${client.id}`} className={linkButton.primary}>
              Novo orçamento
            </Link>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pedidos" value={requests.length} />
        <StatCard label="Orçamentos enviados" value={quotes.filter((q) => q.status !== "rascunho").length} />
        <StatCard label="Valor aceite" value={formatMoney(acceptedTotal)} />
        <StatCard label="Obras" value={works.length} hint={`${works.filter((w) => w.status === "em_curso").length} em curso`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6">
          <Card title="Dados do cliente">
            <InfoList
              items={[
                { label: "Email", value: <a href={`mailto:${client.email}`} className="hover:text-brand-700">{client.email}</a> },
                { label: "Telefone", value: client.phone ? <a href={`tel:${client.phone.replace(/\s/g, "")}`}>{client.phone}</a> : null },
                { label: "Tipo", value: client.client_type },
                { label: "Empresa", value: client.company },
                { label: "NIF", value: client.nif },
                { label: "Localidade", value: client.city },
                { label: "Morada", value: client.address },
                { label: "Idioma", value: client.locale === "en" ? "English" : "Português" },
              ]}
            />
          </Card>

          <Card title="Acesso">
            <div className="space-y-3">
              {client.must_change_password ? (
                <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                  O cliente ainda usa uma palavra-passe temporária.
                </p>
              ) : null}
              <ResetPasswordForm
                clientId={client.id}
                name={client.name}
                email={client.email}
                phoneNumber={wa}
                locale={client.locale}
                siteUrl={siteUrl}
              />
              <form action={toggleClientActiveAction}>
                <input type="hidden" name="id" value={client.id} />
                <SubmitButton
                  variant={client.active ? "danger" : "outline"}
                  className="w-full"
                  confirmMessage={
                    client.active
                      ? "Desativar esta conta? O cliente deixa de conseguir entrar (os dados mantêm-se)."
                      : "Reativar esta conta?"
                  }
                >
                  {client.active ? "Desativar conta" : "Reativar conta"}
                </SubmitButton>
              </form>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title={`Orçamentos (${quotes.length})`}>
            {quotes.length === 0 ? (
              <p className="text-sm text-slate-500">Sem orçamentos.</p>
            ) : (
              <ul className="-my-3 divide-y divide-slate-100">
                {quotes.map((quote) => {
                  const status = quoteDisplayStatus(quote);
                  return (
                    <Row
                      key={quote.id}
                      href={`/admin/orcamentos/${quote.id}`}
                      title={`${quote.number} — ${quote.title}`}
                      meta={`${formatMoney(quote.total_cents)} · ${formatDate(quote.created_at)}`}
                      badge={<StatusBadge tone={statusTone[status]}>{quoteStatusLabel[status]}</StatusBadge>}
                    />
                  );
                })}
              </ul>
            )}
          </Card>

          <Card title={`Obras (${works.length})`}>
            {works.length === 0 ? (
              <p className="text-sm text-slate-500">Sem obras.</p>
            ) : (
              <ul className="-my-3 divide-y divide-slate-100">
                {works.map((work) => (
                  <Row
                    key={work.id}
                    href={`/admin/obras/${work.id}`}
                    title={work.title}
                    meta={`Início ${formatDate(work.start_date)} · conclusão ${formatDate(work.end_date)}`}
                    badge={<StatusBadge tone={statusTone[work.status]}>{workStatusLabel[work.status]}</StatusBadge>}
                  />
                ))}
              </ul>
            )}
          </Card>

          <Card title={`Pedidos (${requests.length})`}>
            {requests.length === 0 ? (
              <p className="text-sm text-slate-500">Sem pedidos.</p>
            ) : (
              <ul className="-my-3 divide-y divide-slate-100">
                {requests.map((request) => (
                  <Row
                    key={request.id}
                    href={`/admin/pedidos/${request.id}`}
                    title={request.service}
                    meta={[request.location, formatDate(request.created_at)].filter(Boolean).join(" · ")}
                    badge={<StatusBadge tone={statusTone[request.status]}>{requestStatusLabel[request.status]}</StatusBadge>}
                  />
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card title="Cronologia do cliente">
          <ActivityFeed entries={activity} />
        </Card>
      </div>
    </>
  );
}
