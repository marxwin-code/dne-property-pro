"use client";

import Link from "next/link";
import { useSiteText } from "@/lib/i18n/use-site-text";

export default function ServicesPage() {
  const t = useSiteText();

  return (
    <main className="w-full bg-gradient-to-b from-lux-paper via-[#ebe6de] to-lux-paper-deep">
      <section className="border-b border-stone-300/40 bg-gradient-to-br from-lux-ink via-[#141c30] to-lux-surface px-4 py-20 text-center text-white sm:py-24">
        <div className="mx-auto max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-lux-gold">{t.services.kicker}</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{t.services.title}</h1>
          <p className="text-lg leading-relaxed text-slate-300">{t.services.lead}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-10 px-4 py-20 sm:py-24">
        <div className="grid gap-8 lg:grid-cols-3">
          {t.services.cards.map((s) => (
            <article
              key={s.title}
              className={`flex min-h-[320px] flex-col rounded-2xl border bg-white/80 p-8 shadow-[0_20px_40px_-28px_rgba(12,18,34,0.3)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_48px_-24px_rgba(12,18,34,0.4)] ${
                s.highlight
                  ? "border-lux-gold/50 ring-2 ring-lux-gold/25 lg:scale-[1.02]"
                  : "border-stone-400/30"
              }`}
            >
              {s.highlight ? (
                <span className="mb-3 inline-flex w-fit rounded-full bg-lux-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-lux-gold-dim">
                  {t.services.flagshipLabel}
                </span>
              ) : null}
              <h2 className="text-xl font-semibold text-lux-ink">{s.title}</h2>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">{s.description}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-lux-ink/20 bg-white px-5 py-2.5 text-center text-sm font-semibold text-lux-ink transition hover:border-brand-600 hover:text-brand-700"
                >
                  {t.services.learnMore}
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-brand-600 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  {t.services.getQuote}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-stone-300/40 bg-white/50 px-4 py-20 text-center sm:py-24">
        <div className="mx-auto max-w-2xl space-y-4">
          <h2 className="text-2xl font-semibold text-lux-ink">{t.services.bottomTitle}</h2>
          <p className="text-slate-600">{t.services.bottomLead}</p>
          <Link
            href="/contact"
            className="inline-flex rounded-full bg-lux-ink px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            {t.services.bottomCta}
          </Link>
        </div>
      </section>
    </main>
  );
}
