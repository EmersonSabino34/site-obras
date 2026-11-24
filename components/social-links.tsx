import type { ComponentType, SVGProps } from "react";

import { site } from "@/lib/site";

import { FacebookIcon, InstagramIcon } from "./icons";

const icons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
};

/** Round icon buttons for the company's social networks. */
export function SocialLinks({ className = "", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <ul className={`flex gap-3 ${className}`}>
      {site.social.map((network) => {
        const Icon = icons[network.id];
        return (
          <li key={network.id}>
            <a
              href={network.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${network.name} — ${network.handle}`}
              title={network.name}
              className={`grid size-11 place-items-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 ${
                tone === "dark"
                  ? "border-white/15 text-slate-300 hover:border-brand-500 hover:bg-brand-500 hover:text-navy-950"
                  : "border-slate-300 text-navy-900 hover:border-brand-500 hover:bg-brand-500 hover:text-navy-950"
              }`}
            >
              {Icon ? <Icon className="size-5" /> : network.name}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
