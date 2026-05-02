"use client";

import Link from "next/link";
import { useState } from "react";
import { RemoteImg } from "./safe-image";

export type PropertyListingCardProps = {
  id: string;
  name: string;
  priceLabel: string;
  location: string;
  image: string | null | undefined;
  description?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

/** Luxury listing card — 16:9 media, dark overlay, hover scale, skeleton until loaded. */
export function PropertyListingCard({
  name,
  priceLabel,
  location,
  image,
  description,
  ctaHref = "/contact",
  ctaLabel
}: PropertyListingCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c1222]/95 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-[#0a0f18]">
        {!imgLoaded ? (
          <div
            className="absolute inset-0 z-10 animate-pulse bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950"
            aria-hidden
          />
        ) : null}
        <RemoteImg
          src={image}
          alt={name}
          className="h-full w-full scale-100 object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          onLoad={() => setImgLoaded(true)}
        />
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-black/[0.22]"
          aria-hidden
        />
      </div>

      <div className="flex flex-1 flex-col px-5 pb-6 pt-5">
        <h2 className="text-xl font-semibold tracking-tight text-white">{name}</h2>
        <p className="mt-2 text-sm font-medium tracking-wide text-amber-200/95">{priceLabel}</p>
        <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
          {location}
        </p>
        {description ? (
          <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-400">{description}</p>
        ) : null}
        {ctaLabel ? (
          <Link
            href={ctaHref}
            className="mt-6 inline-flex justify-center rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-white transition hover:border-white/25 hover:bg-white/10"
          >
            {ctaLabel}
          </Link>
        ) : null}
      </div>
    </article>
  );
}
