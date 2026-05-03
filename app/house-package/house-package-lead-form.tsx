"use client";

import { FormEvent, useState } from "react";
import { useSiteText } from "@/lib/i18n/use-site-text";

export function HousePackageLeadForm() {
  const t = useSiteText();
  const F = t.house.leadForm;
  const E = t.errors;
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorDetail(null);
    try {
      const emailRes = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "house-package",
          name,
          email,
          message
        })
      });
      let emailData: { success?: boolean; message?: string } = {};
      try {
        emailData = (await emailRes.json()) as typeof emailData;
      } catch {
        setStatus("error");
        setErrorDetail(E.invalidResponse);
        return;
      }
      if (!emailRes.ok) {
        setStatus("error");
        setErrorDetail(emailData.message ?? E.genericTryAgain);
        return;
      }
      if (emailData.success !== true) {
        setStatus("error");
        setErrorDetail(emailData.message ?? E.serverNoConfirm);
        return;
      }

      await fetch("/api/save-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message: message.trim() ? message.trim().slice(0, 8000) : `Source: ${t.house.leadSource}`
        })
      });
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
      setErrorDetail(E.networkRetry);
    }
  };

  const inputClass =
    "w-full border border-slate-300 bg-white px-4 py-3 text-sm text-[#0f172a] outline-none transition focus:border-[#0f172a] focus:ring-2 focus:ring-[#d4af37]/25";

  return (
    <form className="mt-10 grid max-w-md gap-5" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="hp-name" className="block text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
          {F.name}
        </label>
        <input
          id="hp-name"
          required
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`${inputClass} mt-2`}
        />
      </div>
      <div>
        <label htmlFor="hp-email" className="block text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
          {F.email}
        </label>
        <input
          id="hp-email"
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${inputClass} mt-2`}
        />
      </div>
      <div>
        <label
          htmlFor="hp-message"
          className="block text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500"
        >
          {F.message}
        </label>
        <textarea
          id="hp-message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${inputClass} mt-2 resize-none`}
          placeholder={F.messagePlaceholder}
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-2 w-full rounded-xl bg-brand-600 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-white shadow-lg shadow-blue-900/20 transition hover:bg-brand-700 disabled:opacity-50"
      >
        {status === "loading" ? F.sending : F.submit}
      </button>
      {status === "success" ? <p className="text-sm text-emerald-800">{F.thanks}</p> : null}
      {status === "error" ? (
        <p className="text-sm text-red-800">{errorDetail ?? F.errorFallback}</p>
      ) : null}
    </form>
  );
}
