"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "../components/language-provider";
import type { Lang } from "@/lib/i18n/text";
import { useSiteText } from "@/lib/i18n/use-site-text";

type AxisRisk = "Low" | "Medium" | "High";

type RiskBreakdown = {
  financial: AxisRisk;
  cashflow: AxisRisk;
  location: AxisRisk;
  property: AxisRisk;
  liquidity: AxisRisk;
};

type FullResult = {
  risk_score: number;
  risk_level: string;
  risk_breakdown: RiskBreakdown;
  ai_summary: string;
  ai_summary_en: string;
  recommendation: string;
  recommendation_en: string;
  created_at?: string;
};

type FreeResult = {
  risk_score: number;
  risk_level: string;
  message?: string;
};

const initialForm = {
  income: "",
  savings: "",
  ownership: "No" as "Yes" | "No",
  userLocation: "",
  propPrice: "",
  propLocation: "",
  propType: "apartment" as "apartment" | "house"
};

function axisClass(level: AxisRisk): string {
  if (level === "High") return "text-rose-300 border-rose-500/40 bg-rose-500/10";
  if (level === "Medium") return "text-amber-200 border-amber-500/40 bg-amber-500/10";
  return "text-emerald-300 border-emerald-500/40 bg-emerald-500/10";
}

function axisLabel(
  level: AxisRisk,
  R: { riskHigh: string; riskMedium: string; riskLow: string }
): string {
  if (level === "High") return R.riskHigh;
  if (level === "Medium") return R.riskMedium;
  return R.riskLow;
}

