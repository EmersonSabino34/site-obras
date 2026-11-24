import type { Metadata } from "next";

import "./globals.css";

import Link from "next/link";

import { HouseMark } from "@/components/logo";
import { inter, montserrat } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Página não encontrada | Page not found — HENPROTRUST",
};

export default function GlobalNotFound() {
  return (
    <html lang="pt-PT" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="bg-navy-900">
        <main className="bg-blueprint flex min-h-svh flex-col items-center justify-center px-6 py-16 text-center text-white">
          <HouseMark className="w-40" title="HENPROTRUST" />
          <p className="mt-10 font-display text-7xl font-extrabold text-brand-500">404</p>
          <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
            Página não encontrada
          </h1>
          <p className="mt-2 text-slate-300" lang="en">
            Page not found
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/pt"
              className="rounded-lg bg-brand-500 px-6 py-3 font-semibold text-navy-950 transition-colors hover:bg-brand-400"
            >
              Voltar ao início
            </Link>
            <Link
              href="/en"
              lang="en"
              className="rounded-lg border border-white/25 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/5"
            >
              Back to home (English)
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
