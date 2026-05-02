"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useLanguage } from "../components/language-provider";
import { PropertyListingCard } from "../components/property-listing-card";
import type { Lang } from "@/lib/i18n/text";
import { useSiteText } from "@/lib/i18n/use-site-text";

type LeadLevel = "Hot" | "Warm" | "Cold";

type CompareForm = {
  age: string;
  income: string;
  savings: string;
  hasProperty: "Yes" | "No";
  email: string;
  cityHint: string;
};

type Rec = {
  id: string;
  name: string;
  priceLabel: string;
  location: string;
  image: string;
  description: string;
};

type CompareResult = {
  report: string;
  leadScore: number;
  leadLevel: LeadLevel;
  affordability: "Low" | "Medium" | "High";
  summary: string;
  propertyInsight: string;
  risks: string;
  strategy: string;
  timingLabel: string;
  timing: string;
  recommendedProperties: Rec[];
  salesAdvice: string;
  salesPitch: string;
  budgetEstimate: number;
};

const initialForm: CompareForm = {
  age: "",
  income: "",
  savings: "",
  hasProperty: "No",
  email: "",
  cityHint: ""
};

export default function ComparePage() {
  const { lang } = useLanguage();
  const t = useSiteText();
  const L = t.compare;
  const E = t.errors;
  const [form, setForm] = useState<CompareForm>(initialForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const [result, setResult] = useState<CompareResult | null>(null);
  const [submitted, setSubmitted] = useState<{
    age: string;
    income: string;
    savings: string;
    hasProperty: "Yes" | "No";
  } | null>(null);

  const leadBadgeClass = (level: LeadLevel) => {
    if (level === "Hot") return "border-rose-500/50 bg-rose-500/15 text-rose-200";
    if (level === "Warm") return "border-amber-500/50 bg-amber-500/15 text-amber-200";
    return "border-slate-500/50 bg-slate-600/30 text-slate-300";
  };

  const leadLabel = (level: LeadLevel) => {
    if (level === "Hot") return L.leadHot;
    if (level === "Warm") return L.leadWarm;
    return L.leadCold;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setFeedback("");
    setResult(null);

    try {
      const payload = {
        age: Number(form.age),
        income: Number(form.income),
        savings: Number(form.savings),
        hasProperty: form.hasProperty,
        email: form.email.trim(),
        lang: lang as Lang,
        cityHint: form.cityHint.trim() || undefined
      };

      const compareResponse = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const compareData = (await compareResponse.json()) as {
        success?: boolean;
        message?: string;
        report?: string;
        leadScore?: number;
        leadLevel?: LeadLevel;
        affordability?: "Low" | "Medium" | "High";
        summary?: string;
        propertyInsight?: string;
        risks?: string;
        strategy?: string;
        timing?: string;
        timingLabel?: string;
        recommendedProperties?: Rec[];
        salesAdvice?: string;
        salesPitch?: string;
        budgetEstimate?: number;
      };

      if (!compareResponse.ok || compareData.success !== true) {
        setStatus("error");
        setFeedback(compareData.message ?? E.genericTryAgain);
        return;
      }

      const compareResult: CompareResult = {
        report: compareData.report ?? "",
        leadScore: compareData.leadScore ?? 0,
        leadLevel: compareData.leadLevel ?? "Warm",
        affordability: compareData.affordability ?? "Low",
        summary: compareData.summary ?? "",
        propertyInsight: compareData.propertyInsight ?? "",
        risks: compareData.risks ?? "",
        strategy: compareData.strategy ?? "",
        timingLabel: compareData.timingLabel ?? "",
        timing: compareData.timing ?? "",
        recommendedProperties: compareData.recommendedProperties ?? [],
        salesAdvice: compareData.salesAdvice ?? "",
        salesPitch: compareData.salesPitch ?? "",
        budgetEstimate: compareData.budgetEstimate ?? 0
      };

      const emailResponse = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "compare-report",
          age: payload.age,
          income: payload.income,
          savings: payload.savings,
          hasProperty: payload.hasProperty,
          email: payload.email,
          report: compareResult.report,
          readinessScore: compareResult.leadScore,
          dealScore: compareResult.leadScore,
          leadScore: compareResult.leadScore,
          leadLevel: compareResult.leadLevel,
          salesAdvice: compareResult.salesAdvice,
          salesPitch: compareResult.salesPitch,
          summary: compareResult.summary,
          propertyInsight: compareResult.propertyInsight,
          risks: compareResult.risks,
          strategy: compareResult.strategy,
          timingLabel: compareResult.timingLabel,
          cityHint: form.cityHint.trim(),
          recommendedProperties: compareResult.recommendedProperties
        })
      });

      const emailData = (await emailResponse.json()) as { success?: boolean; message?: string };
      if (!emailResponse.ok || emailData.success !== true) {
        setStatus("error");
        setFeedback(emailData.message ?? E.genericTryAgain);
        return;
      }

      const saveLeadResponse = await fetch("/api/save-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "",
          email: payload.email,
          income: payload.income,
          savings: payload.savings,
          ownership: payload.hasProperty,
          location: form.cityHint.trim(),
          score: compareResult.leadScore
        })
      });

      const saveLeadData = (await saveLeadResponse.json()) as { success?: boolean; message?: string };
      if (!saveLeadResponse.ok || saveLeadData.success !== true) {
        setStatus("error");
        setFeedback(saveLeadData.message ?? E.genericTryAgain);
        return;
      }

      setStatus("success");
      setFeedback(L.success);
      setSubmitted({
        age: form.age,
        income: form.income,
        savings: form.savings,
        hasProperty: form.hasProperty
      });
      setResult(compareResult);
      setForm(initialForm);
    } catch {
      setStatus("error");
      setFeedback(E.genericTryAgain);
    }
  };

  const scorePct = result ? Math.min(100, Math.max(0, result.leadScore)) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#020617] px-4 py-14 text-slate-100 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">{L.pageKicker}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{L.title}</h1>
        <p className="mt-3 text-base text-slate-400">{L.subtitle}</p>
      </div>

      <section className="mx-auto mt-10 max-w-xl rounded-2xl border border-sky-900/50 bg-[#0f172a]/80 p-6 shadow-xl backdrop-blur sm:p-8">
        <form className="grid gap-4 text-left" onSubmit={onSubmit}>
          <label className="text-sm font-medium text-slate-300">
            {L.age}
            <input
              required
              type="number"
              min="0"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-[#020617] px-3 py-2 text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
            />
          </label>

          <label className="text-sm font-medium text-slate-300">
            {L.income}
            <input
              required
              type="number"
              min="0"
              value={form.income}
              onChange={(e) => setForm({ ...form, income: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-[#020617] px-3 py-2 text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
            />
          </label>

          <label className="text-sm font-medium text-slate-300">
            {L.savings}
            <input
              required
              type="number"
              min="0"
              value={form.savings}
              onChange={(e) => setForm({ ...form, savings: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-[#020617] px-3 py-2 text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
            />
          </label>

          <label className="text-sm font-medium text-slate-300">
            {L.property}
            <select
              value={form.hasProperty}
              onChange={(e) => setForm({ ...form, hasProperty: e.target.value as "Yes" | "No" })}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-[#020617] px-3 py-2 text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
            >
              <option value="Yes">{L.yes}</option>
              <option value="No">{L.no}</option>
            </select>
          </label>

          <label className="text-sm font-medium text-slate-300">
            {L.preferredCity}
            <input
              type="text"
              value={form.cityHint}
              onChange={(e) => setForm({ ...form, cityHint: e.target.value })}
              placeholder={L.cityPlaceholder}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-[#020617] px-3 py-2 text-white outline-none transition placeholder:text-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
            />
          </label>

          <label className="text-sm font-medium text-slate-300">
            {L.email}
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-[#020617] px-3 py-2 text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
            />
          </label>

          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? L.generating : L.submit}
          </button>
        </form>

        {status === "success" ? (
          <p className="mt-6 text-center text-sm font-medium text-emerald-400">{feedback}</p>
        ) : null}
        {status === "error" ? (
          <p className="mt-6 text-center text-sm font-medium text-rose-400">
            {feedback || E.genericTryAgain}
          </p>
        ) : null}
      </section>

      {result ? (
        <div className="mx-auto mt-12 max-w-4xl space-y-8">
          <div className="rounded-2xl border border-sky-900/50 bg-[#0f172a]/90 p-8 shadow-xl">
            <h2 className="border-b border-sky-900/60 pb-4 text-xl font-bold text-white">{L.reportTitle}</h2>

            <div className="mt-8 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-400">{L.score}</p>
              <div className="flex flex-wrap items-end gap-4">
                <span className="text-5xl font-extrabold text-white">{result.leadScore}</span>
                <span className="pb-2 text-xl text-slate-500">/100</span>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${leadBadgeClass(result.leadLevel)}`}
                >
                  {L.leadLevel}: {leadLabel(result.leadLevel)}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all duration-700"
                  style={{ width: `${scorePct}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">{L.budgetHint}: ~${result.budgetEstimate.toLocaleString("en-AU")}</p>
            </div>

            <div className="mt-10 border-t border-sky-900/50 pt-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-400">{L.summary}</p>
              <p className="mt-3 text-lg leading-relaxed text-slate-200">{result.summary}</p>
            </div>

            {result.salesPitch ? (
              <div className="mt-10 rounded-2xl border border-sky-500/40 bg-gradient-to-br from-blue-950/80 to-slate-900/90 p-6 shadow-[0_12px_40px_rgba(37,99,235,0.15)]">
                <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">{L.salesInsight}</p>
                <p className="mt-3 text-base font-medium leading-relaxed text-white">{result.salesPitch}</p>
              </div>
            ) : null}

            <div className="mt-10 border-t border-sky-900/50 pt-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-400">{L.salesAdvice}</p>
              <div className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-700/80 bg-[#020617]/80 p-5 text-sm leading-relaxed text-slate-300">
                {result.salesAdvice}
              </div>
            </div>

            <div className="mt-10 border-t border-sky-900/50 pt-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-400">{L.snapshot}</p>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [L.age, submitted?.age || "—"],
                  [L.income, payloadNums(submitted?.income)],
                  [L.savings, payloadNums(submitted?.savings)],
                  [L.property, submitted?.hasProperty === "Yes" ? L.yes : L.no]
                ].map(([k, v]) => (
                  <div
                    key={String(k)}
                    className="rounded-xl border border-slate-700/60 bg-[#020617]/60 px-4 py-3"
                  >
                    <dt className="text-xs text-slate-500">{k}</dt>
                    <dd className="mt-1 font-medium text-white">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-10 border-t border-sky-900/50 pt-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-400">{L.strategy}</p>
              <p className="mt-2 text-sm font-medium text-sky-200">
                {L.timing}: {result.timingLabel}
              </p>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-300">
                <p className="whitespace-pre-wrap">{result.strategy}</p>
                <p>
                  <span className="font-semibold text-white">{L.risks}: </span>
                  {result.risks}
                </p>
              </div>
            </div>

            <div className="mt-10 border-t border-sky-900/50 pt-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-400">{L.recommended}</p>
              <div className="mt-6 grid gap-10 md:grid-cols-3">
                {result.recommendedProperties.map((p) => (
                  <PropertyListingCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    priceLabel={p.priceLabel}
                    location={p.location}
                    image={p.image}
                    description={p.description}
                    ctaHref="/contact"
                    ctaLabel={t.common.bookConsultation}
                  />
                ))}
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4 border-t border-sky-900/50 pt-8 sm:flex-row sm:justify-center">
              <Link
                href="/properties"
                className="inline-flex justify-center rounded-full bg-brand-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                {L.viewProps}
              </Link>
              <Link
                href="/contact"
                className="inline-flex justify-center rounded-full border-2 border-sky-400 px-8 py-3 text-sm font-semibold text-sky-300 transition hover:bg-sky-500/10"
              >
                {L.book}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function payloadNums(_?: string): string {
  return _?.trim() ? _ : "—";
}
