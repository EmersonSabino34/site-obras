import Link from "next/link";
import { Suspense } from "react";

import { logoutAction } from "@/lib/actions/account";
import { getSessionUser } from "@/lib/auth/session";

import { HouseMark } from "../logo";
import { SidebarNav, SidebarNavView } from "./sidebar-nav";

async function CurrentAdmin() {
  const user = await getSessionUser();
  if (!user) return null;
  return (
    <Link href="/admin/conta" className="block min-w-0 rounded-lg hover:opacity-80" title="A minha conta">
      <p className="truncate text-sm font-semibold text-white">{user.name}</p>
      <p className="truncate text-xs text-slate-400">{user.email}</p>
    </Link>
  );
}

export function AdminSidebar() {
  return (
    <aside className="z-40 bg-navy-900 text-white print:hidden lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col">
      <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-3 lg:block lg:px-6 lg:pt-7 lg:pb-6">
        <Link href="/admin" className="flex items-center gap-3">
          <HouseMark className="h-8 w-auto" />
          <span className="leading-tight">
            <span className="block font-display text-sm font-semibold tracking-[0.24em]">HENPROTRUST</span>
            <span className="block text-xs text-slate-400">Gestão</span>
          </span>
        </Link>
        <form action={logoutAction} className="lg:hidden">
          <input type="hidden" name="scope" value="admin" />
          <button type="submit" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5">
            Sair
          </button>
        </form>
      </div>

      <nav aria-label="Gestão" className="px-3 pb-3 lg:flex-1 lg:px-4">
        <Suspense fallback={<SidebarNavView activeHref={null} />}>
          <SidebarNav />
        </Suspense>
      </nav>

      <div className="hidden border-t border-white/10 p-4 lg:block">
        <Suspense fallback={<div className="h-9" />}>
          <CurrentAdmin />
        </Suspense>
        <div className="mt-4 flex items-center gap-2">
          <Link
            href="/pt"
            target="_blank"
            className="flex-1 rounded-lg border border-white/15 px-3 py-2 text-center text-xs font-semibold text-slate-300 hover:bg-white/5"
          >
            Ver site
          </Link>
          <form action={logoutAction} className="flex-1">
            <input type="hidden" name="scope" value="admin" />
            <button
              type="submit"
              className="w-full rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-red-400/50 hover:text-red-300"
            >
              Terminar sessão
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