function levelBadgeClass(level: string): string {
  if (level.startsWith("Low")) return "border-emerald-500/50 bg-emerald-500/15 text-emerald-200";
  if (level.startsWith("Medium")) return "border-amber-500/50 bg-amber-500/15 text-amber-200";
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
  const [tierFree, setTierFree] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [lookupStatus, setLookupStatus] = useState<"idle" | "loading" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const [lookupFeedback, setLookupFeedback] = useState("");
  const [fullResult, setFullResult] = useState<FullResult | null>(null);
  const [freeResult, setFreeResult] = useState<FreeResult | null>(null);

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
        const res = await fetch(`/api/risk-report/lookup?email=${encodeURIComponent(e)}`);
        const data = (await res.json()) as Record<string, unknown>;
        if (!res.ok || data.success !== true) {
          setLookupStatus("error");
          setLookupFeedback(
            typeof data.message === "string" ? data.message : "No report found for this email."
          );
          return;
        }
        setFreeResult(null);
        setFullResult({
          risk_score: data.risk_score as number,
          risk_level: data.risk_level as string,
          risk_breakdown: data.risk_breakdown as RiskBreakdown,
          ai_summary: data.ai_summary as string,
          ai_summary_en: data.ai_summary_en as string,
          recommendation: data.recommendation as string,
          recommendation_en: data.recommendation_en as string,
          created_at: typeof data.created_at === "string" ? data.created_at : undefined
        });
        setLookupStatus("idle");
      } catch {
        setLookupStatus("error");
        setLookupFeedback(E.networkError);
      }
    },
    [E.genericTryAgain, E.networkError]
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
    if (!tierFree && !userEmail.trim()) {
      setStatus("error");
      setFeedback(
        (lang as Lang) === "zh" ? "完整报告需要填写邮箱。" : "Email is required for the full report."
      );
      return;
    }
    setStatus("loading");
    setFeedback("");
    setFullResult(null);
    setFreeResult(null);

    const income = Number(form.income);
    const savings = Number(form.savings);
    const price = Number(form.propPrice);

    try {
      const res = await fetch("/api/risk-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: tierFree ? undefined : userEmail.trim(),
          lang: lang as Lang,
          income,
          savings,
          ownership: form.ownership,
          location: form.userLocation.trim(),
          property: {
            price,
            location: form.propLocation.trim(),
            type: form.propType
          },
          tier: tierFree ? "free" : "full"
        })
      });

      const data = (await res.json()) as Record<string, unknown>;

      if (!res.ok || data.success !== true) {
        setStatus("error");
        setFeedback(typeof data.message === "string" ? data.message : E.genericTryAgain);
        return;
      }

      if (tierFree) {
        setFreeResult({
          risk_score: data.risk_score as number,
          risk_level: data.risk_level as string,
          message: typeof data.message === "string" ? data.message : undefined
        });
      } else {
        setFullResult({
          risk_score: data.risk_score as number,
          risk_level: data.risk_level as string,
          risk_breakdown: data.risk_breakdown as RiskBreakdown,
          ai_summary: data.ai_summary as string,
          ai_summary_en: data.ai_summary_en as string,
          recommendation: data.recommendation as string,
          recommendation_en: data.recommendation_en as string
        });
      }
      setStatus("idle");
    } catch {
      setStatus("error");
      setFeedback(E.networkError);
    }
  };

  const scorePct = fullResult
    ? Math.min(100, Math.max(0, fullResult.risk_score))
    : freeResult
      ? Math.min(100, Math.max(0, freeResult.risk_score))
      : 0;

  const breakdownRows: { key: keyof RiskBreakdown; label: string }[] = [
    { key: "financial", label: R.financial },
    { key: "cashflow", label: R.cashflow },
    { key: "location", label: R.location },
    { key: "property", label: R.property },
    { key: "liquidity", label: R.liquidity }
  ];

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
          {!tierFree ? (
            <label className="text-sm font-medium text-slate-300">
              {R.emailForReport}
              <input
                required={!tierFree}
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                autoComplete="email"
                className="mt-1 w-full rounded-lg border border-slate-600 bg-[#020617] px-3 py-2 text-white outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
              />
            </label>
          ) : null}

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
              onChange={(e) => setForm({ ...form, ownership: e.target.value as "Yes" | "No" })}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-[#020617] px-3 py-2 text-white outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
            >
              <option value="No">{t.common.no}</option>
              <option value="Yes">{t.common.yes}</option>
            </select>
          </label>

          <label className="text-sm font-medium text-slate-300">
            {R.userLocation}
            <input
              required
              type="text"
              value={form.userLocation}
              onChange={(e) => setForm({ ...form, userLocation: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-[#020617] px-3 py-2 text-white outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
            />
          </label>

          <label className="text-sm font-medium text-slate-300">
            {R.propPrice}
            <input
              required
              type="number"
              min="0.01"
              step="any"
              value={form.propPrice}
              onChange={(e) => setForm({ ...form, propPrice: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-[#020617] px-3 py-2 text-white outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
            />
          </label>

          <label className="text-sm font-medium text-slate-300">
            {R.propLocation}
            <input
              required
              type="text"
              value={form.propLocation}
              onChange={(e) => setForm({ ...form, propLocation: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-[#020617] px-3 py-2 text-white outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
            />
          </label>

          <label className="text-sm font-medium text-slate-300">
            {R.propType}
            <select
              value={form.propType}
              onChange={(e) => setForm({ ...form, propType: e.target.value as "apartment" | "house" })}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-[#020617] px-3 py-2 text-white outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
            >
              <option value="apartment">{R.typeApt}</option>
              <option value="house">{R.typeHouse}</option>
            </select>
          </label>

          <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={tierFree}
              onChange={(e) => setTierFree(e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-[#020617] text-amber-500 focus:ring-amber-500/40"
            />
            <span>{tierFree ? R.tierFree : R.tierFull}</span>
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

      {freeResult ? (
        <section className="mx-auto mt-12 max-w-xl rounded-2xl border border-amber-900/50 bg-[#0f172a]/90 p-8 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-400/90">{R.riskScoreHeading}</p>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <span className="text-5xl font-extrabold text-white">{freeResult.risk_score}</span>
            <span className="pb-2 text-xl text-slate-500">/100</span>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${levelBadgeClass(freeResult.risk_level)}`}
            >
              {freeResult.risk_level}
            </span>
          </div>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-600 to-emerald-500 transition-all duration-700"
              style={{ width: `${scorePct}%` }}
            />
          </div>
          <p className="mt-6 text-sm text-slate-400">{freeResult.message ?? R.upgradeHint}</p>
        </section>
      ) : null}

      {fullResult ? (
        <div className="mx-auto mt-12 max-w-3xl space-y-8">
          <div className="rounded-2xl border border-amber-900/50 bg-[#0f172a]/90 p-8 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400/90">{R.riskScoreHeading}</p>
            <div className="mt-4 flex flex-wrap items-end gap-4">
              <span className="text-6xl font-extrabold tracking-tight text-white">{fullResult.risk_score}</span>
              <span className="pb-2 text-2xl text-slate-500">/100</span>
            </div>
            <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 transition-all duration-700"
                style={{ width: `${scorePct}%` }}
              />
            </div>

            <div className="mt-8 border-t border-amber-900/40 pt-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400/90">{R.riskLevelHeading}</p>
              <p className="mt-3 text-xl font-semibold text-white">{fullResult.risk_level}</p>
            </div>

            {fullResult.created_at ? (
              <p className="mt-2 text-xs text-slate-500">
                {R.savedAt}: {new Date(fullResult.created_at).toLocaleString()}
              </p>
            ) : null}

            <div className="mt-10 border-t border-amber-900/40 pt-10">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400/90">{R.breakdownTitle}</p>
              <ul className="mt-5 space-y-3">
                {breakdownRows.map((row) => {
                  const level = fullResult.risk_breakdown[row.key];
                  return (
                    <li
                      key={row.key}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium ${axisClass(level)}`}
                    >
                      <span className="text-slate-200">{row.label}</span>
                      <span>{axisLabel(level, R)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-10 border-t border-amber-900/40 pt-10">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400/90">{R.aiTitle}</p>
              <p className="mt-4 text-lg leading-relaxed text-slate-100">
                {(lang as Lang) === "zh" ? fullResult.ai_summary : fullResult.ai_summary_en}
              </p>
            </div>

            <div className="mt-10 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/50 to-[#020617]/90 p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-300/90">{R.recTitle}</p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {(lang as Lang) === "zh" ? fullResult.recommendation : fullResult.recommendation_en}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
