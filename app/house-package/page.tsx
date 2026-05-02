"use client";

import Image from "next/image";
import Link from "next/link";
import { Manrope } from "next/font/google";
import { HousePackageLeadForm } from "./house-package-lead-form";
import { useLanguage } from "../components/language-provider";
import { siteCopy } from "@/lib/i18n/site";
import type { Lang } from "@/lib/i18n/home-hero";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"]
});

const KUULA_SRC =
  "https://kuula.co/share/collection/7lRH7?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1";

const gallery = [
  {
    src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85",
    alt: "Modern home exterior with lawn at dusk"
  },
  {
    src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85",
    alt: "Open-plan living space with natural light"
  },
  {
    src: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1400&q=85",
    alt: "Contemporary kitchen with stone surfaces"
  },
  {
    src: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1400&q=85",
    alt: "Primary bedroom with soft daylight"
  },
  {
    src: "https://images.unsplash.com/photo-1600566752355-3578567915c4?auto=format&fit=crop&w=1400&q=85",
    alt: "Designer bathroom with refined finishes"
  }
] as const;

const keyStats = [
  { label: "Price", value: "From $620,000", note: "Package price guide" },
  { label: "Location", value: "Melbourne", note: "High-growth corridor" },
  { label: "Bedrooms", value: "4", note: "Generous accommodation" },
  { label: "Bathrooms", value: "2", note: "Including ensuite" },
  { label: "Garage", value: "2", note: "Secure parking" },
  { label: "Land Size", value: "300–400 m²", note: "Subject to lot" }
] as const;

const lifestyle = [
  {
    title: "Modern Architecture",
    text: "Clean lines, refined street presence, and layouts shaped for how families actually live day to day."
  },
  {
    title: "Functional Layout",
    text: "Zones that separate entertaining from rest, with storage and flow considered from the first sketch."
  },
  {
    title: "Quality Materials",
    text: "Finishes selected for durability and timeless appeal — the details buyers notice on a second walkthrough."
  }
] as const;

const whyPoints = [
  "Strong capital growth potential in a corridor supported by infrastructure and employment nodes.",
  "High rental demand from professionals and small families seeking new-build certainty.",
  "Proximity to schools, retail, and transport links that underpin long-term liquidity.",
  "Suits both owner-occupiers building equity and investors targeting yield with land component upside."
] as const;

function OutlineButton({
  href,
  children,
  variant = "dark"
}: {
  href: string;
  children: React.ReactNode;
  variant?: "dark" | "gold" | "hero";
}) {
  const base =
    "inline-flex items-center justify-center px-10 py-3.5 text-[11px] font-medium uppercase tracking-[0.22em] transition";
  const styles =
    variant === "hero"
      ? "border border-white/70 text-white hover:border-white hover:bg-white hover:text-[#0f172a]"
      : variant === "gold"
        ? "border border-[#d4af37] text-[#0f172a] hover:bg-[#d4af37] hover:text-[#0f172a]"
        : "border border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white";
  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}

