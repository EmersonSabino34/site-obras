import { site } from "@/lib/site";

import { SocialLogo } from "./brand-logos";

/** Social network buttons in their official colours. */
export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex gap-3 ${className}`}>
      {site.social.map((network) => (
        <li key={network.id}>
          <a
            href={network.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${network.name} — ${network.handle}`}
            title={network.name}
            className="block rounded-full transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
          >
            <SocialLogo id={network.id} className="size-11" />
          </a>
        </li>
      ))}
    </ul>
  );
}
