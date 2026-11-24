import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { QuoteEditor } from "@/components/admin/quote-editor";
import { EmptyState, linkButton, PageHeader } from "@/components/admin/ui";
import { PageSkeleton } from "@/components/skeleton";
import { unitLabel } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth/session";
import { getRequest } from "@/lib/data/requests";
import { UNITS, VAT_RATES } from "@/lib/data/types";
import { getUser, listClientOptions } from "@/lib/data/users";
import { addDays, todayLisbon } from "@/lib/format";

export const metadata: Metadata = { title: "Novo orçamento" };

export default function NewQuotePage(props: PageProps<"/admin/orcamentos/novo">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ searchParams }: PageProps<"/admin/orcamentos/novo">) {
  await requireAdmin();
  const { pedido, cliente } = await searchParams;
  const [clients, request] = await Promise.all([
    listClientOptions(),
    pedido ? getRequest(Number(pedido)) : Promise.resolve(null),
  ]);
  const client = !request && cliente ? await getUser(Number(cliente)) : null;

  if (clients.length === 0) {
    return (
      <>
        <PageHeader back={{ href: "/admin/orcamentos", label: "Orçamentos" }} title="Novo orçamento" />
        <EmptyState
          action={
            <Link href="/admin/clientes/novo" className={linkButton.primary}>
              Criar cliente
            </Link>
          }
        >
          Para criar um orçamento é preciso um cliente. Crie a conta do cliente primeiro — ele recebe o acesso
          para aceitar o orçamento online.
        </EmptyState>
      </>
    );
  }

  return (
    <>
      <PageHeader
        back={{ href: request ? `/admin/pedidos/${request.id}` : "/admin/orcamentos", label: request ? `Pedido #${request.id}` : "Orçamentos" }}
        title="Novo orçamento"
        description="Preencha os trabalhos e valores. Pode rever tudo antes de enviar ao cliente."
      />
      <QuoteEditor
        clients={clients}
        units={UNITS.map((unit) => ({ value: unit, label: unitLabel[unit] }))}
        vatRates={VAT_RATES}
        requestSummary={
          request
            ? `Pedido #${request.id} de ${request.client_name}: “${request.description.slice(0, 220)}${request.description.length > 220 ? "…" : ""}”`
            : undefined
        }
        initial={{
          clientId: request?.user_id ?? client?.id,
          requestId: request?.id ?? null,
          title: request?.service,
          location: request?.location ?? client?.city,
          vatRate: 23,
          validUntil: addDays(todayLisbon(), 30),
        }}
      />
    </>
  );
}
