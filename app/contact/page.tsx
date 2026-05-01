"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

const fieldClass =
  "mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)]";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    propertyType: "Residential",
    message: ""
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorDetail(null);
    try {
      const res = await fetch("/api/contact-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.name,
          email: form.email,
          propertyType: form.propertyType,
          message: form.message
        })
      });

      let data: { success?: boolean; message?: string } = {};
      try {
        data = (await res.json()) as typeof data;
      } catch {
        setStatus("error");
        setErrorDetail("Invalid response from server.");
        return;
      }

      if (!res.ok) {
        setStatus("error");
        setErrorDetail(data.message ?? `Request failed (${res.status}).`);
        return;
      }

      if (data.success !== true) {
        setStatus("error");
        setErrorDetail(data.message ?? "The server did not confirm delivery.");
        return;
      }

      setStatus("success");
      setForm({
        name: "",
        email: "",
        propertyType: "Residential",
        message: ""
      });
    } catch {
      setStatus("error");
      setErrorDetail("Network error. Check your connection and try again.");
    }
  };

  return (
    <main className="w-full bg-gradient-to-b from-slate-100 via-slate-200/90 to-slate-100">
      <section className="border-b border-slate-300/50 bg-gradient-to-br from-lux-ink via-[#141c30] to-lux-surface px-4 py-20 text-center text-white sm:py-24">
        <div className="mx-auto max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-lux-gold">Contact</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Contact Us</h1>
          <p className="text-lg leading-relaxed text-slate-300">
            Let&apos;s discuss how we can help your property or business grow.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <aside className="flex flex-col justify-between space-y-8 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-[0_24px_48px_-20px_rgba(15,23,42,0.18)] lg:min-h-[520px]">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-lux-ink">Reach us directly</h2>
              <p className="text-sm leading-relaxed text-slate-600">
                For business inquiries, partnerships, or property consulting, feel free to reach out
                via email or the form.
              </p>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Business Contact
                </p>
                <a
                  href="mailto:info@depropertypro.com"
                  className="mt-2 inline-block text-lg font-medium text-brand-600 underline-offset-4 transition hover:text-brand-700 hover:underline"
                >
                  info@depropertypro.com
                </a>
              </div>
            </div>
            <div className="space-y-6">
              <p className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm text-slate-600">
                We usually respond within 24 hours.
              </p>
              <Link
                href="/#interactive-360-home"
                className="inline-flex text-sm font-semibold text-brand-600 transition hover:text-brand-700"
              >
                ← Back to 360° demo
              </Link>
            </div>
          </aside>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-[0_28px_56px_-24px_rgba(15,23,42,0.22)] sm:p-10">
            <h2 className="text-xl font-semibold text-lux-ink">Send an inquiry</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              A short note is enough — we&apos;ll reply by email.
            </p>
            <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </label>
                <input
                  id="name"
                  required
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </label>
                <input
                  id="email"
                  required
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="propertyType" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Property Type
                </label>
                <select
                  id="propertyType"
                  value={form.propertyType}
                  onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
                  className={fieldClass}
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className={fieldClass}
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="mt-2 w-full rounded-2xl bg-gradient-to-r from-brand-600 via-blue-600 to-blue-700 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-900/25 transition hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-900/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
              >
                {status === "loading" ? "Sending…" : "Send Inquiry"}
              </button>
            </form>
            {status === "success" ? (
              <p className="mt-4 text-sm font-medium text-emerald-700">
                Thanks — we received your inquiry and will reply within 24 hours.
              </p>
            ) : null}
            {status === "error" ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-800">
                <p className="font-medium">Could not send your inquiry.</p>
                {errorDetail ? <p className="mt-1 text-rose-700">{errorDetail}</p> : null}
                <p className="mt-2 text-rose-700">
                  You can also email{" "}
                  <a href="mailto:info@depropertypro.com" className="font-semibold underline">
                    info@depropertypro.com
                  </a>{" "}
                  directly.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
