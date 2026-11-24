import type { Dictionary } from "@/lib/i18n";
import { whatsappLink } from "@/lib/site";

import {
  ArrowRightIcon,
  BadgeCheckIcon,
  CheckIcon,
  MapPinIcon,
  WhatsAppIcon,
} from "../icons";
import { FullLogo } from "../logo";
import { buttonStyles, Container } from "../ui";

export function Hero({ dict }: { dict: Dictionary }) {
  const { hero, anchors, clients } = dict;

  return (
    <section className="relative isolate overflow-hidden bg-navy-900 text-white">
      {/* Blueprint grid + roof lines echoing the logo */}
      <div
        aria-hidden="true"
        className="bg-blueprint absolute inset-0 -z-10 mask-[radial-gradient(ellipse_at_top_right,black_20%,transparent_75%)]"
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 200 100"
        className="absolute -right-24 -bottom-10 -z-10 w-4xl max-w-none text-brand-500 opacity-[0.07]"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
      >
        <path d="M2 98 100 2l98 96" />
        <path d="M22 98 100 22l78 76" />
      </svg>

      <Container className="grid items-center gap-16 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:py-28">
        <div>
          <p className="motion-safe:animate-fade-up inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-300 sm:text-sm">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-500" />
            {hero.eyebrow}
          </p>

          <h1 className="motion-safe:animate-fade-up mt-7 text-balance font-display text-4xl font-extrabold leading-[1.08] tracking-tight [animation-delay:80ms] sm:text-5xl lg:text-[3.6rem]">
            {hero.titleStart}{" "}
            <span className="text-brand-500">{hero.titleHighlight}</span>
          </h1>

          <p className="motion-safe:animate-fade-up mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-300 [animation-delay:160ms] sm:text-xl">
            {hero.subtitle}
          </p>

          <div className="motion-safe:animate-fade-up mt-10 flex flex-col gap-3 [animation-delay:240ms] sm:flex-row sm:gap-4">
            <a
              href={whatsappLink(dict.common.whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles.primary}
            >
              <WhatsAppIcon className="size-5" />
              {hero.primaryCta}
            </a>
            <a href={`#${anchors.services}`} className={buttonStyles.outlineDark}>
              {hero.secondaryCta}
              <ArrowRightIcon className="size-4" />
            </a>
          </div>

          <ul className="motion-safe:animate-fade-up mt-10 flex flex-wrap gap-x-7 gap-y-3 [animation-delay:320ms]">
            {hero.highlights.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <span className="grid size-5 place-items-center rounded-full bg-brand-500/15 text-brand-400">
                  <CheckIcon className="size-3.5" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Brand card */}
        <div className="motion-safe:animate-fade-up relative mx-auto w-full max-w-md [animation-delay:200ms] lg:max-w-none">
          <div aria-hidden="true" className="absolute -inset-6 -z-10 rounded-4xl bg-brand-500/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-navy-800/80 p-8 shadow-2xl shadow-black/30 backdrop-blur sm:p-10">
            <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-brand-500" />
            <FullLogo className="mx-auto w-full max-w-75" title="HENPROTRUST" />

            <div className="mt-10 border-t border-white/10 pt-8">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-brand-400">
                <BadgeCheckIcon className="size-5" />
                {hero.cardTitle}
              </p>
              <p className="mt-3 leading-relaxed text-slate-300">{hero.cardText}</p>

              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                {hero.cardFor}
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {clients.items.map((client) => (
                  <li
                    key={client.id}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200"
                  >
                    {client.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="absolute -bottom-7 left-4 flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-navy-900 shadow-xl shadow-black/20 sm:-left-6">
            <span className="grid size-10 place-items-center rounded-lg bg-brand-50 text-brand-700">
              <MapPinIcon className="size-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold">{hero.baseLabel}</span>
              <span className="block text-xs text-slate-500">{hero.baseValue}</span>
            </span>
          </div>
        </div>
      </Container>

      <div aria-hidden="true" className="h-1 bg-brand-500" />
    </section>
  );
}
