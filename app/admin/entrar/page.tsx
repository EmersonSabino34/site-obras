import type { Metadata } from "next";

import { LoginForm } from "@/components/account/login-form";
import { FullLogo } from "@/components/logo";

export const metadata: Metadata = { title: "Entrar" };

export default function AdminLoginPage() {
  return (
    <main className="bg-blueprint flex min-h-svh items-center justify-center bg-navy-900 px-5 py-12">
      <div className="w-full max-w-md">
        <FullLogo className="mx-auto w-44" title="HENPROTRUST" />
        <div className="mt-10 rounded-3xl bg-white p-8 shadow-2xl shadow-black/30 sm:p-10">
          <h1 className="font-display text-2xl font-bold text-navy-900">Gestão</h1>
          <p className="mt-1 text-slate-600">Acesso reservado à equipa HENPROTRUST.</p>
          <div className="mt-8">
            <LoginForm
              lang="pt"
              scope="admin"
              labels={{ email: "Email", password: "Palavra-passe", submit: "Entrar" }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
