import type { Dictionary } from "@/lib/i18n";

import { CheckIcon, QuoteIcon } from "../icons";
import { HouseMark } from "../logo";
import { Container, SectionHeading } from "../ui";

export function About({ dict }: { dict: Dictionary }) {
  const { about, anchors } = dict;

  return (
    <section id={anchors.about} className="bg-white py-20 sm:py-28">
      <Container className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading eyebrow={about.eyebrow} title={about.title} intro={about.text} />

          <ul className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {about.values.map((value) => (
              <li key={value.title} className="reveal flex gap-4">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-brand-500 text-navy-950">
                  <CheckIcon className="size-4" strokeWidth={3} />
                </span>
                <span>
                  <span className="block font-display font-bold text-navy-900">{value.title}</span>
                  <span className="mt-1 block leading-relaxed text-slate-600">{value.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="reveal relative flex">
          <div className="relative flex w-full flex-col justify-between overflow-hidden rounded-3xl bg-navy-900 p-8 text-white sm:p-12">
            <div aria-hidden="true" className="bg-blueprint absolute inset-0 opacity-60" />
            <HouseMark className="pointer-events-none absolute -right-16 -bottom-6 w-96 opacity-[0.08]" />

            <div className="relative">
              <QuoteIcon className="size-10 text-brand-500" />
              <h3 className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-brand-400">
                {about.commitmentTitle}
              </h3>
              <p className="mt-4 text-pretty font-display text-2xl font-semibold leading-snug sm:text-[1.75rem]">
                {about.commitmentText}
              </p>
            </div>

            <div className="relative mt-12 flex items-center gap-4 border-t border-white/10 pt-8">
              <HouseMark className="h-9 w-auto" />
              <div className="leading-tight">
                <p className="font-display font-semibold tracking-[0.24em]">HENPROTRUST</p>
                <p className="mt-1 text-sm text-slate-400">{dict.common.tagline}</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
