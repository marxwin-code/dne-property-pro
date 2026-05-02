"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useSiteText } from "@/lib/i18n/use-site-text";

type LeadKind = "demo" | "quote";

export default function LabsPage() {
  const t = useSiteText();
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadKind, setLeadKind] = useState<LeadKind>("demo");
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

  const openLeadModal = (kind: LeadKind) => {
    setLeadKind(kind);
    setSubmitState("idle");
    setLeadForm({
      name: "",
      email: "",
      phone: "",
      propertyType: t.common.residential,
      message: ""
    });
    setShowLeadModal(true);
  };

  const modalTitle = leadKind === "demo" ? t.labs.modalDemoTitle : t.labs.modalQuoteTitle;
  const requestTypeLabel = modalTitle;

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
          requestType: requestTypeLabel
        })
      });
      if (!response.ok) {
        throw new Error("fail");
      }
      setSubmitState("success");
    } catch {
      setSubmitState("error");
    }
  };

  const propertyTypes = [
    t.common.residential,
    t.common.commercial,
    t.common.retail,
    t.common.industrial,
    t.common.other
  ];

  return (
    <main className="bg-gradient-to-b from-lux-paper via-[#e8e2d8] to-lux-paper-deep">
      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
        <section className="mx-auto max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-lux-gold-dim">{t.labs.kicker}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-lux-ink sm:text-5xl">{t.labs.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">{t.labs.lead}</p>
        </section>

        <section className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7">
          {t.labs.products.map((product) => (
            <article
              key={product.name}
              className={`flex h-full min-h-[280px] flex-col rounded-2xl border p-8 text-left shadow-[0_20px_40px_-28px_rgba(12,18,34,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_48px_-24px_rgba(12,18,34,0.4)] ${
                product.tone === "blue"
                  ? "border-blue-200/80 bg-gradient-to-br from-white/90 to-blue-50/90"
                  : product.tone === "slate"
                    ? "border-stone-300/60 bg-gradient-to-br from-stone-100/95 to-stone-200/60"
                    : product.tone === "purple"
                      ? "border-purple-200/80 bg-gradient-to-br from-white/90 to-purple-50/90"
                      : "border-lux-gold/30 bg-gradient-to-br from-[#1a2340] via-lux-surface to-lux-ink text-white shadow-lux"
              }`}
            >
              {product.featured && (
                <span className="mb-4 inline-flex w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  {t.labs.featuredBadge}
                </span>
              )}
              <h2
                className={`text-xl font-semibold ${
                  product.tone === "featured" ? "text-white" : "text-slate-900"
                }`}
              >
                {product.name}
              </h2>
              <p
                className={`mt-3 flex-1 text-sm leading-6 ${
                  product.tone === "featured" ? "text-blue-100" : "text-slate-600"
                }`}
              >
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
          className="mx-auto mt-14 max-w-[1200px] rounded-3xl border border-stone-400/30 bg-gradient-to-br from-white/80 via-stone-100/90 to-[#dfe6f5]/50 py-20 text-left shadow-[0_24px_48px_-28px_rgba(12,18,34,0.3)]"
        >
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-lux-ink sm:text-4xl">{t.labs.demoTitle}</h2>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{t.labs.demoLead}</p>
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-xl">
            <iframe
              title={t.labs.iframeTitle}
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
              <h3 className="text-lg font-semibold text-slate-900">{t.labs.featureWalkTitle}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{t.labs.featureWalkBody}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{t.labs.featureHotspotsTitle}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{t.labs.featureHotspotsBody}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{t.labs.featureVideoTitle}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{t.labs.featureVideoBody}</p>
            </div>
          </div>

          <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">{t.labs.businessValueTitle}</h3>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
              {t.labs.businessBullets.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="text-brand-600">—</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => openLeadModal("demo")}
              className="inline-flex rounded-xl bg-brand-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              {t.labs.bookDemo}
            </button>
            <button
              type="button"
              onClick={() => openLeadModal("quote")}
              className="inline-flex rounded-xl border border-brand-600 bg-white px-8 py-3 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-blue-50"
            >
              {t.labs.getQuote}
            </button>
            <button
              type="button"
              onClick={handleRequestDemo}
              className="inline-flex rounded-xl bg-brand-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              {t.labs.requestDemo}
            </button>
          </div>
        </section>
      </div>

      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-2xl font-semibold text-slate-900">{modalTitle}</h3>
            <p className="mt-2 text-sm text-slate-600">{t.labs.modalHint}</p>
            <form className="mt-5 grid gap-4" onSubmit={handleLeadSubmit}>
              <input
                required
                type="text"
                placeholder={t.labs.formName}
                value={leadForm.name}
                onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-blue-200"
              />
              <input
                required
                type="email"
                placeholder={t.labs.formEmail}
                value={leadForm.email}
                onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-blue-200"
              />
              <input
                required
                type="tel"
                placeholder={t.labs.formPhone}
                value={leadForm.phone}
                onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-blue-200"
              />
              <select
                value={leadForm.propertyType}
                onChange={(e) => setLeadForm({ ...leadForm, propertyType: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-blue-200"
              >
                {propertyTypes.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
              <textarea
                placeholder={t.labs.formMessage}
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
                  {t.common.close}
                </button>
                <button
                  type="submit"
                  disabled={submitState === "loading"}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitState === "loading" ? t.common.submitting : t.common.submit}
                </button>
              </div>
            </form>
            {submitState === "success" && (
              <p className="mt-4 text-sm font-medium text-emerald-600">{t.labs.formSuccess}</p>
            )}
            {submitState === "error" && (
              <p className="mt-4 text-sm font-medium text-rose-600">{t.errors.submitFailed}</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
