"use client";

import { useLanguage } from "@/app/components/language-provider";
import { text } from "./text";

/** Same `lang` as `LanguageProvider` (synced from localStorage). Use only `t.*` for UI strings. */
export function useSiteText() {
  const { lang } = useLanguage();
  return text[lang];
}
