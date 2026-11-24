import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminNameForm, AdminPasswordForm } from "@/components/admin/admin-forms";
import { Card, InfoList, PageHeader } from "@/components/admin/ui";
import { PageSkeleton } from "@/components/skeleton";
import { requireAdmin } from "@/lib/auth/session";
import { getUser } from "@/lib/data/users";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "A minha conta" };

export default function AdminAccountPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const session = await requireAdmin();
  const admin = await getUser(session.id);

  return (
    <>
      <PageHeader title="A minha conta" description="Os seus dados de acesso à gestão." />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card title="Dados de acesso">
            <InfoList
              items={[
                { label: "Email", value: session.email },
                { label: "Conta criada", value: formatDateTime(admin?.created_at) },
                { label: "Último acesso", value: formatDateTime(admin?.last_login_at) },
              ]}
            />
            <p className="mt-4 text-xs text-slate-500">
              O email de acesso não pode ser alterado aqui. Para criar outro administrador, use o comando{" "}
              <code className="rounded bg-slate-100 px-1">npm run admin:create</code> (ver README).
            </p>
          </Card>
          <Card title="Nome">
            <AdminNameForm name={session.name} />
          </Card>
        </div>
        <Card title="Alterar palavra-passe" className="h-fit">
          <AdminPasswordForm />
        </Card>
      </div>
    </>
  );
}
