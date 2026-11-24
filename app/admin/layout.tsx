import type { Metadata, Viewport } from "next";

import "../globals.css";

import { inter, montserrat } from "@/lib/fonts";

// Separate root layout: the management area is Portuguese-only and never indexed.
export const metadata: Metadata = {
  title: { default: "Gestão | HENPROTRUST", template: "%s | Gestão HENPROTRUST" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#101b2b",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="bg-slate-100">{children}</body>
    </html>
  );
}
