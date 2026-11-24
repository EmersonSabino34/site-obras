import type { Metadata } from "next";
import { Suspense } from "react";

import { ActivityFeed } from "@/components/admin/activity-feed";
import { Card, FilterTabs, PageHeader } from "@/components/admin/ui";
import { PageSkeleton } from "@/components/skeleton";
import { requireAdmin } from "@/lib/auth/session";
import { listActivity } from "@/lib/data/activity";

export const metadata: Metadata = { title: "Histórico" };

const FILTERS = [
  { key: "", label: "Tudo" },
  { key: "client", label: "Clientes" },
  { key: "request", label: "Pedidos" },
  { key: "quote", label: "Orçamentos" },
  { key: "work", label: "Obras" },
];

export default function ActivityPage(props: PageProps<"/admin/atividade">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ searchParams }: PageProps<"/admin/atividade">) {
  await requireAdmin();
  const { tipo } = await searchParams;
  const filter = FILTERS.find((item) => item.key === tipo && item.key) ?? FILTERS[0];
  const entries = await listActivity({ action: filter.key || undefined, limit: 300 });

  return (
    <>
      <PageHeader
        title="Histórico"
        description="Tudo o que aconteceu: registos de clientes, pedidos, orçamentos enviados e aceites, e o andamento das obras."
      />
      <FilterTabs
        items={FILTERS.map((item) => ({
          label: item.label,
          href: item.key ? `/admin/atividade?tipo=${item.key}` : "/admin/atividade",
          active: item.key === filter.key,
        }))}
      />
      <Card>
        <ActivityFeed entries={entries} />
        {entries.length === 300 ? (
          <p className="mt-6 text-center text-xs text-slate-500">A mostrar os 300 registos mais recentes.</p>
        ) : null}
      </Card>
    </>
  );
}
