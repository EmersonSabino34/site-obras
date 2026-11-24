import type { ReactNode } from "react";

import type { Dictionary } from "@/lib/i18n";

import { CheckIcon } from "../icons";
import { FullLogo } from "../logo";
import { Container } from "../ui";

/** Two-column layout for the login and registration pages. */
export function AuthShell({
  dict,
  title,
  subtitle,
  children,
}: {
  dict: Dictionary;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-navy-900/5 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="relative hidden overflow-hidden bg-navy-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div aria-hidden="true" className="bg-blueprint absolute inset-0" />
          <div className="relative">
            <FullLogo className="w-44" title="HENPROTRUST" />
          </div>
          <div className="relative">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-400">
              {dict.account.benefitsTitle}
            </p>
            <ul className="mt-6 space-y-4">
              {dict.account.benefits.map((benefit) => (
                <li key={benefit} className="flex gap-3 text-slate-200">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-500 text-navy-950">
                    <CheckIcon className="size-3.5" strokeWidth={3} />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <div className="p-6 sm:p-10">
          <h1 className="font-display text-2xl font-bold text-navy-900 sm:text-3xl">{title}</h1>
          <p className="mt-2 text-slate-600">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </Container>
  );
}
