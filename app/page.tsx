"use client";

import Link from "next/link";
import { HomeHero } from "./components/home-hero";
import { useSiteText } from "@/lib/i18n/use-site-text";

const KUULA_EMBED_SRC =
  "https://kuula.co/share/collection/7lRH7?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1";

export default function HomePage() {
  const t = useSiteText();

  return (
    <main className="w-full">
      <HomeHero />

      <section className="border-t border-stone-300/40 bg-gradient-to-b from-[#f3efe8] to-lux-paper px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-lux-ink sm:text-4xl">
              {t.home.investmentTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-slate-600">{t.home.investmentLead}</p>
          </div>

          <article className="mt-10 rounded-2xl border border-lux-gold/40 bg-white p-8 text-left shadow-[0_20px_40px_-26px_rgba(12,18,34,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_48px_-24px_rgba(12,18,34,0.42)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lux-gold-dim">
              {t.common.featured}
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-lux-ink sm:text-3xl">
              {t.home.featuredTitle}
            </h3>
            <p className="mt-2 text-lg font-medium text-slate-800">{t.home.featuredPrice}</p>
            <p className="mt-2 text-sm text-slate-600">{t.home.featuredSub}</p>
            <Link
              href="/house-package"
              className="mt-6 inline-flex rounded-full bg-lux-ink px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              {t.home.featuredCta}
            </Link>
          </article>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <article className="rounded-2xl border border-stone-400/30 bg-white/85 p-7 text-left shadow-[0_20px_40px_-28px_rgba(12,18,34,0.35)] transition hover:-translate-y-1 hover:shadow-[0_28px_48px_-24px_rgba(12,18,34,0.45)]">
              <h3 className="text-xl font-semibold tracking-tight text-lux-ink">{t.home.card360Title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{t.home.card360Body}</p>
              <Link
                href="/#interactive-360-home"
                className="mt-6 inline-flex rounded-full border border-lux-ink/20 bg-white px-5 py-2.5 text-sm font-semibold text-lux-ink transition hover:border-brand-600 hover:text-brand-700"
              >
                {t.home.card360Cta}
              </Link>
            </article>

            <article className="rounded-2xl border border-lux-gold/40 bg-gradient-to-br from-white to-[#f6f1e4] p-7 text-left shadow-[0_20px_40px_-26px_rgba(12,18,34,0.35)] transition hover:-translate-y-1 hover:shadow-[0_28px_48px_-24px_rgba(12,18,34,0.45)]">
              <p className="inline-flex rounded-full bg-lux-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-lux-gold-dim">
                {t.common.newBadge}
              </p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-lux-ink">{t.home.packageTitle}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{t.home.packageBody}</p>
              <Link
                href="/house-package"
                className="mt-6 inline-flex rounded-full bg-lux-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                {t.home.packageCta}
              </Link>
            </article>
          </div>

          <div className="mt-8 rounded-2xl border border-stone-300/50 bg-white/80 p-6 text-center shadow-[0_16px_32px_-26px_rgba(12,18,34,0.35)]">
            <p className="text-sm text-slate-700">{t.home.affordLine}</p>
            <Link
              href="/compare"
              className="mt-3 inline-flex rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              {t.home.affordCta}
            </Link>
          </div>
        </div>
      </section>

      <section
        id="interactive-360-home"
        className="scroll-mt-24 border-y border-white/10 bg-gradient-to-br from-[#0a0f1c] via-lux-ink to-[#151d33] px-4 py-16 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.55)] sm:py-24"
      >
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-left text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-lux-gold">{t.home.flagshipKicker}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.25rem] lg:leading-tight">
              {t.home.flagshipTitle}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">{t.home.flagshipBody}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/#interactive-360-preview"
                className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-lux-ink"
              >
                {t.home.liveDemo}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-lux-ink"
              >
                {t.home.requestPricing}
              </Link>
            </div>
          </div>

          <div
            id="interactive-360-preview"
            className="scroll-mt-24 rounded-2xl border border-white/10 bg-black/40 p-3 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.65)] ring-1 ring-white/5"
          >
            <iframe
              title={t.home.iframe360Preview}
              src={KUULA_EMBED_SRC}
              className="h-[320px] w-full rounded-xl border-0 bg-black sm:h-[420px] lg:h-[480px]"
              allowFullScreen
              loading="lazy"
              scrolling="no"
              allow="xr-spatial-tracking; gyroscope; accelerometer; fullscreen"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-stone-300/40 bg-gradient-to-b from-lux-paper to-lux-paper-deep px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-lux-ink sm:text-4xl">
            {t.home.aiSectionTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">{t.home.aiSectionLead}</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7">
          {t.home.aiTools.map((tool) => (
            <article
              key={tool.title}
              className="group flex h-full min-h-[240px] flex-col rounded-2xl border border-stone-400/30 bg-white/80 p-8 text-left shadow-[0_20px_40px_-28px_rgba(12,18,34,0.35)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-stone-400/50 hover:shadow-[0_28px_48px_-24px_rgba(12,18,34,0.45)]"
            >
              <h3 className="text-lg font-semibold tracking-tight text-lux-ink">{tool.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{tool.description}</p>
              <Link
                href={tool.href}
                className="mt-6 inline-flex w-fit rounded-full bg-lux-ink px-5 py-2.5 text-sm font-semibold text-white transition group-hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                {t.common.explore}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-stone-300/40 bg-gradient-to-br from-lux-ink via-[#141c30] to-lux-surface px-4 py-16 text-center sm:py-20">
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{t.home.closingTitle}</h2>
          <p className="text-lg leading-relaxed text-slate-300">{t.home.closingBody}</p>
          <Link
            href="/contact"
            className="inline-flex rounded-full bg-brand-600 px-10 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/25 transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-lux-ink"
          >
            {t.home.closingCta}
          </Link>
        </div>
      </section>
    </main>
  );
}
