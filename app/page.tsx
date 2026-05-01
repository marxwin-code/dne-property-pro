import Link from "next/link";

const KUULA_EMBED_SRC =
  "https://kuula.co/share/collection/7lRH7?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1";

const aiTools = [
  {
    title: "CompareMe AI",
    description: "Compare your income and financial position with peers to sharpen your property decisions.",
    href: "/compare"
  },
  {
    title: "Financial Personality AI",
    description: "Discover your money personality and behavioral patterns to plan smarter next steps.",
    href: "/personality"
  },
  {
    title: "Invoice Extract AI",
    description: "Automatically extract invoice data into structured formats—coming online soon.",
    href: "/labs"
  },
  {
    title: "AI 360",
    description: "Immersive 360° showcases with hotspots and media built for real estate and retail.",
    href: "/#interactive-360-home"
  }
] as const;

export default function HomePage() {
  return (
    <main className="w-full">
      {/* Hero */}
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
            Turn Your Property Into an Interactive 360 Experience
          </h1>
          <p className="text-lg leading-relaxed text-slate-300 sm:text-xl">
            Let customers explore your space online and generate real leads with AI powered tools
          </p>
          <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row sm:gap-4">
            <Link
              href="/#interactive-360-home"
              className="inline-flex w-full items-center justify-center rounded-full bg-brand-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-lux-ink sm:w-auto"
            >
              Start 360 Demo
            </Link>
            <Link
              href="/contact"
              className="inline-flex w-full items-center justify-center rounded-full border border-white/25 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-lux-ink sm:w-auto"
            >
              Get Free Quote
            </Link>
          </div>
        </div>
      </section>

      {/* 360 core — primary conversion surface */}
      <section
        id="interactive-360-home"
        className="scroll-mt-24 border-y border-white/10 bg-gradient-to-br from-[#0a0f1c] via-lux-ink to-[#151d33] px-4 py-16 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.55)] sm:py-24"
      >
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-left text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-lux-gold">
              Flagship product
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.25rem] lg:leading-tight">
              AI Interactive 360 Property Experience
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
              Show your property shop or project in a fully interactive 360 experience perfect for
              real estate and commercial use
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/#interactive-360-preview"
                className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-lux-ink"
              >
                View Live Demo
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-lux-ink"
              >
                Request Pricing
              </Link>
            </div>
          </div>

          <div
            id="interactive-360-preview"
            className="scroll-mt-24 rounded-2xl border border-white/10 bg-black/40 p-3 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.65)] ring-1 ring-white/5"
          >
            <iframe
              title="AI Interactive 360 Property Experience — live preview"
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

      {/* AI tools — 2×2 equal cards */}
      <section className="border-t border-stone-300/40 bg-gradient-to-b from-lux-paper to-lux-paper-deep px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-lux-ink sm:text-4xl">
            AI tools that support your funnel
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Explore add-ons that pair with your 360 experience—same height cards, one clear next
            step.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7">
          {aiTools.map((tool) => (
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
                Explore
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-stone-300/40 bg-gradient-to-br from-lux-ink via-[#141c30] to-lux-surface px-4 py-16 text-center sm:py-20">
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Ready to Get More Leads
          </h2>
          <p className="text-lg leading-relaxed text-slate-300">
            See how 360 and AI can help your business attract customers
          </p>
          <Link
            href="/contact"
            className="inline-flex rounded-full bg-brand-600 px-10 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/25 transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-lux-ink"
          >
            Book Free Consultation
          </Link>
        </div>
      </section>
    </main>
  );
}
