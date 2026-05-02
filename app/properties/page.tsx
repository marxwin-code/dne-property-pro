"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "../components/language-provider";
import { RemoteImg } from "../components/safe-image";
import { siteCopy } from "@/lib/i18n/site";
import type { Lang } from "@/lib/i18n/home-hero";

type Listing = {
  id: string;
  name: string;
  priceLabel: string;
  location: string;
  image: string;
  description: string;
};

export default function PropertiesPage() {
  const { lang } = useLanguage();
  const L = siteCopy[lang as Lang];
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/properties");
        const data = (await res.json()) as {
          success?: boolean;
          listings?: Listing[];
        };
        if (!cancelled && data.success && data.listings) setListings(data.listings);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#020617] text-slate-100">
      <section className="border-b border-white/10 px-4 py-16 text-center sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">
          {L.properties.kicker}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {L.properties.title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-400">{L.properties.subtitle}</p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-18">
        {loading ? (
          <p className="text-center text-slate-500">Loading…</p>
        ) : listings.length === 0 ? (
          <p className="text-center text-slate-500">{L.properties.empty}</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((item) => (
              <article
                key={item.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-sky-900/40 bg-[#0f172a]/90 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.6)]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                  <RemoteImg
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="text-lg font-semibold text-white">{item.name}</h2>
                  <p className="mt-1 text-sm font-medium text-sky-300">{item.priceLabel}</p>
                  <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">{item.location}</p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">{item.description}</p>
                  <Link
                    href="/contact"
                    className="mt-6 inline-flex justify-center rounded-full bg-brand-600 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-700"
                  >
                    {lang === "zh" ? "预约咨询" : "Book Consultation"}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
