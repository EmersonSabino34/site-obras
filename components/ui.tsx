import type { ReactNode } from "react";

export function Container({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p
        className={`inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] sm:text-sm ${
          dark ? "text-brand-400" : "text-brand-700 dark:text-brand-400"
        }`}
      >
        <span aria-hidden="true" className="h-0.5 w-8 bg-brand-500" />
        {eyebrow}
      </p>
      <h2
        className={`mt-4 text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.6rem] lg:leading-[1.15] ${
          dark ? "text-white" : "text-navy-900 dark:text-white"
        }`}
      >
        {title}
      </h2>
      {intro ? (
        <p
          className={`mt-5 text-pretty text-lg leading-relaxed ${
            dark ? "text-slate-300" : "text-slate-600 dark:text-slate-300"
          }`}
        >
          {intro}
        </p>
      ) : null}
    </div>
  );
}

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400";

export const buttonStyles = {
  primary: `inline-flex items-center justify-center gap-2.5 rounded-lg bg-brand-500 px-6 py-3.5 font-semibold text-navy-950 shadow-lg shadow-brand-500/25 transition-colors hover:bg-brand-400 ${focusRing}`,
  outlineDark: `inline-flex items-center justify-center gap-2.5 rounded-lg border border-white/25 px-6 py-3.5 font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/5 ${focusRing}`,
  navy: `inline-flex items-center justify-center gap-2.5 rounded-lg bg-navy-900 px-6 py-3.5 font-semibold text-white shadow-lg shadow-navy-900/20 transition-colors hover:bg-navy-800 ${focusRing}`,
  outlineNavy: `inline-flex items-center justify-center gap-2.5 rounded-lg border-2 border-navy-900 px-6 py-3 font-semibold text-navy-900 transition-colors hover:bg-navy-900 hover:text-white ${focusRing}`,
};
