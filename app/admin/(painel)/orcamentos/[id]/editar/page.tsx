import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { QuoteEditor } from "@/components/admin/quote-editor";
import { PageHeader } from "@/components/admin/ui";
import { PageSkeleton } from "@/components/skeleton";
import { unitLabel } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth/session";
import { getQuote } from "@/lib/data/quotes";
import { UNITS, VAT_RATES } from "@/lib/data/types";
import { listClientOptions } from "@/lib/data/users";

export default function EditQuotePage(props: PageProps<"/admin/orcamentos/[id]/editar">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ params }: PageProps<"/admin/orcamentos/[id]/editar">) {
  await requireAdmin();
  const { id } = await params;
  const quote = await getQuote(Number(id));
  if (!quote) notFound();
  // Only drafts can be edited; sent quotes must be withdrawn first.
  if (quote.status !== "rascunho") redirect(`/admin/orcamentos/${quote.id}`);
  const clients = await listClientOptions();

  return (
    <>
      <PageHeader
        back={{ href: `/admin/orcamentos/${quote.id}`, label: quote.number }}
        title={`Editar ${quote.number}`}
      />
      <QuoteEditor
        clients={clients}
        units={UNITS.map((unit) => ({ value: unit, label: unitLabel[unit] }))}
        vatRates={VAT_RATES}
        initial={{
          quoteId: quote.id,
          clientId: quote.user_id,
          requestId: quote.request_id,
          title: quote.title,
          location: quote.location,
          notes: quote.notes,
          vatRate: quote.vat_rate,
          validUntil: quote.valid_until,
          items: quote.items,
        }}
      />
    </>
  );
}
