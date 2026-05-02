"use client";

import { useLanguage } from "./language-provider";
import type { Lang } from "@/lib/i18n/home-hero";

export function LangSwitch() {
  const { lang, setLang } = useLanguage();

  const btn = (code: Lang, label: string) => (
    <button
      type="button"
      onClick={() => setLang(code)}
      className={`rounded-md border px-2.5 py-1 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lux-gold/60 ${
        lang === code
          ? "border-white/50 bg-white/15 text-white"
          : "border-white/30 bg-transparent text-white hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="mr-3 flex gap-2" role="group" aria-label="Language">
      {btn("en", "EN")}
      {btn("zh", "中文")}
    </div>
  );
}
