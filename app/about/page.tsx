import Link from "next/link";

const paragraphs = [
  "D&E Property Pro is a modern property consulting and digital solutions company combining real-world experience with AI-powered tools. We help property owners, investors, and businesses make smarter decisions, present their assets better, and generate real business results.",
  "In today’s market, properties are not just about location or price — they are about how effectively they are presented, analyzed, and marketed. Many property owners struggle with low visibility, inefficient processes, and lack of data-driven decisions. We bridge this gap by combining property expertise with practical AI solutions.",
  "Our services cover property consulting, strategy planning, AI automation, and interactive digital experiences such as 360° property showcases. We focus on delivering tools that are not just innovative, but actually usable and valuable in real business scenarios.",
  "We work with real estate professionals, commercial property owners, small business operators, and developers who want to modernize their operations and attract more clients.",
  "Our goal is simple: use technology to create real business value. Not hype, not theory — only solutions that help you get more leads, improve efficiency, and close more deals."
];

export default function AboutPage() {
  return (
    <main className="w-full bg-gradient-to-b from-lux-paper via-[#ebe6de] to-lux-paper-deep">
      <section className="border-b border-stone-300/40 bg-gradient-to-br from-lux-ink via-[#141c30] to-lux-surface px-4 py-20 text-center text-white sm:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-lux-gold">About</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">About D&amp;E Property Pro</h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-8 px-4 py-20 sm:py-24">
        {paragraphs.map((text, i) => (
          <article
            key={i}
            className="rounded-2xl border border-stone-400/25 bg-white/75 p-8 shadow-[0_20px_40px_-28px_rgba(12,18,34,0.3)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_48px_-24px_rgba(12,18,34,0.35)]"
          >
            <p className="text-base leading-relaxed text-slate-700">{text}</p>
          </article>
        ))}
      </section>

      <section className="border-t border-stone-300/40 bg-gradient-to-br from-white/60 to-stone-200/50 px-4 py-20 text-center sm:py-24">
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="text-2xl font-semibold text-lux-ink">Ready to work together?</h2>
          <p className="text-slate-600">
            Tell us about your property or business goals — we&apos;ll respond with clear next steps.
          </p>
          <Link
            href="/contact"
            className="inline-flex rounded-full bg-brand-600 px-10 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
          >
            Work With Us
          </Link>
        </div>
      </section>
    </main>
  );
}
