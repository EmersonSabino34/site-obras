import { Suspense } from "react";

import type { Locale } from "@/lib/locales";

import { LanguageSwitchClient } from "./language-switch-client";
import { LanguageSwitchView } from "./language-switch-view";

export function LanguageSwitch(props: { current: Locale; label: string; className?: string }) {
  // On pages whose URL isn't known at build time the pathname resolves at request
  // time, so the fallback (links to each language's home page) is prerendered.
  return (
    <Suspense fallback={<LanguageSwitchView {...props} hrefFor={(locale) => `/${locale}`} />}>
      <LanguageSwitchClient {...props} />
    </Suspense>
  );
}
