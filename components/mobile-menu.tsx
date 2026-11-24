"use client";

import { useEffect, useId, useState } from "react";

import { CloseIcon, MenuIcon, UserIcon, WhatsAppIcon } from "./icons";

type Props = {
  links: { href: string; label: string }[];
  openLabel: string;
  closeLabel: string;
  ctaLabel: string;
  ctaHref: string;
  account: { href: string; label: string };
};

export function MobileMenu({ links, openLabel, closeLabel, ctaLabel, ctaHref, account }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onResize = () => {
      if (window.matchMedia("(min-width: 80rem)").matches) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? closeLabel : openLabel}
        className="grid size-11 place-items-center rounded-lg text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-brand-400"
      >
        {open ? <CloseIcon className="size-6" /> : <MenuIcon className="size-6" />}
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full border-t border-white/10 bg-navy-900 shadow-2xl shadow-black/40"
      >
        <nav className="mx-auto max-w-7xl px-5 py-4 sm:px-8">
          <ul className="divide-y divide-white/5">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-3.5 text-base font-medium text-slate-200 transition-colors hover:text-brand-400"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={account.href}
            onClick={() => setOpen(false)}
            className="mt-4 flex items-center justify-center gap-2.5 rounded-lg border border-white/20 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-white/5"
          >
            <UserIcon className="size-5" />
            {account.label}
          </a>
          <a
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="mt-3 mb-2 flex items-center justify-center gap-2.5 rounded-lg bg-brand-500 px-6 py-3.5 font-semibold text-navy-950 transition-colors hover:bg-brand-400"
          >
            <WhatsAppIcon className="size-5" />
            {ctaLabel}
          </a>
        </nav>
      </div>
    </div>
  );
}
