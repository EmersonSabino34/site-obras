import Link from "next/link";

import { logoutAction } from "@/lib/actions/account";
import type { Dictionary } from "@/lib/i18n";

export function AccountNav({
  lang,
  dict,
  current,
}: {
  lang: string;
  dict: Dictionary;
  current: "dashboard" | "request" | "profile" | "quote";
}) {
  const t = dict.account;
  const links = [
    { key: "dashboard", href: `/${lang}/conta`, label: t.dashboard },
    { key: "request", href: `/${lang}/conta/pedidos/novo`, label: t.newRequest },
    { key: "profile", href: `/${lang}/conta/perfil`, label: t.profile },
  ] as const;

  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 dark:border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
      <nav aria-label={t.area} className="-mx-1 flex gap-1 overflow-x-auto">
        {links.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            aria-current={current === link.key ? "page" : undefined}
            className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
              current === link.key
                ? "bg-navy-900 text-white dark:bg-white/10"
                : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/5 hover:text-navy-900 dark:hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <form action={logoutAction}>
        <input type="hidden" name="lang" value={lang} />
        <button
          type="submit"
          className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 transition-colors hover:bg-white dark:hover:bg-white/5 hover:text-red-700 dark:hover:text-red-300"
        >
          {t.logout}
        </button>
      </form>
    </div>
  );
}
