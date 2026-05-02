"use client";

import { useLanguage } from "./language-provider";
import type { Lang } from "@/lib/i18n/text";

function switchLang(l: Lang) {
  localStorage.setItem("lang", l);
  window.location.reload();
}

export function LangSwitch() {
  const { lang } = useLanguage();

  const btn = (code: Lang, label: string) => (
    <button
      type="button"
      onClick={() => switchLang(code)}
      className={`rounded-md border px-2.5 py-1 text-[13px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lux-gold/60 ${
        lang === code
          ? "border-white/60 bg-white/10 font-semibold text-white"
          : "border-white/25 bg-transparent font-normal text-white/90 hover:border-white/45 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex shrink-0 gap-2 sm:mr-1" role="group" aria-label="Language">
      {btn("en", "EN")}
      {btn("zh", "中文")}
    </div>
  );
}
