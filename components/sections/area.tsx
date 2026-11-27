import type { Dictionary } from "@/lib/i18n";
import { site } from "@/lib/site";

import { ArrowRightIcon, MapPinIcon } from "../icons";
import { Container, SectionHeading } from "../ui";

export function Area({ dict }: { dict: Dictionary }) {
  const { area, anchors } = dict;

  return (
    <section id={anchors.area} className="bg-white py-20 sm:py-28 dark:bg-navy-950">
      <Container className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <SectionHeading eyebrow={area.eyebrow} title={area.title} intro={area.text} />
          <p className="mt-8 text-slate-600 dark:text-slate-300">
            {area.question}{" "}
            <a
              href={`#${anchors.contact}`}
              className="group inline-flex items-center gap-1.5 font-semibold text-brand-700 dark:text-brand-400 underline decoration-brand-500/40 underline-offset-4 hover:text-navy-900 dark:hover:text-white hover:decoration-navy-900 dark:hover:decoration-white"
            >
              {area.questionCta}
              <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </p>
        </div>

        <div className="reveal rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-navy-900 p-6 sm:p-10">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-navy-900 dark:text-white">
            <MapPinIcon className="size-5 text-brand-700 dark:text-brand-400" />
            {area.listTitle}
          </h3>
          <ul className="mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
            {site.areas.map((town) => {
              const isBase = town === site.base;
              return (
                <li
                  key={town}
                  className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 font-medium ${
                    isBase
                      ? "bg-navy-900 dark:bg-navy-950 text-white shadow-lg shadow-navy-900/20"
                      : "border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800 text-navy-900 dark:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className={`size-2 rounded-full ${isBase ? "bg-brand-500" : "bg-brand-500/50"}`}
                    />
                    {town}
                  </span>
                  {isBase ? (
                    <span className="rounded-full bg-brand-500 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-navy-950">
                      {area.baseBadge}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <p className="mt-5 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
            + {area.surroundings}
          </p>
        </div>
      </Container>
    </section>
  );
}
