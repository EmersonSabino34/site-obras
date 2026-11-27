import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "./lib/auth/constants";
import { defaultLocale, hasLocale, LOCALE_COOKIE, locales } from "./lib/locales";

/** Picks the visitor's language: saved choice first, then browser settings. */
function preferredLocale(request: NextRequest) {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (hasLocale(saved)) return saved;

  const header = request.headers.get("accept-language") ?? "";
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return {
        lang: tag.trim().toLowerCase().split("-")[0],
        q: q ? Number(q.trim().slice(2)) : 1,
      };
    })
    .filter((entry) => entry.lang && !Number.isNaN(entry.q) && entry.q > 0)
    .sort((a, b) => b.q - a.q);

  const match = ranked.find((entry) => hasLocale(entry.lang));
  return match && hasLocale(match.lang) ? match.lang : defaultLocale;
}

// Pages that don't need a session inside the private areas.
const PUBLIC_ACCOUNT_PAGES = new Set(["/conta/entrar", "/conta/registo"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  // One official address: www.henprotrust.pt → henprotrust.pt (permanent redirect).
  const host = request.headers.get("host") ?? "";
  if (host.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = host.slice("www.".length);
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  // Admin panel (Portuguese only, no language prefix).
  // This is only a fast, optimistic check: every page and action verifies the session again.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!hasSession && pathname !== "/admin/entrar") {
      return NextResponse.redirect(new URL("/admin/entrar", request.url));
    }
    return NextResponse.next();
  }

  const current = locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (current) {
    // Client area: send visitors without a session straight to the login page.
    const rest = pathname.slice(current.length + 1);
    if ((rest === "/conta" || rest.startsWith("/conta/")) && !PUBLIC_ACCOUNT_PAGES.has(rest) && !hasSession) {
      return NextResponse.redirect(new URL(`/${current}/conta/entrar`, request.url));
    }

    // Remember the language for next visits.
    const response = NextResponse.next();
    if (request.cookies.get(LOCALE_COOKIE)?.value !== current) {
      response.cookies.set(LOCALE_COOKIE, current, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }
    return response;
  }

  // No language in the URL (e.g. "/"): redirect to the best match.
  const url = request.nextUrl.clone();
  url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next.js internals, files with an extension and generated icons.
  matcher: ["/((?!_next|api|.*\\..*|icon|apple-icon).*)"],
};
