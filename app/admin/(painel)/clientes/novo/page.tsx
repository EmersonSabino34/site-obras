import type { Metadata } from "next";
import { Suspense } from "react";

import { NewClientForm } from "@/components/admin/admin-forms";
import { PageHeader } from "@/components/admin/ui";
import { PageSkeleton } from "@/components/skeleton";
import { requireAdmin } from "@/lib/auth/session";
import { getDictionary } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = { title: "Novo cliente" };

export default function NewClientPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  await requireAdmin();
  return (
    <>
      <PageHeader
        back={{ href: "/admin/clientes", label: "Clientes" }}
        title="Novo cliente"
        description="Para clientes que chegaram por WhatsApp ou telefone. É gerada uma palavra-passe temporária para lhe enviar."
      />
      <div className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <NewClientForm clientTypes={getDictionary("pt").form.clientTypes} siteUrl={siteUrl} />
      </div>
    </>
  );
}
