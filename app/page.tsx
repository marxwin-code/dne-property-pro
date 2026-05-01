import Link from "next/link";

const homeCards = [
  {
    title: "Property Services",
    text: "Expert guidance for buying, selling, and building a stronger property strategy."
  },
  {
    title: "AI Automation",
    text: "Smarter workflows that help teams save time and make clearer decisions."
  },
  {
    title: "Data Insights",
    text: "Actionable metrics to improve business performance and financial outcomes."
  }
];

export default function HomePage() {
  return (
    <main className="w-full">
      <section className="relative overflow-hidden bg-gradient-to-br from-lux-ink via-[#141c30] to-lux-surface px-4 py-20 text-center sm:py-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
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
            Modern Property &amp; AI Solutions
          </h1>
          <p className="text-lg leading-relaxed text-slate-300 sm:text-xl">
            Property services combined with AI-powered tools
          </p>
          <div className="pt-2">
            <Link
              href="/labs"
              className="inline-flex rounded-full bg-lux-gold px-8 py-3 text-sm font-semibold text-lux-ink shadow-lux transition hover:bg-[#d4b56e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lux-gold focus-visible:ring-offset-2 focus-visible:ring-offset-lux-ink"
            >
              Explore AI Tools
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-stone-300/40 bg-gradient-to-b from-lux-paper to-lux-paper-deep px-4 py-16 sm:py-20">
        <div className="mx-auto grid w-full max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {homeCards.map((card) => (
            <article
              key={card.title}
              className="flex flex-col rounded-2xl border border-stone-400/25 bg-white/70 p-7 text-left shadow-[0_20px_40px_-28px_rgba(12,18,34,0.35)] backdrop-blur-sm transition hover:border-stone-400/40 hover:shadow-[0_24px_48px_-24px_rgba(12,18,34,0.4)]"
            >
              <div className="mb-4 h-px w-10 bg-gradient-to-r from-lux-gold to-transparent" />
              <h2 className="text-lg font-semibold tracking-tight text-lux-ink">
                {card.title}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                {card.text}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
