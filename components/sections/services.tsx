import type { ComponentType, SVGProps } from "react";

import type { Dictionary } from "@/lib/i18n";

import {
  ArrowRightIcon,
  DropletIcon,
  HammerIcon,
  InfoIcon,
  LayersIcon,
  PaintRollerIcon,
  TilesIcon,
  WrenchIcon,
} from "../icons";
import { Container, SectionHeading } from "../ui";

const icons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  painting: PaintRollerIcon,
  flooring: TilesIcon,
  drywall: LayersIcon,
  plumbing: DropletIcon,
  renovation: HammerIcon,
  maintenance: WrenchIcon,
};

export function Services({ dict }: { dict: Dictionary }) {
  const { services, anchors } = dict;

  return (
    <section id={anchors.services} className="bg-white py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={services.eyebrow}
            title={services.title}
            intro={services.intro}
          />
          <a
            href={`#${anchors.contact}`}
            className="group inline-flex shrink-0 items-center gap-2 font-semibold text-brand-700 hover:text-navy-900"
          >
            {services.cta}
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {services.items.map((service, index) => {
            const Icon = icons[service.id] ?? WrenchIcon;
            return (
              <li
                key={service.id}
                className="reveal group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-xl hover:shadow-navy-900/[0.07] sm:p-8"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-brand-500 transition-transform duration-300 group-hover:scale-x-100"
                />
                <div className="flex items-start justify-between">
                  <span className="grid size-14 place-items-center rounded-xl bg-navy-900 text-brand-400 transition-colors group-hover:bg-brand-500 group-hover:text-navy-950">
                    <Icon className="size-7" />
                  </span>
                  <span aria-hidden="true" className="font-display text-sm font-bold text-slate-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl font-bold text-navy-900">
                  {service.title}
                </h3>
                <p className="mt-3 leading-relaxed text-slate-600">{service.description}</p>
              </li>
            );
          })}
        </ul>

        <p className="mt-8 flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm leading-relaxed text-slate-600">
          <InfoIcon className="mt-0.5 size-5 shrink-0 text-slate-400" />
          {services.note}
        </p>
      </Container>
    </section>
  );
}
