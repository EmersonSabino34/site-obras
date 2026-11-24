import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";
import { site, whatsappLink } from "@/lib/site";

import { navLinks } from "./header";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "./icons";
import { LanguageSwitch } from "./language-switch";
import { FullLogo } from "./logo";
import { SocialLinks } from "./social-links";
import { Container } from "./ui";

async function CurrentYear() {
  "use cache";
  return <>{new Date().getFullYear()}</>;
}

const headingClass = "text-sm font-bold uppercase tracking-[0.18em] text-white";
const linkClass = "text-slate-400 transition-colors hover:text-brand-400";

export function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const { footer, contact, services, anchors } = dict;

  return (
    <footer className="bg-navy-950 text-slate-400">
      <div aria-hidden="true" className="h-1 bg-brand-500" />
      <Container className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_1fr_1.1fr] lg:gap-10">
        <div>
          <FullLogo className="w-44" title="HENPROTRUST" />
          <p className="mt-6 max-w-xs leading-relaxed">{footer.tagline}</p>
          <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-white">{footer.followUs}</p>
          <SocialLinks className="mt-3" />
        </div>

        <nav aria-label={footer.navigation}>
          <h2 className={headingClass}>{footer.navigation}</h2>
          <ul className="mt-5 space-y-3">
            {navLinks(dict, lang).map((link) => (
              <li key={link.href}>
                <a href={link.href} className={linkClass}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className={headingClass}>{footer.services}</h2>
          <ul className="mt-5 space-y-3">
            {services.items.map((service) => (
              <li key={service.id}>
                <a href={`/${lang}#${anchors.services}`} className={linkClass}>
                  {service.title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className={headingClass}>{footer.contacts}</h2>
          <ul className="mt-5 space-y-4">
            <li>
              <a
                href={whatsappLink(dict.common.whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 ${linkClass}`}
              >
                <WhatsAppIcon className="size-5 shrink-0 text-whatsapp" />
                WhatsApp
              </a>
            </li>
            <li>
              <a href={site.phoneHref} className={`flex items-start gap-3 ${linkClass}`}>
                <PhoneIcon className="mt-0.5 size-5 shrink-0 text-brand-500" />
                <span>
                  {site.phoneDisplay}
                  <span className="block text-xs text-slate-500">({contact.phoneNote})</span>
                </span>
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className={`flex items-center gap-3 break-all ${linkClass}`}>
                <MailIcon className="size-5 shrink-0 text-brand-500" />
                {site.email}
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-5 py-6 text-sm sm:flex-row">
          <p className="text-center sm:text-left">
            © <CurrentYear /> {site.legal.companyName}. {footer.rights}
            {site.legal.nif ? <span className="block text-xs">NIF {site.legal.nif}</span> : null}
            {site.legal.permit ? <span className="block text-xs">{site.legal.permit}</span> : null}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <a href={`/${lang}/conta`} className={linkClass}>
              {dict.account.area}
            </a>
            <a href={`/${lang}/privacidade`} className={linkClass}>
              {dict.privacyLink}
            </a>
            <a
              href={site.complaintsBookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {footer.complaints}
              <span className="sr-only"> ({dict.common.openInNewTab})</span>
            </a>
            <LanguageSwitch current={lang} label={dict.nav.language} />
          </div>
        </Container>
      </div>
    </footer>
  );
}
