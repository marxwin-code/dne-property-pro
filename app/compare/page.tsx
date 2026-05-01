"use client";

import { FormEvent, useState } from "react";

type CompareForm = {
  age: string;
  income: string;
  savings: string;
  hasProperty: "Yes" | "No";
  email: string;
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

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setFeedback("");

    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: Number(form.age),
          income: Number(form.income),
          savings: Number(form.savings),
          hasProperty: form.hasProperty,
          email: form.email.trim()
        })
      });

      const data = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || data.success !== true) {
        setStatus("error");
        setFeedback(data.message ?? "Something went wrong, please try again");
        return;
      }

      setStatus("success");
      setFeedback("Report sent to your email");
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
      </section>
    </main>
  );
}
