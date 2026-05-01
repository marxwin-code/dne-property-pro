"use client";

import Link from "next/link";

const products = [
  {
    name: "CompareMe AI",
    description: "Compare your income and financial position with others.",
    button: "Try Now",
    href: "/compare",
    active: true
  },
  {
    name: "Invoice Extract AI",
    description: "Automatically extract invoice data into Excel.",
    button: "Coming Soon",
    href: "#",
    active: false
  },
  {
    name: "Financial Personality AI",
    description: "Discover your money personality and behavioral patterns.",
    button: "Take Test",
    href: "/personality",
    active: true
  }
];

export default function LabsPage() {
  const handleRequestDemo = () => {
    const el = document.getElementById("contact");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      return;
    }
    window.location.href = "/contact";
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          D&amp;E Labs
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          AI tools built to solve real-world problems.
        </p>
      </section>

      <section className="mt-12 grid gap-6 sm:grid-cols-2">
        {products.map((product) => (
          <article
            key={product.name}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm"
          >
            <h2 className="text-xl font-semibold text-slate-900">{product.name}</h2>
            <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
              {product.description}
            </p>
            {product.active ? (
              <Link
                href={product.href}
                className="mt-6 inline-flex w-fit rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                {product.button}
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="mt-6 inline-flex w-fit cursor-not-allowed rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500"
              >
                {product.button}
              </button>
            )}
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-[1200px] py-20 text-left">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            AI Interactive 360° Shop
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
            Let customers explore your space remotely with an immersive 360° experience,
            interactive hotspots, and rich media—built for property and retail showcases.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
          <iframe
            title="AI Interactive 360° Shop — Kuula virtual tour"
            src="https://kuula.co/share/7ZVMR/collection/7LRI8?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1"
            className="h-[360px] w-full md:h-[500px]"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">360° walkthrough</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Navigate the full environment smoothly so visitors feel present before they
              ever step through the door.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Clickable hotspots</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Highlight products, finishes, or listings with tappable points that reveal
              details, specs, and next steps.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Video inside the tour</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Layer in guided clips and storytelling so the experience educates and
              converts—not just displays a room.
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Business value</h3>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
            <li className="flex gap-2">
              <span className="text-brand-600">—</span>
              <span>Increase customer engagement with an interactive, self-serve experience.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand-600">—</span>
              <span>Stand out from competitors with a premium digital first impression.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand-600">—</span>
              <span>Build trust before the in-person visit with transparency and clarity.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand-600">—</span>
              <span>Operate as a 24/7 digital showroom that works while you sleep.</span>
            </li>
          </ul>
        </div>

        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={handleRequestDemo}
            className="inline-flex rounded-xl bg-brand-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Request a Demo
          </button>
        </div>
      </section>
    </main>
  );
}
