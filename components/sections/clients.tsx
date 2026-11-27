import type { ComponentType, SVGProps } from "react";

import type { Dictionary } from "@/lib/i18n";

import { BedIcon, BriefcaseIcon, BuildingIcon, KeyIcon } from "../icons";
import { Container, SectionHeading } from "../ui";

const icons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  condominiums: BuildingIcon,
  companies: BriefcaseIcon,
  realEstate: KeyIcon,
  tourism: BedIcon,
};

export function Clients({ dict }: { dict: Dictionary }) {
  const { clients, anchors } = dict;

  return (
    <section id={anchors.clients} className="bg-slate-50 py-20 sm:py-28 dark:bg-navy-900">
      <Container>
        <SectionHeading
          eyebrow={clients.eyebrow}
          title={clients.title}
          intro={clients.intro}
          align="center"
        />

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {clients.items.map((client) => {
            const Icon = icons[client.id] ?? BuildingIcon;
            return (
              <li
                key={client.id}
                className="reveal group flex flex-col rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800 p-7 transition duration-300 hover:border-navy-900 dark:hover:border-white/40 hover:bg-navy-900 dark:hover:bg-navy-700"
              >
                <span className="grid size-12 place-items-center rounded-full bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-400 transition-colors group-hover:bg-brand-500 group-hover:text-navy-950">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-6 font-display text-lg font-bold text-navy-900 dark:text-white transition-colors group-hover:text-white">
                  {client.title}
                </h3>
                <p className="mt-2.5 leading-relaxed text-slate-600 dark:text-slate-300 transition-colors group-hover:text-slate-300">
                  {client.description}
                </p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
