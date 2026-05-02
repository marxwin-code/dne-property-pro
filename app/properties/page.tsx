"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PropertyListingCard } from "../components/property-listing-card";
import { PropertyListingCardSkeleton } from "../components/property-listing-card-skeleton";
import { useSiteText } from "@/lib/i18n/use-site-text";

type Listing = {
  id: string;
  name: string;
  priceLabel: string;
  location: string;
  image: string;
  description: string;
};

export default function PropertiesPage() {
  const t = useSiteText();
  const L = t.properties;
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
    <main className="min-h-screen bg-[#060a14] text-slate-100">
      <section className="border-b border-white/10 px-4 py-16 text-center sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200/90">{L.kicker}</p>
        <h1 className="mt-3 font-semibold tracking-tight text-white sm:text-5xl text-4xl">{L.title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-400">{L.subtitle}</p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-18">
        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertyListingCardSkeleton key={`sk-${i}`} />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <p className="text-center text-slate-500">{L.empty}</p>
        ) : (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((item) => (
              <PropertyListingCard
                key={item.id}
                id={item.id}
                name={item.name}
                priceLabel={item.priceLabel}
                location={item.location}
                image={item.image || undefined}
                description={item.description}
                ctaHref="/contact"
                ctaLabel={t.common.bookConsultation}
              />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-white/10 py-12 text-center">
        <Link
          href="/contact"
          className="text-sm font-medium text-amber-200/90 underline-offset-4 transition hover:text-white hover:underline"
        >
          {L.footerConsultation}
        </Link>
      </section>
    </main>
  );
}
