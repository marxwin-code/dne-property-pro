"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "../components/language-provider";
import type { Lang } from "@/lib/i18n/text";
import { useSiteText } from "@/lib/i18n/use-site-text";

type CatalogRow = {
  id: string;
  name: string;
  price: number;
  location: string;
  image_url: string;
  description: string;
};

type ReportResult = {
  score: number;
  risk_level: string;
  summary: string;
  recommended_properties: CatalogRow[];
  created_at?: string;
};

const initialForm = {
  name: "",
  income: "",
  savings: "",
  ownership: "no" as "yes" | "no",
  location: ""
};

function levelBadgeClass(level: string): string {
  const l = level.toLowerCase();
  if (l === "low") return "border-emerald-500/50 bg-emerald-500/15 text-emerald-200";
  if (l === "medium") return "border-amber-500/50 bg-amber-500/15 text-amber-200";
  return "border-rose-500/50 bg-rose-500/15 text-rose-200";
}

export function RiskReportClient() {
  const searchParams = useSearchParams();
  const { lang } = useLanguage();
  const t = useSiteText();
  const R = t.riskReport;
  const E = t.errors;

  const [userEmail, setUserEmail] = useState("");
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [lookupStatus, setLookupStatus] = useState<"idle" | "loading" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const [lookupFeedback, setLookupFeedback] = useState("");
  const [result, setResult] = useState<ReportResult | null>(null);

  const runLookup = useCallback(
    async (email: string) => {
      const e = email.trim();
      if (!e) {
        setLookupStatus("error");
        setLookupFeedback(E.genericTryAgain);
        return;
      }
      setLookupStatus("loading");
      setLookupFeedback("");
      try {
        const q = new URLSearchParams({ email: e });
        if (lang === "zh") q.set("lang", "zh");
        const res = await fetch(`/api/risk-report?${q.toString()}`);
        const data = (await res.json()) as Record<string, unknown>;
        if (!res.ok || data.success !== true) {
          setLookupStatus("error");
          setLookupFeedback(typeof data.message === "string" ? data.message : E.genericTryAgain);
          return;
        }
        setResult({
          score: data.score as number,
          risk_level: String(data.risk_level ?? ""),
          summary: String(data.summary ?? ""),
          recommended_properties: (data.recommended_properties as CatalogRow[]) ?? [],
          created_at: typeof data.created_at === "string" ? data.created_at : undefined
        });
        setLookupStatus("idle");
      } catch {
        setLookupStatus("error");
        setLookupFeedback(E.networkError);
      }
    },
    [E.genericTryAgain, E.networkError, lang]
  );

  useEffect(() => {
    const q = searchParams.get("email")?.trim();
    if (q) {
      setUserEmail(q);
      void runLookup(q);
    }
  }, [searchParams, runLookup]);

  const onLookupSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await runLookup(userEmail);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userEmail.trim() || !form.name.trim()) {
      setStatus("error");
      setFeedback((lang as Lang) === "zh" ? "请填写姓名与邮箱。" : "Name and email are required.");
      return;
    }
    setStatus("loading");
    setFeedback("");
    setResult(null);

    const income = Number(form.income);
    const savings = Number(form.savings);

    try {
      const res = await fetch("/api/risk-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: userEmail.trim(),
          income,
          savings,
          ownership: form.ownership,
          location: form.location.trim(),
          lang: lang as Lang
        })
      });

      const data = (await res.json()) as Record<string, unknown>;

      if (!res.ok || data.success !== true) {
        setStatus("error");
        setFeedback(typeof data.message === "string" ? data.message : E.genericTryAgain);
        return;
      }

      setResult({
        score: data.score as number,
        risk_level: String(data.risk_level ?? ""),
        summary: String(data.summary ?? ""),
        recommended_properties: (data.recommended_properties as CatalogRow[]) ?? []
      });
      setStatus("idle");
    } catch {
      setStatus("error");
      setFeedback(E.networkError);
    }
  };

  const scorePct = result ? Math.min(100, Math.max(0, result.score)) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#020617] px-4 py-14 text-slate-100 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/90">{R.pageKicker}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{R.title}</h1>
        <p className="mt-3 text-base text-slate-400">{R.subtitle}</p>
      </div>

      <section className="mx-auto mt-10 max-w-xl rounded-2xl border border-amber-900/40 bg-[#0f172a]/80 p-6 shadow-xl backdrop-blur sm:p-8">
        <h2 className="text-sm font-semibold text-white">{R.retrieveSection}</h2>
        <p className="mt-1 text-xs text-slate-500">{R.retrieveHint}</p>
        <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={onLookupSubmit}>
          <label className="flex-1 text-left text-sm font-medium text-slate-300">
            {R.emailForReport}
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-slate-600 bg-[#020617] px-3 py-2 text-white outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
            />
          </label>
          <button
            type="submit"
            disabled={lookupStatus === "loading"}
            className="shrink-0 rounded-full border border-amber-500/50 bg-amber-500/15 px-6 py-2.5 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/25 disabled:opacity-50"
          >
            {lookupStatus === "loading" ? R.analyzing : R.getMyReport}
          </button>
        </form>
        {lookupStatus === "error" && lookupFeedback ? (
          <p className="mt-3 text-sm text-rose-400">{lookupFeedback}</p>
        ) : null}
      </section>

      <section className="mx-auto mt-10 max-w-xl rounded-2xl border border-amber-900/40 bg-[#0f172a]/80 p-6 shadow-xl backdrop-blur sm:p-8">
        <h2 className="mb-4 text-sm font-semibold text-slate-300">
          {(lang as Lang) === "zh" ? "新建评估" : "New assessment"}
        </h2>
        <form className="grid gap-4 text-left" onSubmit={onSubmit}>
          <label className="text-sm font-medium text-slate-300">
            {(lang as Lang) === "zh" ? "姓名" : "Name"}
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoComplete="name"
              className="mt-1 w-full rounded-lg border border-slate-600 bg-[#020617] px-3 py-2 text-white outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
            />
          </label>

          <label className="text-sm font-medium text-slate-300">
            {R.emailForReport}
            <input
              required
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-slate-600 bg-[#020617] px-3 py-2 text-white outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
            />
          </label>

          <label className="text-sm font-medium text-slate-300">
            {R.income}
            <input
              required
              type="number"
              min="0.01"
              step="any"
              value={form.income}
              onChange={(e) => setForm({ ...form, income: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-[#020617] px-3 py-2 text-white outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
            />
          </label>

          <label className="text-sm font-medium text-slate-300">
            {R.savings}
            <input
              required
              type="number"
              min="0"
              step="any"
              value={form.savings}
              onChange={(e) => setForm({ ...form, savings: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-[#020617] px-3 py-2 text-white outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
            />
          </label>

          <label className="text-sm font-medium text-slate-300">
            {R.ownership}
            <select
              value={form.ownership}
              onChange={(e) => setForm({ ...form, ownership: e.target.value as "yes" | "no" })}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-[#020617] px-3 py-2 text-white outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
            >
              <option value="no">{t.common.no}</option>
              <option value="yes">{t.common.yes}</option>
            </select>
          </label>

          <label className="text-sm font-medium text-slate-300">
            {R.userLocation}
            <input
              required
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-[#020617] px-3 py-2 text-white outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
            />
          </label>

          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-2 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-900/30 transition hover:from-amber-500 hover:to-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? R.analyzing : R.submit}
          </button>
        </form>

        {status === "error" ? (
          <p className="mt-6 text-center text-sm font-medium text-rose-400">{feedback || E.genericTryAgain}</p>
        ) : null}
      </section>

      {result ? (
        <div className="mx-auto mt-12 max-w-4xl space-y-10">
          <div className="rounded-2xl border border-amber-900/50 bg-[#0f172a]/90 p-8 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400/90">{R.riskScoreHeading}</p>
            <div className="mt-4 flex flex-wrap items-end gap-4">
              <span className="text-6xl font-extrabold tracking-tight text-white">{result.score}</span>
              <span className="pb-2 text-2xl text-slate-500">/100</span>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${levelBadgeClass(result.risk_level)}`}
              >
                {result.risk_level}
              </span>
            </div>
            <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 transition-all duration-700"
                style={{ width: `${scorePct}%` }}
              />
            </div>

            <div className="mt-10 border-t border-amber-900/40 pt-10">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                {(lang as Lang) === "zh" ? "摘要" : "Summary"}
              </p>
              <p className="mt-4 text-lg leading-relaxed text-slate-100">{result.summary}</p>
            </div>

            {result.created_at ? (
              <p className="mt-6 text-xs text-slate-500">
                {R.savedAt}: {new Date(result.created_at).toLocaleString()}
              </p>
            ) : null}
          </div>

          {result.recommended_properties.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                {(lang as Lang) === "zh" ? "推荐房源" : "Recommended properties"}
              </p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {result.recommended_properties.map((p) => (
                  <article
                    key={p.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a]/95 shadow-lg"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                      {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary https URLs from Airtable */}
                      <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white">{p.name}</h3>
                      <p className="mt-1 text-sm text-amber-200/90">
                        {p.price > 0 ? `$${p.price.toLocaleString("en-AU")}` : "—"}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">{p.location}</p>
                      {p.description ? (
                        <p className="mt-3 text-sm text-slate-400 line-clamp-3">{p.description}</p>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
