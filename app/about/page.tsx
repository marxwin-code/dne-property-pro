"use client";

import Link from "next/link";
import { useSiteText } from "@/lib/i18n/use-site-text";

export default function AboutPage() {
  const t = useSiteText();

  return (
    <main className="w-full bg-gradient-to-b from-lux-paper via-[#ebe6de] to-lux-paper-deep">
      <section className="border-b border-stone-300/40 bg-gradient-to-br from-lux-ink via-[#141c30] to-lux-surface px-4 py-20 text-center text-white sm:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-lux-gold">{t.about.kicker}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{t.about.title}</h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-8 px-4 py-20 sm:py-24">
        {t.about.paragraphs.map((para, i) => (
          <article
            key={i}
            className="rounded-2xl border border-stone-400/25 bg-white/75 p-8 shadow-[0_20px_40px_-28px_rgba(12,18,34,0.3)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_48px_-24px_rgba(12,18,34,0.35)]"
          >
            <p className="text-base leading-relaxed text-slate-700">{para}</p>
          </article>
        ))}
      </section>

      <section className="border-t border-stone-300/40 bg-gradient-to-br from-white/60 to-stone-200/50 px-4 py-20 text-center sm:py-24">
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="text-2xl font-semibold text-lux-ink">{t.about.ctaTitle}</h2>
          <p className="text-slate-600">{t.about.ctaLead}</p>
          <Link
            href="/contact"
            className="inline-flex rounded-full bg-brand-600 px-10 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
          >
            {t.about.ctaButton}
          </Link>
        </div>
      </section>
    </main>
  );
}
