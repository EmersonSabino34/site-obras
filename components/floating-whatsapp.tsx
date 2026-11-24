import { WhatsAppIcon } from "./icons";

export function FloatingWhatsApp({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="group fixed right-4 bottom-4 z-40 flex items-center gap-3 sm:right-6 sm:bottom-6"
    >
      <span className="pointer-events-none hidden rounded-full bg-navy-900 px-4 py-2 text-sm font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 md:block">
        {label}
      </span>
      <span className="relative grid size-14 place-items-center rounded-full bg-whatsapp text-white shadow-xl shadow-black/25 transition-transform group-hover:scale-105 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-navy-900">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-whatsapp motion-safe:animate-wa-ping"
        />
        <WhatsAppIcon className="relative size-7" />
      </span>
    </a>
  );
}