export default function HousePackagePage() {
  const { lang } = useLanguage();
  const H = siteCopy[lang as Lang];

  return (
    <main className={`${manrope.className} bg-white text-[#0f172a] antialiased`}>
      {/* 1. Hero */}
      <section className="relative min-h-[100svh] w-full">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=85"
          alt="Modern Australian home at sunset with landscaped frontage"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/20" />
        <div className="relative z-10 flex min-h-[100svh] flex-col justify-end px-6 pb-24 pt-32 sm:px-12 lg:px-20 lg:pb-32">
          <div className="max-w-3xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-[#e5e7eb]">
              D&amp;E Property Pro
            </p>
            <h1 className="mt-6 text-4xl font-light leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {H.house.heroTitle}
            </h1>
            <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-white/90 sm:text-xl">
              {H.house.heroLead}
            </p>
            <p className="mt-4 text-sm font-light text-[#d4af37]">{H.house.heroTag}</p>
            <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
              <OutlineButton href="#key-information" variant="hero">
                {H.house.ctaDetails}
              </OutlineButton>
              <OutlineButton href="#experience-360" variant="hero">
                {H.house.cta360}
              </OutlineButton>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Image Gallery */}
      <section className="border-b border-slate-200/80 bg-[#f8f9fa] px-6 py-20 sm:px-12 lg:px-20 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-slate-500">{H.house.galleryKicker}</p>
          <h2 className="mt-4 text-3xl font-light tracking-tight sm:text-4xl">{H.house.galleryTitle}</h2>
          <p className="mt-4 max-w-2xl font-light leading-relaxed text-slate-600">{H.house.galleryBody}</p>

          <div className="mt-16 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-12 md:grid-rows-2 md:gap-5 md:overflow-visible md:pb-0">
            <div className="relative h-[72vw] min-h-[300px] w-[88vw] shrink-0 snap-center overflow-hidden rounded-2xl shadow-[0_24px_60px_-20px_rgba(15,23,42,0.25)] md:col-span-7 md:row-span-2 md:h-[560px] md:w-auto">
              <Image src={gallery[0].src} alt={gallery[0].alt} fill className="object-cover" sizes="(max-width:768px) 88vw, 58vw" />
            </div>
            <div className="relative h-[60vw] min-h-[220px] w-[75vw] shrink-0 snap-center overflow-hidden rounded-2xl shadow-[0_20px_50px_-18px_rgba(15,23,42,0.2)] md:col-span-5 md:h-[268px] md:w-auto">
              <Image src={gallery[1].src} alt={gallery[1].alt} fill className="object-cover" sizes="(max-width:768px) 75vw, 42vw" />
            </div>
            <div className="relative h-[60vw] min-h-[220px] w-[75vw] shrink-0 snap-center overflow-hidden rounded-2xl shadow-[0_20px_50px_-18px_rgba(15,23,42,0.2)] md:col-span-5 md:h-[268px] md:w-auto">
              <Image src={gallery[2].src} alt={gallery[2].alt} fill className="object-cover" sizes="(max-width:768px) 75vw, 42vw" />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-5">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl shadow-[0_20px_50px_-18px_rgba(15,23,42,0.2)]">
              <Image src={gallery[3].src} alt={gallery[3].alt} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
            </div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl shadow-[0_20px_50px_-18px_rgba(15,23,42,0.2)]">
              <Image src={gallery[4].src} alt={gallery[4].alt} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Key Information */}
      <section id="key-information" className="scroll-mt-24 px-6 py-20 sm:px-12 lg:px-20 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-slate-500">Key information</p>
          <h2 className="mt-4 text-3xl font-light tracking-tight sm:text-4xl">The numbers that frame the decision</h2>
          <div className="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-6">
            {keyStats.map((item) => (
              <div
                key={item.label}
                className="border border-slate-200/90 bg-white px-6 py-8 text-center shadow-[0_16px_40px_-24px_rgba(15,23,42,0.18)] transition hover:shadow-[0_20px_48px_-20px_rgba(15,23,42,0.22)]"
              >
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                <p className="mt-4 text-2xl font-light tracking-tight lg:text-3xl">{item.value}</p>
                <p className="mt-2 text-xs font-light text-slate-500">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Lifestyle */}
      <section className="border-t border-slate-200/80 bg-white px-6 py-20 sm:px-12 lg:px-20 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-light tracking-tight sm:text-4xl">Investment Snapshot</h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-[#f8f9fa] p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.25)]">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Price</p>
              <p className="mt-3 text-xl font-medium">$620k–$680k</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-[#f8f9fa] p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.25)]">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Rental Yield</p>
              <p className="mt-3 text-xl font-medium">4–5%</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-[#f8f9fa] p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.25)]">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Land Size</p>
              <p className="mt-3 text-xl font-medium">300–400 sqm</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-[#f8f9fa] p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.25)]">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Configuration</p>
              <p className="mt-3 text-xl font-medium">4 bed / 2 bath / 2 car</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Lifestyle */}
      <section className="border-t border-slate-200/80 bg-[#f8f9fa] px-6 py-20 sm:px-12 lg:px-20 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-light tracking-tight sm:text-4xl">Designed for Your Lifestyle</h2>
          <div className="mt-16 grid gap-12 lg:grid-cols-3 lg:gap-16">
            {lifestyle.map((block) => (
              <div key={block.title} className="border-l-2 border-[#d4af37] pl-8">
                <h3 className="text-xl font-medium tracking-tight">{block.title}</h3>
                <p className="mt-4 font-light leading-relaxed text-slate-600">{block.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why This Property */}
      <section className="px-6 py-20 sm:px-12 lg:px-20 lg:py-28">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-light tracking-tight sm:text-4xl">Why This Opportunity</h2>
          <p className="mt-6 font-light leading-relaxed text-slate-600">
            The following factors are commonly assessed by buyers comparing new house-and-land allocations in
            comparable corridors — presented here as a structured snapshot, not a promise of performance.
          </p>
          <ul className="mt-10 space-y-6 border-t border-slate-200 pt-10">
            {whyPoints.map((line) => (
              <li key={line} className="flex gap-4 font-light leading-relaxed text-slate-700">
                <span className="mt-2 h-px w-8 shrink-0 bg-[#d4af37]" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. 360 Experience */}
      <section
        id="experience-360"
        className="scroll-mt-24 border-t border-slate-800/20 bg-[#0f172a] px-6 py-20 text-white sm:px-12 lg:px-20 lg:py-28"
      >
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#d4af37]">360° experience</p>
          <h2 className="mt-4 text-3xl font-light tracking-tight sm:text-4xl">Explore the Property in 360°</h2>
          <p className="mx-auto mt-6 max-w-2xl font-light leading-relaxed text-white/75">
            Experience the space before you visit.
            <br />
            Make confident decisions with immersive viewing.
          </p>
          <div className="mt-14 overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.5)]">
            <iframe
              title="Property 360° tour"
              src={KUULA_SRC}
              className="h-[min(70vh,640px)] w-full border-0"
              allowFullScreen
              loading="lazy"
              allow="xr-spatial-tracking; gyroscope; accelerometer; fullscreen"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200/80 bg-white px-6 py-20 sm:px-12 lg:px-20 lg:py-24">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 rounded-2xl border border-slate-200 bg-[#f8f9fa] p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-2xl font-light tracking-tight sm:text-3xl">
              Not sure if this property suits you?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Run Compare AI to get a quick readiness view before requesting the full package.
            </p>
          </div>
          <Link
            href="/compare"
            className="inline-flex items-center justify-center border border-[#0f172a] px-8 py-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[#0f172a] transition hover:bg-[#0f172a] hover:text-white"
          >
            Run Compare AI
          </Link>
        </div>
      </section>

      {/* 7. Lead Capture */}
      <section id="lead" className="scroll-mt-24 border-t border-slate-200/80 bg-[#f8f9fa] px-6 py-20 sm:px-12 lg:px-20 lg:py-28">
        <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-2 lg:items-start lg:gap-24">
          <div>
            <h2 className="text-3xl font-light tracking-tight sm:text-4xl">Get the Full Property Report</h2>
            <p className="mt-6 font-light leading-relaxed text-slate-600">
              Receive detailed insights, pricing breakdown, and investment analysis.
            </p>
            <div className="mt-10 h-px w-16 bg-[#d4af37]" />
            <p className="mt-8 text-sm font-light text-slate-500">
              Prefer email?{" "}
              <a href="mailto:info@depropertypro.com" className="text-[#0f172a] underline underline-offset-4">
                info@depropertypro.com
              </a>
            </p>
          </div>
          <div className="border border-slate-200/90 bg-white p-10 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.2)] sm:p-12">
            <HousePackageLeadForm />
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl gap-3">
          <Link
            href="#lead"
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-brand-700"
          >
            Get Full Package
          </Link>
          <Link
            href="/compare"
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-[#0f172a]/20 bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] shadow-lg transition hover:bg-slate-50"
          >
            Run Compare AI
          </Link>
        </div>
      </div>
    </main>
  );
}
