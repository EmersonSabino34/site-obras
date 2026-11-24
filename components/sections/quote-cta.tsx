import type { Dictionary } from "@/lib/i18n";
import { site, whatsappLink } from "@/lib/site";

import { PhoneIcon, WhatsAppIcon } from "../icons";
import { HouseMark } from "../logo";
import { buttonStyles, Container } from "../ui";

export function QuoteCta({ dict }: { dict: Dictionary }) {
  const { quote } = dict;

  return (
    <section className="relative isolate overflow-hidden bg-brand-500">
      <HouseMark
        letters="transparent"
        className="pointer-events-none absolute -top-10 -right-20 -z-10 w-[34rem] opacity-[0.12] mix-blend-multiply"
      />
      <Container className="flex flex-col gap-8 py-14 sm:py-16 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">
            {quote.title}
          </h2>
          <p className="mt-3 text-pretty text-lg font-medium text-navy-900">{quote.text}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <a
            href={whatsappLink(dict.common.whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles.navy}
          >
            <WhatsAppIcon className="size-5" />
            {quote.whatsapp}
          </a>
          <a href={site.phoneHref} className={buttonStyles.outlineNavy}>
            <PhoneIcon className="size-5" />
            {quote.call}
          </a>
        </div>
      </Container>
    </section>
  );
}
