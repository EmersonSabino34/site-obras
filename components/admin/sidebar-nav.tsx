"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ADMIN_NAV, AdminNavIcon } from "./nav-items";

function activeFor(pathname: string) {
  const match = [...ADMIN_NAV]
    .reverse()
    .find((item) => (item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)));
  return match?.href ?? null;
}

export function SidebarNav() {
  return <SidebarNavView activeHref={activeFor(usePathname())} />;
}

export function SidebarNavView({ activeHref }: { activeHref: string | null }) {
  return (
    <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {ADMIN_NAV.map((item) => {
        const active = item.href === activeHref;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <AdminNavIcon name={item.icon} className={`size-5 ${active ? "text-brand-400" : ""}`} />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
