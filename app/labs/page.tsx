"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const products = [
  {
    name: "CompareMe AI",
    description: "Compare your income and financial position with others.",
    button: "Explore",
    href: "/compare",
    active: true,
    tone: "blue",
    featured: false
  },
  {
    name: "Invoice Extract AI",
    description: "Automatically extract invoice data into Excel.",
    button: "Coming Soon",
    href: "#",
    active: false,
    tone: "slate",
    featured: false
  },
  {
    name: "Financial Personality AI",
    description: "Discover your money personality and behavioral patterns.",
    button: "Start",
    href: "/personality",
    active: true,
    tone: "purple",
    featured: false
  },
  {
    name: "AI Interactive 360° Shop",
    description:
      "Let customers explore your space remotely with an immersive 360° experience, interactive hotspots, and video integration.",
    button: "View Live Demo",
    href: "#interactive-360-demo",
    active: true,
    tone: "featured",
    featured: true
  }
];

export default function LabsPage() {
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadType, setLeadType] = useState<"Book a Demo" | "Get a Quote">("Book a Demo");
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    phone: "",
    propertyType: "Residential",
    message: ""
  });

  const handleRequestDemo = () => {
    const el = document.getElementById("contact");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      return;
    }
    window.location.href = "/contact";
  };

  const openLeadModal = (type: "Book a Demo" | "Get a Quote") => {
    setLeadType(type);
    setSubmitState("idle");
    setShowLeadModal(true);
  };

  const handleLeadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitState("loading");
    try {
      const response = await fetch("/api/send-demo-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...leadForm,
          requestType: leadType
        })
      });
      if (!response.ok) {
        throw new Error("Failed to submit form");
      }
      setSubmitState("success");
    } catch {
      setSubmitState("error");
    }
  };

  return (
    <main className="bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          AI Tools That Generate Real Business Value
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Explore powerful AI solutions designed for property and commercial use
        </p>
      </section>

      <section className="mt-12 grid gap-6 sm:grid-cols-2">
        {products.map((product) => (
          <article key={product.name} className={`flex flex-col rounded-2xl border p-8 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
              product.tone === "blue"
                ? "border-blue-200 bg-blue-50/70"
                : product.tone === "slate"
                  ? "border-slate-200 bg-slate-100/80"
                  : product.tone === "purple"
                    ? "border-purple-200 bg-purple-50/70"
                    : "border-blue-300 bg-gradient-to-br from-blue-700 to-indigo-700 text-white shadow-lg sm:col-span-2"
            }`}>
            {product.featured && (
              <span className="mb-4 inline-flex w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                Featured
              </span>
            )}
            <h2 className={`text-xl font-semibold ${product.tone === "featured" ? "text-white" : "text-slate-900"}`}>
              {product.name}
            </h2>
            <p className={`mt-3 flex-1 text-sm leading-6 ${product.tone === "featured" ? "text-blue-100" : "text-slate-600"}`}>
              {product.description}
            </p>
            {product.active ? (
              <Link
                href={product.href}
                className={`mt-6 inline-flex w-fit rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                  product.tone === "featured"
                    ? "bg-white text-blue-700 hover:bg-blue-50"
                    : "bg-brand-600 text-white hover:bg-brand-700"
                }`}
              >
                {product.button}
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="mt-6 inline-flex w-fit cursor-not-allowed rounded-lg border border-slate-300 bg-transparent px-5 py-2.5 text-sm font-semibold text-slate-500"
              >
                {product.button}
              </button>
            )}
          </article>
        ))}
      </section>

      <section
        id="interactive-360-demo"
        className="mx-auto mt-14 max-w-[1200px] rounded-3xl border border-blue-200 bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100 py-20 text-left shadow-sm"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            AI Interactive 360° Shop
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
            Let customers explore your space remotely with an immersive 360° experience,
            interactive hotspots, and rich media—built for property and retail showcases.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-xl">
          <iframe
            title="AI Interactive 360° Shop — Kuula virtual tour"
            src="https://kuula.co/share/collection/7lRH7?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1"
            className="relative z-10 h-[600px] w-full rounded-2xl border-0 bg-white pointer-events-auto"
            allowFullScreen
            loading="lazy"
            scrolling="no"
            allow="xr-spatial-tracking; gyroscope; accelerometer; fullscreen"
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

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => openLeadModal("Book a Demo")}
            className="inline-flex rounded-xl bg-brand-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Book a Demo
          </button>
          <button
            type="button"
            onClick={() => openLeadModal("Get a Quote")}
            className="inline-flex rounded-xl border border-brand-600 bg-white px-8 py-3 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-blue-50"
          >
            Get a Quote
          </button>
          <button
            type="button"
            onClick={handleRequestDemo}
            className="inline-flex rounded-xl bg-brand-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Request a Demo
          </button>
        </div>
      </section>
      </div>

      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-2xl font-semibold text-slate-900">{leadType}</h3>
            <p className="mt-2 text-sm text-slate-600">
              Fill in your details and we will contact you within 24 hours.
            </p>
            <form className="mt-5 grid gap-4" onSubmit={handleLeadSubmit}>
              <input
                required
                type="text"
                placeholder="Name"
                value={leadForm.name}
                onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-blue-200"
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={leadForm.email}
                onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-blue-200"
              />
              <input
                required
                type="tel"
                placeholder="Phone"
                value={leadForm.phone}
                onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-blue-200"
              />
              <select
                value={leadForm.propertyType}
                onChange={(e) => setLeadForm({ ...leadForm, propertyType: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-blue-200"
              >
                <option>Residential</option>
                <option>Commercial</option>
                <option>Retail</option>
                <option>Industrial</option>
                <option>Other</option>
              </select>
              <textarea
                placeholder="Message"
                rows={4}
                value={leadForm.message}
                onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-blue-200"
              />
              <div className="mt-1 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowLeadModal(false);
                    setSubmitState("idle");
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submitState === "loading"}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitState === "loading" ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
            {submitState === "success" && (
              <p className="mt-4 text-sm font-medium text-emerald-600">
                Thanks, we will contact you within 24 hours.
              </p>
            )}
            {submitState === "error" && (
              <p className="mt-4 text-sm font-medium text-rose-600">
                Submission failed. Please try again.
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
