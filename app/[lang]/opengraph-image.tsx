import { ImageResponse } from "next/og";

import { BRAND_NAVY, BRAND_ORANGE, markSvg } from "@/components/logo";
import { getDictionary } from "@/lib/i18n";
import { hasLocale } from "@/lib/locales";
import { site } from "@/lib/site";

// Preview image shown when the link is shared (WhatsApp, Facebook, LinkedIn…)
export const alt = "HENPROTRUST — Construção, Remodelação e Manutenção de Edifícios";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = getDictionary(hasLocale(lang) ? lang : "pt");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: BRAND_NAVY,
          color: "white",
        }}
      >
        <div style={{ width: 22, height: "100%", background: BRAND_ORANGE }} />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {markSvg({ width: 180, height: 106 })}
            <div style={{ display: "flex", flexDirection: "column", marginLeft: 32 }}>
              <div style={{ fontSize: 46, letterSpacing: 14 }}>HENPROTRUST</div>
              <div
                style={{
                  fontSize: 22,
                  letterSpacing: 4,
                  marginTop: 10,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                }}
              >
                {dict.common.tagline}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", fontSize: 64, lineHeight: 1.12, maxWidth: 980 }}>
            {dict.meta.ogTagline}
          </div>

          <div style={{ display: "flex", alignItems: "center", fontSize: 28 }}>
            <div
              style={{
                display: "flex",
                background: BRAND_ORANGE,
                color: "#0a121e",
                padding: "10px 24px",
                borderRadius: 10,
              }}
            >
              {dict.meta.ogQuote}
            </div>
            <div style={{ display: "flex", marginLeft: 32, color: "#cbd5e1" }}>
              {dict.meta.ogArea}
            </div>
            <div style={{ display: "flex", marginLeft: 32, color: "#cbd5e1" }}>
              {site.phoneDisplay}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
