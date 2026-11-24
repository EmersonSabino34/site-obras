import { en } from "./dictionaries/en";
import { pt } from "./dictionaries/pt";
import type { Locale } from "./locales";

export type { Dictionary } from "./dictionaries/pt";

const dictionaries = { pt, en };

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
