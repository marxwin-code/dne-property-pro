"use client";

import Link from "next/link";
import { useSiteText } from "@/lib/i18n/use-site-text";

export default function ProjectsPage() {
  const t = useSiteText();

  return (
    <main className="w-full bg-gradient-to-b from-lux-paper via-[#ebe6de] to-lux-paper-deep">
      <section className="border-b border-stone-300/40 bg-gradient-to-br from-lux-ink via-[#141c30] to-lux-surface px-4 py-20 text-center text-white sm:py-24">
        <div className="mx-auto max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-lux-gold">{t.projects.kicker}</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{t.projects.title}</h1>
          <p className="text-lg leading-relaxed text-slate-300">{t.projects.lead}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
        <div className="grid gap-8 md:grid-cols-3">
          {t.projects.items.map((p) => (
            <article
              key={p.title}
              className="flex min-h-[300px] flex-col rounded-2xl border border-stone-400/30 bg-white/80 p-8 shadow-[0_20px_40px_-28px_rgba(12,18,34,0.3)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_48px_-24px_rgba(12,18,34,0.4)]"
            >
              <h2 className="text-xl font-semibold text-lux-ink">{p.title}</h2>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">{p.description}</p>
              <Link
                href={p.href}
                className="mt-8 inline-flex w-fit rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                {p.action}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-stone-300/40 bg-gradient-to-br from-white/60 to-stone-200/50 px-4 py-20 text-center sm:py-24">
        <div className="mx-auto max-w-2xl space-y-4">
          <h2 className="text-2xl font-semibold text-lux-ink">{t.projects.ctaTitle}</h2>
          <p className="text-slate-600">{t.projects.ctaLead}</p>
          <Link
            href="/contact"
            className="inline-flex rounded-full bg-brand-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            {t.projects.ctaButton}
          </Link>
        </div>
      </section>
    </main>
  );
}
