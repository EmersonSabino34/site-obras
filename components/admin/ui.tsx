import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowRightIcon } from "../icons";

export const table = {
  wrap: "overflow-x-auto rounded-2xl border border-slate-200 bg-white",
  table: "w-full min-w-[720px] text-left text-sm",
  th: "border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500",
  td: "border-b border-slate-100 px-4 py-3.5 align-middle",
  row: "transition-colors hover:bg-slate-50",
};

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-8">
      {back ? (
        <Link
          href={back.href}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy-900 print:hidden"
        >
          <ArrowRightIcon className="size-4 rotate-180" />
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-navy-900 sm:text-3xl">{title}</h1>
          {description ? <div className="mt-1.5 text-slate-600">{description}</div> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2 print:hidden">{actions}</div> : null}
      </div>
    </div>
  );
}

export function Card({
  title,
  action,
  children,
  className = "",
  padded = true,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white ${className}`}>
      {title ? (
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 className="font-display text-base font-bold text-navy-900">{title}</h2>
          {action}
        </header>
      ) : null}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  href,
  highlight = false,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  href?: string;
  highlight?: boolean;
}) {
  const body = (
    <>
      <p className={`text-sm font-medium ${highlight ? "text-navy-900" : "text-slate-500"}`}>{label}</p>
      <p className="mt-2 font-display text-xl font-bold tracking-tight break-words text-navy-900 sm:text-3xl">{value}</p>
      {hint ? <p className={`mt-1 text-xs sm:text-sm ${highlight ? "text-navy-900/80" : "text-slate-500"}`}>{hint}</p> : null}
    </>
  );
  const className = `block rounded-2xl border p-4 transition sm:p-5 ${
    highlight ? "border-brand-500 bg-brand-500" : "border-slate-200 bg-white"
  } ${href ? "hover:-translate-y-0.5 hover:shadow-md" : ""}`;
  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

export function EmptyState({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <p className="text-slate-500">{children}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function FilterTabs({ items }: { items: { label: string; href: string; active: boolean }[] }) {
  return (
    <nav aria-label="Filtrar" className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-slate-200/60 p-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
            item.active ? "bg-white text-navy-900 shadow-sm" : "text-slate-600 hover:text-navy-900"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function InfoList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="divide-y divide-slate-100">
      {items.map((item) => (
        <div key={item.label} className="grid grid-cols-[8.5rem_1fr] gap-3 py-2.5 text-sm">
          <dt className="text-slate-500">{item.label}</dt>
          <dd className="min-w-0 break-words font-medium text-navy-900">{item.value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export const linkButton = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-navy-950 shadow-sm transition-colors hover:bg-brand-400",
  navy: "inline-flex items-center justify-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-800",
  outline:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:border-navy-900",
  whatsapp:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-whatsapp px-4 py-2.5 text-sm font-semibold text-navy-950 shadow-sm transition-colors hover:bg-whatsapp-light",
};
