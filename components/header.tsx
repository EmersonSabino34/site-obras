import Link from "next/link";

import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";
import { whatsappLink } from "@/lib/site";

import { UserIcon, WhatsAppIcon } from "./icons";
import { LanguageSwitch } from "./language-switch";
import { HouseMark } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { Container } from "./ui";

/** Section links of the home page (absolute, so they also work from other pages). */
export function navLinks(dict: Dictionary, lang: Locale) {
  const { anchors, nav } = dict;
  return [
    { href: `/${lang}#${anchors.services}`, label: nav.services },
    { href: `/${lang}#${anchors.clients}`, label: nav.clients },
    { href: `/${lang}#${anchors.about}`, label: nav.about },
    { href: `/${lang}#${anchors.process}`, label: nav.process },
    { href: `/${lang}#${anchors.area}`, label: nav.area },
    { href: `/${lang}#${anchors.contact}`, label: nav.contact },
  ];
}

export function Header({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const links = navLinks(dict, lang);
  const accountHref = `/${lang}/conta`;
  const ctaHref = whatsappLink(dict.common.whatsappMessage);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-900/95 backdrop-blur-md">
      <Container className="relative flex h-18 items-center justify-between gap-4">
        <a
          href={`/${lang}`}
          aria-label={`HENPROTRUST — ${dict.nav.home}`}
          className="flex shrink-0 items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400"
        >
          <HouseMark className="h-7 w-auto sm:h-9" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[0.8rem] font-semibold tracking-[0.22em] text-white sm:text-[0.95rem] sm:tracking-[0.28em]">
              HENPROTRUST
            </span>
            <span className="mt-1.5 hidden text-[0.65rem] font-medium uppercase tracking-[0.18em] text-slate-400 sm:block xl:hidden">
              {dict.common.tagline}
            </span>
          </span>
        </a>

        <nav aria-label={dict.nav.main} className="hidden xl:block">
          <ul className="flex items-center gap-6">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="whitespace-nowrap text-sm font-medium text-slate-300 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSwitch current={lang} label={dict.nav.language} />
          <Link
            href={accountHref}
            aria-label={dict.account.area}
            title={dict.account.area}
            className="hidden size-10 place-items-center rounded-lg border border-white/15 text-slate-200 transition-colors hover:border-white/40 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 sm:grid"
          >
            <UserIcon className="size-5" />
          </Link>
          <a
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 whitespace-nowrap rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-brand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 md:inline-flex"
          >
            <WhatsAppIcon className="size-4" />
            {dict.nav.cta}
          </a>
          <MobileMenu
            links={links}
            openLabel={dict.nav.openMenu}
            closeLabel={dict.nav.closeMenu}
            ctaLabel={dict.nav.cta}
            ctaHref={ctaHref}
            account={{ href: accountHref, label: dict.account.area }}
          />
        </div>
      </Container>
    </header>
  );
}
