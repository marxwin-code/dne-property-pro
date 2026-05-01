"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
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
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
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
        fullName: "",
        email: "",
        phone: "",
        propertyType: "Residential",
        message: ""
      });
    } catch {
      setStatus("error");
      setErrorDetail("Network error. Check your connection and try again.");
    }
  };

  return (
    <main className="w-full bg-gradient-to-b from-lux-paper via-[#ebe6de] to-lux-paper-deep">
      <section className="border-b border-stone-300/40 bg-gradient-to-br from-lux-ink via-[#141c30] to-lux-surface px-4 py-20 text-center text-white sm:py-24">
        <div className="mx-auto max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-lux-gold">Contact</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Contact Us</h1>
          <p className="text-lg leading-relaxed text-slate-300">
            Let&apos;s discuss how we can help your property or business grow.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <aside className="space-y-8 rounded-2xl border border-stone-400/30 bg-white/75 p-8 shadow-[0_20px_40px_-28px_rgba(12,18,34,0.25)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5">
            <h2 className="text-lg font-semibold text-lux-ink">Reach us directly</h2>
            <dl className="space-y-4 text-sm text-slate-600">
              <div>
                <dt className="font-semibold text-lux-ink">Email</dt>
                <dd className="mt-1">
                  <a
                    href="mailto:info@depropertypro.com"
                    className="text-brand-600 underline-offset-4 hover:underline"
                  >
                    info@depropertypro.com
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-lux-ink">Phone</dt>
                <dd className="mt-1 text-slate-500">— add your number when ready</dd>
              </div>
            </dl>
            <p className="rounded-xl border border-stone-200/80 bg-stone-50/80 px-4 py-3 text-sm text-slate-600">
              We usually respond within 24 hours.
            </p>
            <Link
              href="/#interactive-360-home"
              className="inline-flex text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              ← Back to 360° demo
            </Link>
          </aside>

          <div className="rounded-2xl border border-stone-400/30 bg-white/85 p-8 shadow-[0_20px_40px_-28px_rgba(12,18,34,0.3)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5">
            <h2 className="text-lg font-semibold text-lux-ink">Send a message</h2>
            <p className="mt-2 text-sm text-slate-600">
              Complete the form — we&apos;ll email you at the address you provide.
            </p>
            <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="fullName" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Full Name
                </label>
                <input
                  id="fullName"
                  required
                  type="text"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email Address
                </label>
                <input
                  id="email"
                  required
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Phone Number
                </label>
                <input
                  id="phone"
                  required
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-blue-200"
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
                  className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-blue-200"
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
                  className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-brand-600 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-12"
              >
                {status === "loading" ? "Sending…" : "Send Message"}
              </button>
            </form>
            {status === "success" ? (
              <p className="mt-4 text-sm font-medium text-emerald-700">
                Thanks — we received your message and will reply within 24 hours.
              </p>
            ) : null}
            {status === "error" ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-800">
                <p className="font-medium">Could not send your message.</p>
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
