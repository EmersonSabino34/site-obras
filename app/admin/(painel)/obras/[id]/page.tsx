import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { WorkUpdateForm } from "@/components/admin/admin-forms";
import { Card, InfoList, linkButton, PageHeader } from "@/components/admin/ui";
import { inputClass } from "@/components/forms";
import { WhatsAppIcon } from "@/components/icons";
import { PageSkeleton } from "@/components/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { updateWorkDatesAction, updateWorkStatusAction } from "@/lib/actions/admin";
import { statusTone, whatsappNumberFor, workStatusLabel } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth/session";
import { WORK_STATUSES } from "@/lib/data/types";
import { getWork, listWorkUpdates } from "@/lib/data/works";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";

export default function WorkPage(props: PageProps<"/admin/obras/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ params }: PageProps<"/admin/obras/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const work = await getWork(Number(id));
  if (!work) notFound();
  const updates = await listWorkUpdates(work.id);
  const wa = whatsappNumberFor(work.client_phone);

  return (
    <>
      <PageHeader
        back={{ href: "/admin/obras", label: "Obras" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {work.title}
            <StatusBadge tone={statusTone[work.status]}>{workStatusLabel[work.status]}</StatusBadge>
          </span>
        }
        description={`${work.client_name}${work.location ? ` · ${work.location}` : ""}`}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card title="Publicar atualização">
            <WorkUpdateForm workId={work.id} />
          </Card>

          <Card title={`Atualizações (${updates.length})`}>
            {updates.length === 0 ? (
              <p className="text-sm text-slate-500">Ainda não há atualizações nesta obra.</p>
            ) : (
              <ol className="space-y-4">
                {updates.map((update) => (
                  <li key={update.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                      <span>
                        {formatDateTime(update.created_at)}
                        {update.author_name ? ` · ${update.author_name}` : ""}
                      </span>
                      {update.visible_to_client ? (
                        <StatusBadge tone="green">Visível ao cliente</StatusBadge>
                      ) : (
                        <StatusBadge tone="gray">Nota interna</StatusBadge>
                      )}
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm text-navy-900">{update.message}</p>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Estado da obra">
            <form action={updateWorkStatusAction} className="flex gap-2">
              <input type="hidden" name="id" value={work.id} />
              <label htmlFor="work-status" className="sr-only">
                Estado
              </label>
              <select id="work-status" name="status" defaultValue={work.status} className={`${inputClass} mt-0`}>
                {WORK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {workStatusLabel[status]}
                  </option>
                ))}
              </select>
              <SubmitButton variant="navy">Guardar</SubmitButton>
            </form>
            <p className="mt-3 text-xs text-slate-500">
              Ao passar a “Em curso” ou “Concluída”, a data correspondente é preenchida automaticamente se estiver vazia.
            </p>
          </Card>

          <Card title="Datas">
            <form action={updateWorkDatesAction} className="space-y-4">
              <input type="hidden" name="id" value={work.id} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="work-start" className="text-sm font-semibold text-navy-900">
                    Início
                  </label>
                  <input id="work-start" type="date" name="start_date" defaultValue={work.start_date ?? ""} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="work-end" className="text-sm font-semibold text-navy-900">
                    Conclusão
                  </label>
                  <input id="work-end" type="date" name="end_date" defaultValue={work.end_date ?? ""} className={inputClass} />
                </div>
              </div>
              <SubmitButton variant="outline">Guardar datas</SubmitButton>
            </form>
          </Card>

          <Card title="Detalhes">
            <InfoList
              items={[
                {
                  label: "Cliente",
                  value: (
                    <Link href={`/admin/clientes/${work.user_id}`} className="text-brand-700 hover:underline">
                      {work.client_name}
                    </Link>
                  ),
                },
                {
                  label: "Orçamento",
                  value: work.quote_id ? (
                    <Link href={`/admin/orcamentos/${work.quote_id}`} className="text-brand-700 hover:underline">
                      {work.quote_number}
                    </Link>
                  ) : (
                    "—"
                  ),
                },
                { label: "Valor", value: work.total_cents !== null ? formatMoney(work.total_cents) : "—" },
                { label: "Aberta em", value: formatDate(work.created_at) },
              ]}
            />
            {wa ? (
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkButton.whatsapp} mt-4 w-full`}
              >
                <WhatsAppIcon className="size-4" />
                Contactar cliente
              </a>
            ) : null}
          </Card>
        </div>
      </div>
    </>
  );
}
