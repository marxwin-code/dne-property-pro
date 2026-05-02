"use client";

import { FormEvent, useState } from "react";

type CompareForm = {
  age: string;
  income: string;
  savings: string;
  hasProperty: "Yes" | "No";
  email: string;
};

type CompareResult = {
  report: string;
  readinessScore: number;
  affordability: "Low" | "Medium" | "High";
  summary: string;
  propertyInsight: string;
};

const initialForm: CompareForm = {
  age: "",
  income: "",
  savings: "",
  hasProperty: "No",
  email: ""
};

export default function ComparePage() {
  const [form, setForm] = useState<CompareForm>(initialForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const [result, setResult] = useState<CompareResult | null>(null);

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
        email: form.email.trim()
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
        readinessScore?: number;
        affordability?: "Low" | "Medium" | "High";
        summary?: string;
        propertyInsight?: string;
      };

      if (!compareResponse.ok || compareData.success !== true) {
        setStatus("error");
        setFeedback(compareData.message ?? "Something went wrong, please try again");
        return;
      }

      const compareResult: CompareResult = {
        report: compareData.report ?? "",
        readinessScore: compareData.readinessScore ?? 0,
        affordability: compareData.affordability ?? "Low",
        summary: compareData.summary ?? "",
        propertyInsight: compareData.propertyInsight ?? ""
      };

      const emailResponse = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "compare-report",
          ...payload,
          ...compareResult
        })
      });

      const emailData = (await emailResponse.json()) as { success?: boolean; message?: string };
      if (!emailResponse.ok || emailData.success !== true) {
        setStatus("error");
        setFeedback(emailData.message ?? "Something went wrong, please try again");
        return;
      }

      const saveLeadResponse = await fetch("/api/save-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "",
          email: payload.email,
          age: payload.age,
          income: payload.income,
          savings: payload.savings,
          propertyOwnership: payload.hasProperty,
          interestProperty:
            compareResult.affordability === "Medium" || compareResult.affordability === "High"
              ? "Premium House & Land Package"
              : "",
          source: "Compare AI"
        })
      });

      const saveLeadData = (await saveLeadResponse.json()) as { success?: boolean; message?: string };
      if (!saveLeadResponse.ok || saveLeadData.success !== true) {
        setStatus("error");
        setFeedback(saveLeadData.message ?? "Something went wrong, please try again");
        return;
      }

      setStatus("success");
      setFeedback("Report sent to your email");
      setResult(compareResult);
      setForm(initialForm);
    } catch {
      setStatus("error");
      setFeedback("Something went wrong, please try again");
    }
  };

  return (
    <main className="mx-auto flex max-w-4xl flex-col items-center px-4 py-16 text-center sm:py-24">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">CompareMe AI</h1>
        <p className="mt-3 text-base text-slate-700">
          Understand your financial position and property potential.
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600">
          Enter your details to receive a personalised property investment report in seconds.
        </p>

        <form className="mx-auto mt-8 grid max-w-xl gap-4 text-left" onSubmit={onSubmit}>
          <label className="text-sm font-medium text-slate-700">
            Age
            <input
              required
              type="number"
              min="0"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Income
            <input
              required
              type="number"
              min="0"
              value={form.income}
              onChange={(e) => setForm({ ...form, income: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Savings
            <input
              required
              type="number"
              min="0"
              value={form.savings}
              onChange={(e) => setForm({ ...form, savings: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Property Ownership
            <select
              value={form.hasProperty}
              onChange={(e) => setForm({ ...form, hasProperty: e.target.value as "Yes" | "No" })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </label>

          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "Generating..." : "Generate My Property Report"}
          </button>
        </form>

        {status === "success" ? (
          <p className="mt-6 text-sm font-medium text-emerald-700">Report sent to your email</p>
        ) : null}
        {status === "error" ? (
          <p className="mt-6 text-sm font-medium text-rose-600">
            {feedback || "Something went wrong, please try again"}
          </p>
        ) : null}

        {result ? (
          <section className="mx-auto mt-10 max-w-2xl space-y-5 text-left">
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-2xl font-semibold text-slate-900">Your Property Readiness</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <p className="rounded-lg bg-white px-4 py-3 text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">Affordability:</span>{" "}
                  {result.affordability}
                </p>
                <p className="rounded-lg bg-white px-4 py-3 text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">Readiness Score:</span>{" "}
                  {result.readinessScore}/100
                </p>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-700">{result.summary}</p>
              <p className="mt-3 text-sm leading-6 text-slate-700">{result.propertyInsight}</p>
              <div className="mt-4 rounded-xl bg-white p-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{result.report}</p>
              </div>
            </article>

            <article className="rounded-2xl border border-lux-gold/40 bg-gradient-to-br from-white to-[#f6f1e4] p-6">
              <h3 className="text-xl font-semibold text-lux-ink">Recommended Property for You</h3>
              {result.affordability === "Medium" || result.affordability === "High" ? (
                <>
                  <p className="mt-3 text-lg font-semibold text-slate-900">
                    Premium House &amp; Land Package
                  </p>
                  <p className="mt-1 text-sm text-slate-700">From $620,000</p>
                  <a
                    href="/house-package"
                    className="mt-5 inline-flex rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                  >
                    View Property
                  </a>
                </>
              ) : (
                <>
                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    Your current profile is early-stage. Start with a readiness plan, then review
                    this package once your borrowing position improves.
                  </p>
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      Premium House &amp; Land Package
                    </p>
                    <p className="mt-1 text-xs text-slate-600">From $620,000</p>
                  </div>
                  <a
                    href="/house-package"
                    className="mt-5 inline-flex rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                  >
                    View Property
                  </a>
                </>
              )}
            </article>
          </section>
        ) : null}
      </section>
    </main>
  );
}
