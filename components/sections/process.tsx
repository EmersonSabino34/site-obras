import type { Dictionary } from "@/lib/i18n";

import { Container, SectionHeading } from "../ui";

export function Process({ dict }: { dict: Dictionary }) {
  const { process, anchors } = dict;

  return (
    <section
      id={anchors.process}
      className="relative isolate overflow-hidden bg-navy-900 py-20 text-white sm:py-28"
    >
      <div
        aria-hidden="true"
        className="bg-blueprint absolute inset-0 -z-10 mask-[linear-gradient(to_bottom,black,transparent)]"
      />
      <Container>
        <SectionHeading
          eyebrow={process.eyebrow}
          title={process.title}
          intro={process.intro}
          align="center"
          tone="dark"
        />

        <div className="relative mt-16">
          {/* Connecting line on large screens */}
          <div
            aria-hidden="true"
            className="absolute top-8 right-[12.5%] left-[12.5%] hidden h-px bg-linear-to-r from-brand-500/0 via-brand-500/60 to-brand-500/0 lg:block"
          />
          <ol className="relative grid gap-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-8">
            {process.steps.map((step, index) => (
              <li key={step.title} className="reveal text-center">
                <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-brand-500/40 bg-navy-800 font-display text-xl font-extrabold text-brand-400 shadow-lg shadow-black/20">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 font-display text-lg font-bold">{step.title}</h3>
                <p className="mx-auto mt-3 max-w-xs leading-relaxed text-slate-300">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
