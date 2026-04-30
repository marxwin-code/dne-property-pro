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
    <main className="mx-auto flex max-w-6xl flex-col items-center px-4 py-16 text-center sm:py-24">
      <section className="max-w-3xl space-y-5">
        <p className="inline-flex rounded-full bg-brand-100 px-4 py-1 text-sm font-medium text-brand-700">
          D&E Property Pro
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Modern Property &amp; AI Solutions
        </h1>
        <p className="text-lg text-slate-600">
          Property services combined with AI-powered tools
        </p>
        <div className="pt-3">
          <Link
            href="/labs"
            className="inline-flex rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Explore AI Tools
          </Link>
        </div>
      </section>

      <section className="mt-14 grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {homeCards.map((card) => (
          <article
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">{card.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{card.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
