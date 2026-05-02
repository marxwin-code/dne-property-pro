"use client";

import Link from "next/link";
import { useLanguage } from "./language-provider";
import { homeHeroCopy } from "@/lib/i18n/home-hero";

export function HomeHero() {
  const { lang } = useLanguage();
  const t = homeHeroCopy[lang];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-lux-ink via-[#141c30] to-lux-surface px-4 py-20 text-center sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #c9a962 0%, transparent 45%), radial-gradient(circle at 80% 60%, #3b82f6 0%, transparent 40%)"
        }}
      />
      <div className="relative mx-auto max-w-3xl space-y-6">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-lux-gold">
          D&amp;E Property Pro
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl sm:leading-tight">
          {t.hero_title}
        </h1>
        <p className="text-lg leading-relaxed text-slate-300 sm:text-xl">{t.hero_subtitle}</p>
        <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row sm:gap-4">
          <Link
            href="/#interactive-360-home"
            className="inline-flex w-full items-center justify-center rounded-full bg-brand-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-lux-ink sm:w-auto"
          >
            {t.btn_demo}
          </Link>
          <Link
            href="/house-package"
            className="inline-flex w-full items-center justify-center rounded-full border border-lux-gold/55 bg-lux-gold/10 px-8 py-3.5 text-sm font-semibold text-lux-gold transition hover:border-lux-gold/80 hover:bg-lux-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lux-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-lux-ink sm:w-auto"
          >
            {t.btn_package}
          </Link>
          <Link
            href="/contact"
            className="inline-flex w-full items-center justify-center rounded-full border border-white/25 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-lux-ink sm:w-auto"
          >
            {t.btn_quote}
          </Link>
        </div>
      </div>
    </section>
  );
}
