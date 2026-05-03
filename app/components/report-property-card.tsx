"use client";

import Link from "next/link";
import { useState } from "react";
import { RemoteImg } from "./safe-image";

export type ReportPropertyCardProps = {
  name: string;
  priceLabel: string;
  location: string;
  image_url: string;
  viewMatchingLabel: string;
  bookLabel: string;
  reason?: {
    why: string;
    suitability: string;
    risk: string;
  };
};

/** Compare report — fixed layout: cover image, title, location, price, two CTAs. */
export function ReportPropertyCard({
  name,
  priceLabel,
  location,
  image_url,
  viewMatchingLabel,
  bookLabel,
  reason
}: ReportPropertyCardProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c1222]/95 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      <div className="relative aspect-video w-full overflow-hidden bg-[#0a0f18]">
        {!loaded ? (
          <div
            className="absolute inset-0 z-10 animate-pulse bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950"
            aria-hidden
          />
        ) : null}
        <RemoteImg
          src={image_url}
          fallbackSrc={image_url}
          alt=""
          className="h-full w-full object-cover"
          onLoad={() => setLoaded(true)}
        />
      </div>
      <div className="flex flex-1 flex-col px-5 pb-6 pt-5">
        <h3 className="text-xl font-semibold tracking-tight text-white">{name}</h3>
        <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">{location}</p>
        <p className="mt-2 text-lg font-semibold text-amber-200/95">{priceLabel}</p>
        {reason ? (
          <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-left text-sm leading-relaxed text-slate-400">
            <p className="text-slate-300">{reason.why}</p>
            <p>{reason.suitability}</p>
            <p className="text-amber-200/80">{reason.risk}</p>
          </div>
        ) : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/properties"
            className="inline-flex flex-1 justify-center rounded-full bg-brand-600 px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-brand-700"
          >
            {viewMatchingLabel}
          </Link>
          <Link
            href="/contact"
            className="inline-flex flex-1 justify-center rounded-full border-2 border-sky-400 px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-sky-300 transition hover:bg-sky-500/10"
          >
            {bookLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
