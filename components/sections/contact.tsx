import type { ComponentType, ReactNode, SVGProps } from "react";

import type { Dictionary } from "@/lib/i18n";
import { site, whatsappLink } from "@/lib/site";

import { ContactForm } from "../contact-form";
import { MailIcon, MapPinIcon, PhoneIcon, WhatsAppIcon } from "../icons";
import { Container, SectionHeading } from "../ui";

function ContactItem({
  icon: Icon,
  label,
  children,
  accent = false,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <li className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5">
      <span
        className={`grid size-12 shrink-0 place-items-center rounded-xl ${
          accent ? "bg-whatsapp text-navy-950" : "bg-navy-900 text-brand-400"
        }`}
      >
        <Icon className="size-6" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
        <div className="mt-1">{children}</div>
      </div>
    </li>
  );
}

const linkClass =
  "break-words text-lg font-semibold text-navy-900 underline decoration-transparent underline-offset-4 transition-colors hover:text-brand-700 hover:decoration-brand-500";

export function Contact({ dict }: { dict: Dictionary }) {
  const { contact, form, anchors, services } = dict;

  return (
    <section id={anchors.contact} className="bg-slate-50 py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <SectionHeading eyebrow={contact.eyebrow} title={contact.title} intro={contact.intro} />

          <ul className="mt-10 grid gap-4">
            <ContactItem icon={WhatsAppIcon} label={contact.whatsappLabel} accent>
              <a
                href={whatsappLink(dict.common.whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                {site.phoneDisplay}
              </a>
              <p className="text-sm text-slate-500">{contact.whatsappValue}</p>
            </ContactItem>

            <ContactItem icon={PhoneIcon} label={contact.phoneLabel}>
              <a href={site.phoneHref} className={linkClass}>
                {site.phoneDisplay}
              </a>
              <p className="text-sm text-slate-500">({contact.phoneNote})</p>
            </ContactItem>

            <ContactItem icon={MailIcon} label={contact.emailLabel}>
              <a href={`mailto:${site.email}`} className={linkClass}>
                {site.email}
              </a>
            </ContactItem>

            <ContactItem icon={MapPinIcon} label={contact.areaLabel}>
              <p className="text-lg font-semibold text-navy-900">{contact.areaValue}</p>
            </ContactItem>
          </ul>
        </div>

        <ContactForm
          labels={form}
          services={services.items.map((item) => item.title)}
          whatsappNumber={site.whatsappNumber}
          email={site.email}
        />
      </Container>
    </section>
  );
}
