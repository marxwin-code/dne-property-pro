"use client";

import { FormEvent, useState } from "react";

type CompareForm = {
  age: string;
  income: string;
  savings: string;
  property: string;
};

const initialForm: CompareForm = {
  age: "",
  income: "",
  savings: "",
  property: "no"
};

export default function ComparePage() {
  const [form, setForm] = useState<CompareForm>(initialForm);
  const [showReport, setShowReport] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowReport(true);
  };

  return (
    <main className="mx-auto flex max-w-4xl flex-col items-center px-4 py-16 text-center sm:py-24">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          CompareMe AI
        </h1>
        <p className="mt-3 text-slate-600">
          Enter your details to generate a quick comparison report.
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
            Property (yes/no)
            <select
              value={form.property}
              onChange={(e) => setForm({ ...form, property: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>

          <button
            type="submit"
            className="mt-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Generate Report
          </button>
        </form>

        {showReport && (
          <div className="mx-auto mt-8 max-w-xl rounded-xl bg-brand-50 p-6 text-left">
            <h2 className="text-lg font-semibold text-brand-700">Your Report</h2>
            <ul className="mt-3 space-y-2 text-slate-700">
              <li>Income Rank: Top 35%</li>
              <li>Wealth Rank: Top 30%</li>
              <li>Life Score: 74/100</li>
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
