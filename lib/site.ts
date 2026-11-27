/**
 * Business details used across the whole site.
 * Edit here to change contacts everywhere at once.
 */
export const site = {
  name: "HENPROTRUST",
  phoneDisplay: "+351 912 866 284",
  phoneHref: "tel:+351912866284",
  /** International format without "+" or spaces, as required by wa.me links. */
  whatsappNumber: "351912866284",
  email: "henprotrust@gmail.com",
  base: "Peniche",
  areas: [
    "Peniche",
    "Óbidos",
    "Caldas da Rainha",
    "Lourinhã",
    "Bombarral",
    "Cadaval",
    "Torres Vedras",
    "Nazaré",
    "Alcobaça",
    "Mafra",
  ],
  complaintsBookUrl: "https://www.livroreclamacoes.pt/Inicio/",
  /** Social networks shown in the footer and contact section. */
  social: [
    { id: "instagram", name: "Instagram", url: "https://www.instagram.com/henprotrust", handle: "@henprotrust" },
    { id: "facebook", name: "Facebook", url: "https://www.facebook.com/share/1CMtEiMC96/", handle: "HENPROTRUST" },
  ],
  /** Shown on quotes and in the footer when filled in. */
  legal: {
    companyName: "HENPROTRUST" as string,
    nif: "254087663" as string,
    /** IMPIC licence / certificate number (alvará), if applicable. */
    permit: "" as string,
  },
} as const;

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${site.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Public URL of the site, used for canonical links, the sitemap and
 * social sharing previews. Set SITE_URL (e.g. https://www.henprotrust.pt)
 * in the hosting environment once the domain is live.
 */
export const siteUrl = (
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");
